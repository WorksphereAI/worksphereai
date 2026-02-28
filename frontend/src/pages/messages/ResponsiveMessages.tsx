import React, { useState, useEffect } from 'react';
import { ResponsiveGrid } from '../../components/ui/ResponsiveGrid';
import { ResponsiveCard } from '../../components/ui/ResponsiveCard';
import { ResponsiveText } from '../../components/ui/ResponsiveText';
import { useAuth } from '../../contexts/AuthContext';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { Send, Paperclip, Plus, ArrowLeft, MessageCircle, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  users?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface Channel {
  id: string;
  name: string;
  type: 'department' | 'project' | 'direct' | 'announcement';
  members?: string[];
  created_at: string;
}

export const ResponsiveMessages: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChannels();
  }, [user]);

  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.id);
    }
  }, [selectedChannel]);

  const loadChannels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('channels')
        .select(`
          id,
          name,
          type,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading channels:', error);
      } else if (data && data.length > 0) {
        setChannels(data as Channel[]);
        if (!selectedChannel) {
          setSelectedChannel(data[0] as Channel);
        }
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          created_at,
          users!messages_sender_id_fkey(full_name, avatar_url)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error loading messages:', error);
      } else if (data) {
        setMessages(data as unknown as Message[]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          sender_id: user?.id,
          channel_id: selectedChannel.id,
        });

      if (error) {
        console.error('Error sending message:', error);
      } else {
        setNewMessage('');
        loadMessages(selectedChannel.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getChannelTypeIcon = (type: string) => {
    switch (type) {
      case 'department':
        return <Users size={16} className="text-purple-600" />;
      case 'project':
        return <MessageCircle size={16} className="text-blue-600" />;
      case 'direct':
        return <MessageCircle size={16} className="text-green-600" />;
      case 'announcement':
        return <MessageCircle size={16} className="text-orange-600" />;
      default:
        return <MessageCircle size={16} className="text-gray-600" />;
    }
  };

  const filteredChannels = channels.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout: Sidebar + Chat */}
      {!isMobile && selectedChannel && (
        <div className="flex flex-col lg:flex-row h-screen">
          {/* Sidebar */}
          <div className="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-4">
              <ResponsiveText variant="h3" weight="semibold" color="default" className="text-white mb-4">
                Messages
              </ResponsiveText>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="text-lg font-bold">{channels.length}</div>
                  <div className="text-xs text-white/70">Channels</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="text-lg font-bold">{messages.length}</div>
                  <div className="text-xs text-white/70">Messages</div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Channels List */}
            <div className="flex-1 overflow-y-auto">
              {filteredChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`w-full text-left px-4 py-3 border-l-4 transition-all hover:bg-gray-50 ${
                    selectedChannel?.id === channel.id
                      ? 'bg-cyan-50 border-l-cyan-600 text-cyan-600'
                      : 'border-l-transparent text-gray-700 hover:border-l-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getChannelTypeIcon(channel.type)}
                    <div className="flex-1 min-w-0">
                      <ResponsiveText weight={selectedChannel?.id === channel.id ? 'semibold' : 'normal'} className="truncate">
                        {channel.name}
                      </ResponsiveText>
                      <ResponsiveText variant="small" color="muted" className="truncate text-xs mt-0.5">
                        {channel.type}
                      </ResponsiveText>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* New Channel Button */}
            <div className="p-4 border-t border-gray-200">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors">
                <Plus size={18} />
                New Channel
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Channel Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getChannelTypeIcon(selectedChannel.type)}
                  <div>
                    <ResponsiveText variant="h4" weight="semibold">
                      {selectedChannel.name}
                    </ResponsiveText>
                    <ResponsiveText variant="small" color="muted">
                      {selectedChannel.members?.length || 0} members • {messages.length} messages
                    </ResponsiveText>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
                    <ResponsiveText color="muted" className="text-sm">
                      No messages yet. Start the conversation!
                    </ResponsiveText>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender_id === user?.id ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold ${
                      message.sender_id === user?.id
                        ? 'bg-gradient-to-r from-cyan-400 to-cyan-600'
                        : 'bg-gradient-to-r from-indigo-400 to-indigo-600'
                    }`}>
                      {message.users?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    {/* Message */}
                    <div className={`flex-1 max-w-lg ${message.sender_id === user?.id ? 'items-end flex flex-col' : ''}`}>
                      <ResponsiveText weight="medium" className="text-sm mb-1">
                        {message.users?.full_name || 'Unknown'}
                      </ResponsiveText>
                      <div className={`px-4 py-2 rounded-lg ${
                        message.sender_id === user?.id
                          ? 'bg-cyan-600 text-white rounded-br-none'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                      }`}>
                        <ResponsiveText className="text-sm break-words">
                          {message.content}
                        </ResponsiveText>
                      </div>
                      <ResponsiveText variant="small" color="muted" className="text-xs mt-1">
                        {new Date(message.created_at).toLocaleString()}
                      </ResponsiveText>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              <div className="flex gap-3">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0" aria-label="Attach file">
                  <Paperclip size={20} className="text-gray-600" />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile/Tablet Layout */}
      {isMobile && (
        <div className="flex flex-col h-screen">
          {!selectedChannel ? (
            // Channel List View
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-6">
                <ResponsiveText variant="h2" weight="medium" color="default" className="text-white mb-4">
                  Messages
                </ResponsiveText>

                {/* Stats */}
                <ResponsiveGrid cols={{ xs: 2 }} gap="sm">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-2xl font-bold">{channels.length}</div>
                    <div className="text-xs text-white/70">Channels</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-2xl font-bold">{messages.length}</div>
                    <div className="text-xs text-white/70">Messages</div>
                  </div>
                </ResponsiveGrid>
              </div>

              {/* Search & Content */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <input
                  type="text"
                  placeholder="Search channels..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
                />

                <ResponsiveGrid cols={{ xs: 1 }} gap="md">
                  {filteredChannels.map((channel) => (
                    <ResponsiveCard
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      variant="outlined"
                      className="cursor-pointer hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getChannelTypeIcon(channel.type)}
                          <div className="flex-1">
                            <ResponsiveText weight="semibold" className="mb-1">
                              {channel.name}
                            </ResponsiveText>
                            <ResponsiveText variant="small" color="muted">
                              {channel.type} • {channel.members?.length || 0} members
                            </ResponsiveText>
                          </div>
                        </div>
                        <ArrowLeft className="text-gray-400 rotate-180" size={18} />
                      </div>
                    </ResponsiveCard>
                  ))}
                </ResponsiveGrid>
              </div>

              {/* New Channel Button */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors">
                  <Plus size={18} />
                  New Channel
                </button>
              </div>
            </>
          ) : (
            // Single Channel View
            <>
              {/* Channel Header */}
              <div className="bg-white border-b border-gray-200 px-4 py-3">
                <button
                  onClick={() => setSelectedChannel(null)}
                  className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium text-sm mb-3"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
                <div className="flex items-center gap-2">
                  {getChannelTypeIcon(selectedChannel.type)}
                  <div className="flex-1">
                    <ResponsiveText weight="semibold">
                      {selectedChannel.name}
                    </ResponsiveText>
                    <ResponsiveText variant="small" color="muted" className="text-xs">
                      {selectedChannel.members?.length || 0} members
                    </ResponsiveText>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle size={40} className="mx-auto text-gray-300 mb-3" />
                      <ResponsiveText color="muted" className="text-sm">
                        No messages yet
                      </ResponsiveText>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${message.sender_id === user?.id ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${
                        message.sender_id === user?.id
                          ? 'bg-gradient-to-r from-cyan-400 to-cyan-600'
                          : 'bg-gradient-to-r from-indigo-400 to-indigo-600'
                      }`}>
                        {message.users?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>

                      <div className={`flex-1 ${message.sender_id === user?.id ? 'items-end flex flex-col' : ''}`}>
                        <ResponsiveText weight="medium" className="text-xs mb-1">
                          {message.users?.full_name || 'Unknown'}
                        </ResponsiveText>
                        <div className={`px-3 py-2 rounded-lg text-sm ${
                          message.sender_id === user?.id
                            ? 'bg-cyan-600 text-white rounded-br-none'
                            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                        }`}>
                          <ResponsiveText className="text-sm break-words">
                            {message.content}
                          </ResponsiveText>
                        </div>
                        <ResponsiveText variant="small" color="muted" className="text-xs mt-1">
                          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </ResponsiveText>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-200 bg-white">
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Attach file">
                    <Paperclip size={18} className="text-gray-600" />
                  </button>
                  <input
                    type="text"
                    placeholder="Message..."
                    value={newMessage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
