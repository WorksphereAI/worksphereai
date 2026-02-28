// src/services/offlineSyncService.ts
import { supabase } from '../lib/supabase';

interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table: string;
  recordId?: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

// interface OfflineCache {
//   [table: string]: {
//     [id: string]: any;
//     lastSync: number;
//   };
// }

export class OfflineSyncService {
  private db: IDBDatabase | null = null;
  private deviceId: string = '';
  private syncInProgress: boolean = false;
  private syncQueue: SyncQueueItem[] = [];
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.init();
  }

  async init() {
    // Initialize IndexedDB
    this.db = await this.initIndexedDB();
    
    // Get or create device ID
    this.deviceId = await this.getDeviceId();
    
    // Load sync queue from IndexedDB
    await this.loadSyncQueue();
    
    // Setup network listener
    this.setupNetworkListener();
    
    // Register device with server
    await this.registerDevice();
  }

  private async initIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('WorkSphereOffline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create stores for each table
        if (!db.objectStoreNames.contains('messages')) {
          db.createObjectStore('messages', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('tasks')) {
          db.createObjectStore('tasks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('approvals')) {
          db.createObjectStore('approvals', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata');
        }
      };
    });
  }

  private async getDeviceId(): Promise<string> {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  private async registerDevice() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const deviceInfo = {
      user_id: user.id,
      device_id: this.deviceId,
      device_name: this.getDeviceName(),
      device_type: 'web',
      platform: navigator.platform,
      last_active: new Date().toISOString()
    };

    await supabase.rpc('register_device', deviceInfo);
  }

  private getDeviceName(): string {
    return `${navigator.platform} - ${navigator.userAgent.split(' ')[0]}`;
  }

  private setupNetworkListener() {
    window.addEventListener('online', () => {
      console.log('Network connected - processing sync queue');
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      console.log('Network disconnected - entering offline mode');
    });
  }

  private async loadSyncQueue() {
    if (!this.db) return;
    
    const transaction = this.db.transaction('syncQueue', 'readonly');
    const store = transaction.objectStore('syncQueue');
    const request = store.getAll();
    
    request.onsuccess = () => {
      this.syncQueue = request.result || [];
    };
  }

  // Save data to local cache
  async saveToCache(table: string, data: any) {
    if (!this.db) return;
    
    const transaction = this.db.transaction(table, 'readwrite');
    const store = transaction.objectStore(table);
    store.put(data);
    
    // Update metadata
    const metaTransaction = this.db.transaction('metadata', 'readwrite');
    const metaStore = metaTransaction.objectStore('metadata');
    metaStore.put(Date.now(), `${table}_lastSync`);
    
    this.notifyListeners(`${table}:updated`, data);
  }

  // Save multiple records to cache
  async saveBatchToCache(table: string, records: any[]) {
    if (!this.db || records.length === 0) return;
    
    const transaction = this.db.transaction(table, 'readwrite');
    const store = transaction.objectStore(table);
    
    for (const record of records) {
      store.put(record);
    }
    
    const metaTransaction = this.db.transaction('metadata', 'readwrite');
    const metaStore = metaTransaction.objectStore('metadata');
    metaStore.put(Date.now(), `${table}_lastSync`);
  }

  // Get data from cache
  async getFromCache(table: string, id: string): Promise<any | null> {
    if (!this.db) return null;
    
    const transaction = this.db.transaction(table, 'readonly');
    const store = transaction.objectStore(table);
    const request = store.get(id);
    
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  // Get all data from cache
  async getAllFromCache(table: string): Promise<any[]> {
    if (!this.db) return [];
    
    const transaction = this.db.transaction(table, 'readonly');
    const store = transaction.objectStore(table);
    const request = store.getAll();
    
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  // Query cache with filters
  async queryCache(table: string, predicate: (item: any) => boolean): Promise<any[]> {
    const all = await this.getAllFromCache(table);
    return all.filter(predicate);
  }

  // Queue operation for sync
  async queueOperation(operation: 'create' | 'update' | 'delete', table: string, data: any, recordId?: string) {
    if (!this.db) return;

    const queueItem: SyncQueueItem = {
      id: crypto.randomUUID(),
      operation,
      table,
      recordId,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    // Save to local queue
    const transaction = this.db.transaction('syncQueue', 'readwrite');
    const store = transaction.objectStore('syncQueue');
    store.add(queueItem);
    
    this.syncQueue.push(queueItem);

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.processSyncQueue();
    }
  }

  // Process sync queue
  async processSyncQueue() {
    if (this.syncInProgress || this.syncQueue.length === 0) return;
    
    this.syncInProgress = true;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Process items in order
      for (let i = 0; i < this.syncQueue.length; i++) {
        const item = this.syncQueue[i];
        
        try {
          // Update status in database
          await supabase.from('offline_sync_queue').insert({
            organization_id: user.user_metadata?.organization_id,
            user_id: user.id,
            device_id: this.deviceId,
            operation_type: item.operation,
            table_name: item.table,
            record_id: item.recordId,
            data: item.data,
            status: 'processing'
          });

          // Perform operation based on type
          let result;
          switch (item.operation) {
            case 'create':
              result = await supabase.from(item.table).insert(item.data);
              break;
            case 'update':
              result = await supabase.from(item.table).update(item.data).eq('id', item.recordId);
              break;
            case 'delete':
              result = await supabase.from(item.table).delete().eq('id', item.recordId);
              break;
          }

          if (result?.error) throw result.error;

          // Remove from queue
          await this.removeFromQueue(item.id);
          
        } catch (error: any) {
          console.error('Sync error:', error);
          
          // Increment retry count
          item.retryCount++;
          
          // Update queue item
          const tx = this.db!.transaction('syncQueue', 'readwrite');
          const store = tx.objectStore('syncQueue');
          store.put(item);

          // Log error to server
          await supabase.from('offline_sync_queue')
            .update({
              status: 'failed',
              error_message: error.message,
              retry_count: item.retryCount
            })
            .eq('id', item.id);
        }
      }
      
    } finally {
      this.syncInProgress = false;
    }
  }

  private async removeFromQueue(queueId: string) {
    if (!this.db) return;
    
    // Remove from IndexedDB
    const transaction = this.db.transaction('syncQueue', 'readwrite');
    const store = transaction.objectStore('syncQueue');
    store.delete(queueId);
    
    // Remove from memory
    this.syncQueue = this.syncQueue.filter(item => item.id !== queueId);
  }

  // Subscribe to changes
  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  private notifyListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  // Get sync status
  async getSyncStatus(): Promise<{
    pending: number;
    lastSync: number | null;
    isOnline: boolean;
  }> {
    const lastSync = localStorage.getItem('lastSync');
    
    return {
      pending: this.syncQueue.length,
      lastSync: lastSync ? parseInt(lastSync) : null,
      isOnline: navigator.onLine
    };
  }

  // Clear cache
  async clearCache() {
    if (!this.db) return;
    
    const tables = ['messages', 'tasks', 'files', 'approvals', 'syncQueue', 'metadata'];
    
    for (const table of tables) {
      const transaction = this.db.transaction(table, 'readwrite');
      const store = transaction.objectStore(table);
      store.clear();
    }
    
    this.syncQueue = [];
  }

  // Sync data from server
  async syncFromServer(table: string) {
    if (!navigator.onLine) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get last sync timestamp
      const lastSync = localStorage.getItem(`${table}_lastSync`) || '1970-01-01T00:00:00Z';

      // Fetch data from server
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .gte('updated_at', lastSync);

      if (error) throw error;

      // Save to local cache
      if (data && data.length > 0) {
        await this.saveBatchToCache(table, data);
        
        // Update last sync timestamp
        localStorage.setItem(`${table}_lastSync`, new Date().toISOString());
        
        // Update cache metadata on server
        await supabase.rpc('update_cache_metadata', {
          p_user_id: user.id,
          p_device_id: this.deviceId,
          p_table_name: table,
          p_record_count: data.length
        });
      }

      return data;
    } catch (error) {
      console.error('Sync from server error:', error);
      return null;
    }
  }
}

export const offlineSync = new OfflineSyncService();
