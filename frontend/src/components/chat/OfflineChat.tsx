// src/components/chat/OfflineChat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { offlineSync } from '../../services/offlineSyncService';
import { supabase } from '../../lib/supabase';
import { 
  CloudOff, Cloud, Wifi, WifiOff, Send, Paperclip, 
  CheckCircle, AlertCircle, Clock
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  channel_id?: string;
  created_at: string;
  syncStatus?: 'synced' | 'pending' | 'failed';
  attachments?: any[];
}

interface OfflineChatProps {
  channelId: string;
  className?: string;
}

export const OfflineChat: React.FC<OfflineChatProps> = ({ channelId, className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<{
    pending: number;
    lastSync: number | null;
  }>({ pending: 0, lastSync: null });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
    setupNetworkListener();
    setupSyncListener();
    getCurrentUser();

    return () => {
      // Cleanup listeners
    };
  }, [channelId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    
    // Try to load from cache first
    const cachedMessages = await offlineSync.queryCache(
      'messages',
      (msg) => msg.channel_id === channelId
    );
    
    if (cachedMessages.length > 0) {
      setMessages(cachedMessages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ));
    }
    
    // If online, fetch from server and update cache
    if (navigator.onLine) {
      await fetchMessagesFromServer();
    }
    
    setLoading(false);
  };

  const fetchMessagesFromServer = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Update cache with server data
      if (data) {
        await offlineSync.saveBatchToCache('messages', data);
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages from server:', error);
    }
  };

  const setupNetworkListener = () => {
    const handleOnline = () => {
      setIsOnline(true);
      updateSyncStatus();
      fetchMessagesFromServer();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  const setupSyncListener = () => {
    const unsubscribe = offlineSync.subscribe('sync:completed', () => {
      updateSyncStatus();
    });

    return unsubscribe;
  };

  const updateSyncStatus = async () => {
    const status = await offlineSync.getSyncStatus();
    setSyncStatus({
      pending: status.pending,
      lastSync: status.lastSync
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const tempId = `temp-${Date.now()}`;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const message: Message = {
      id: tempId,
      content: newMessage.trim(),
      sender_id: user.id,
      sender_name: user.user_metadata?.full_name || user.email || 'Unknown',
      channel_id: channelId,
      created_at: new Date().toISOString(),
      syncStatus: 'pending'
    };

    // Add to UI immediately
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setSending(true);
    
    // Scroll to bottom
    scrollToBottom();

    try {
      if (navigator.onLine) {
        // Try to send immediately if online
        const { data, error } = await supabase
          .from('messages')
          .insert([{
            content: message.content,
            channel_id: channelId,
            sender_id: user.id
          }])
          .select()
          .single();

        if (error) throw error;

        // Update message with server data
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, id: data.id, syncStatus: 'synced' as const }
            : msg
        ));

        // Update cache
        await offlineSync.saveToCache('messages', data);
      } else {
        // Queue for sync if offline
        await offlineSync.queueOperation(
          'create',
          'messages',
          message,
          tempId
        );

        // Save to cache
        await offlineSync.saveToCache('messages', message);
      }

      // Update sync status
      updateSyncStatus();
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Mark as failed and queue for retry
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, syncStatus: 'failed' as const }
          : msg
      ));

      // Queue for retry
      await offlineSync.queueOperation(
        'create',
        'messages',
        message,
        tempId
      );
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const retryFailedMessages = async () => {
    const failedMessages = messages.filter(msg => msg.syncStatus === 'failed');
    
    for (const message of failedMessages) {
      try {
        if (navigator.onLine) {
          const { data, error } = await supabase
            .from('messages')
            .insert([{
              content: message.content,
              channel_id: channelId,
              sender_id: message.sender_id
            }])
            .select()
            .single();

          if (error) throw error;

          // Update message
          setMessages(prev => prev.map(msg => 
            msg.id === message.id 
              ? { ...msg, id: data.id, syncStatus: 'synced' as const }
              : msg
          ));

          // Update cache
          await offlineSync.saveToCache('messages', data);
        }
      } catch (error) {
        console.error('Error retrying message:', error);
      }
    }
  };

  const renderMessage = (message: Message) => {
    const isOwn = message.sender_id === currentUserId;
    
    return (
      <div 
        key={message.id}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwn 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-800'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium">
              {message.sender_name}
            </span>
            {message.syncStatus === 'pending' && (
              <Clock size={12} className="text-yellow-300" />
            )}
            {message.syncStatus === 'failed' && (
              <AlertCircle size={12} className="text-red-300" />
            )}
            {message.syncStatus === 'synced' && (
              <CheckCircle size={12} className="text-green-300" />
            )}
          </div>
          
          <p className="text-sm break-words">{message.content}</p>
          
          <div className="flex items-center justify-between mt-1">
            <span className={`text-xs ${
              isOwn ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            
            {message.syncStatus === 'failed' && (
              <button
                onClick={() => retryFailedMessages()}
                className="text-xs text-red-300 hover:text-red-200 ml-2"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      
      {/* Sync Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-4">
          {isOnline ? (
            <div className="flex items-center gap-2 text-green-600">
              <Wifi size={16} />
              <span className="text-sm font-medium">Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-orange-600">
              <WifiOff size={16} />
              <span className="text-sm font-medium">Offline</span>
            </div>
          )}
          
          {syncStatus.pending > 0 && (
            <div className="flex items-center gap-2 text-blue-600">
              <Cloud size={16} />
              <span className="text-sm">
                {syncStatus.pending} pending
              </span>
            </div>
          )}
        </div>
        
        {syncStatus.lastSync && (
          <span className="text-xs text-gray-500">
            Last sync: {new Date(syncStatus.lastSync).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <CloudOff size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No messages yet</p>
            <p className="text-sm">
              {isOnline 
                ? 'Start the conversation!' 
                : 'You can send messages offline, they will sync when you\'re back online.'
              }
            </p>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Bar */}
      <div className="border-t border-gray-200 px-4 py-3">
        <div className="flex items-end gap-2">
          <button 
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>
          
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={
                isOnline 
                  ? "Type a message..." 
                  : "Type a message (will sync when online)"
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              disabled={sending}
            />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className={`p-2 rounded-lg transition-colors ${
              newMessage.trim() && !sending
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        
        {!isOnline && (
          <div className="mt-2 text-xs text-orange-600 flex items-center gap-1">
            <CloudOff size={12} />
            <span>Offline mode - messages will sync when connection is restored</span>
          </div>
        )}
      </div>
    </div>
  );
};
