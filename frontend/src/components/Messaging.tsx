import React, { useState, useEffect, useRef } from 'react'
import { 
  Send, 
  Paperclip, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Info,
  Users,
  Hash,
  Lock
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { uploadFile } from '../lib/cloudinary'

interface Message {
  id: string
  content?: string
  sender_id: string
  channel_id?: string
  recipient_id?: string
  file_urls?: string[]
  file_types?: string[]
  created_at: string
  sender?: {
    full_name: string
    avatar_url?: string
  }
}

interface Channel {
  id: string
  name: string
  type: 'department' | 'project' | 'direct' | 'announcement'
  members?: string[]
  department_id?: string
}

interface MessagingProps {
  user: any
  selectedChannel?: Channel
  onChannelSelect: (channel: Channel) => void
}

export const Messaging: React.FC<MessagingProps> = ({ user, selectedChannel, onChannelSelect }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [channels, setChannels] = useState<Channel[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadChannels()
    if (selectedChannel) {
      loadMessages(selectedChannel.id)
      subscribeToMessages(selectedChannel.id)
    }
  }, [selectedChannel, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChannels = async () => {
    try {
      const { data } = await supabase
        .from('channels')
        .select(`
          *,
          department:department_id (name)
        `)
        .or(`members.cs.{${user.id}},type.eq.announcement`)
        .eq('organization_id', user.organization_id)

      if (data) {
        setChannels(data)
      }
    } catch (error) {
      console.error('Error loading channels:', error)
    }
  }

  const loadMessages = async (channelId: string) => {
    try {
      const { data } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (full_name, avatar_url)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const subscribeToMessages = (channelId: string) => {
    const subscription = supabase
      .channel(`messages:${channelId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          const newMessage = payload.new as Message
          // Fetch sender info
          supabase
            .from('users')
            .select('full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single()
            .then(({ data: sender }) => {
              if (sender) {
                setMessages(prev => [...prev, { ...newMessage, sender }])
              }
            })
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          sender_id: user.id,
          channel_id: selectedChannel.id
        })

      if (error) throw error

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0 || !selectedChannel) return

    setUploading(true)
    try {
      const uploadedUrls = []
      const uploadedTypes = []

      for (const file of Array.from(files)) {
        const url = await uploadFile(file)
        uploadedUrls.push(url)
        uploadedTypes.push(file.type)
      }

      await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          channel_id: selectedChannel.id,
          file_urls: uploadedUrls,
          file_types: uploadedTypes
        })
    } catch (error) {
      console.error('Error uploading files:', error)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'department':
        return <Users className="w-4 h-4" />
      case 'project':
        return <Hash className="w-4 h-4" />
      case 'direct':
        return <Lock className="w-4 h-4" />
      case 'announcement':
        return <Info className="w-4 h-4" />
      default:
        return <Hash className="w-4 h-4" />
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="flex h-full bg-white">
      {/* Channels Sidebar */}
      <div className="w-64 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {channels
              .filter(channel => 
                channel.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onChannelSelect(channel)}
                  className={`w-full text-left px-3 py-2 rounded-lg mb-1 flex items-center space-x-2 transition-colors duration-200 ${
                    selectedChannel?.id === channel.id
                      ? 'bg-brand-50 text-brand-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {getChannelIcon(channel.type)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{channel.name}</div>
                    {channel.department_id && (
                      <div className="text-xs text-gray-500">Department ID: {channel.department_id}</div>
                    )}
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getChannelIcon(selectedChannel.type)}
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedChannel.name}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedChannel.type === 'department' ? 'Department Channel' : 
                     selectedChannel.type === 'project' ? 'Project Channel' :
                     selectedChannel.type === 'announcement' ? 'Announcement' : 'Direct Message'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {messages.map((message) => (
                <div key={message.id} className="mb-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={message.sender?.avatar_url || `https://ui-avatars.com/api/?name=${message.sender?.full_name}`}
                      alt={message.sender?.full_name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {message.sender?.full_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                      
                      {message.content && (
                        <div className="text-gray-800 whitespace-pre-wrap">
                          {message.content}
                        </div>
                      )}
                      
                      {message.file_urls && message.file_urls.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.file_urls.map((url, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
                                📎 {message.file_types?.[index]?.split('/')[1]?.toUpperCase() || 'File'}
                              </div>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-600 hover:text-brand-700 text-sm transition-colors duration-200"
                              >
                                Open
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={`Message ${selectedChannel.name}...`}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  disabled={loading}
                />

                <button
                  onClick={sendMessage}
                  disabled={loading || !newMessage.trim()}
                  className="btn btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
              
              {uploading && (
                <div className="mt-2 text-sm text-gray-500">
                  Uploading files...
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Hash className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a channel
              </h3>
              <p className="text-gray-500">
                Choose a channel from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
