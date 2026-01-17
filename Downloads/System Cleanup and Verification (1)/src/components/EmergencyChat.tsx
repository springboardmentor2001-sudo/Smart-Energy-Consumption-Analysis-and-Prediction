import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  Image as ImageIcon, 
  Mic, 
  MapPin, 
  Phone,
  MessageSquare,
  Clock,
  Check,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../utils/supabase/client';

interface Message {
  id: string;
  emergency_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'patient' | 'hospital' | 'ambulance';
  message_text?: string;
  message_type: 'text' | 'photo' | 'voice' | 'location' | 'system';
  media_url?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  created_at: string;
  read_at?: string;
}

interface EmergencyChatProps {
  emergencyId: string;
  participants: {
    patient?: { id: string; name: string };
    ambulance?: { id: string; name: string; vehicleNumber: string };
    hospital?: { id: string; name: string };
  };
}

export const EmergencyChat: React.FC<EmergencyChatProps> = ({ emergencyId, participants }) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load messages
  useEffect(() => {
    loadMessages();
    
    // Subscribe to new messages
    const subscription = supabase
      .channel(`chat:${emergencyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emergency_messages',
          filter: `emergency_id=eq.${emergencyId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
          scrollToBottom();
          
          // Play notification sound for incoming messages
          if (newMsg.sender_id !== user?.id) {
            playNotificationSound();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [emergencyId, user]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_messages')
        .select('*')
        .eq('emergency_id', emergencyId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      if (data) {
        setMessages(data);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVKni7LNiFQY8lNn0y3wqBSd+zfDbijYHHmO86+mjUBELTKXh8bllHAU2j9Xxzo0vBSh1xe/cnEELElyx6OmqXBYIMpPY9Mp8KwUngszx34s4BxxpvOvmpVETDU+n4O+0ZRUFPJHY88uALAUpd8nu3JhCC');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('emergency_messages')
        .insert([{
          emergency_id: emergencyId,
          sender_id: user.id,
          sender_name: profile?.name || 'Unknown',
          sender_role: profile?.role || 'patient',
          message_text: newMessage,
          message_type: 'text',
          created_at: new Date().toISOString(),
        }])
        .select();

      if (error) throw error;

      setNewMessage('');
      scrollToBottom();
    } catch (error: any) {
      toast.error('Failed to send message: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendQuickMessage = async (text: string) => {
    if (!user) return;

    try {
      await supabase
        .from('emergency_messages')
        .insert([{
          emergency_id: emergencyId,
          sender_id: user.id,
          sender_name: profile?.name || 'Unknown',
          sender_role: profile?.role || 'patient',
          message_text: text,
          message_type: 'text',
          created_at: new Date().toISOString(),
        }]);

      toast.success('Quick message sent');
    } catch (error: any) {
      toast.error('Failed to send: ' + error.message);
    }
  };

  const sendLocation = async () => {
    if (!user) return;

    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await supabase
            .from('emergency_messages')
            .insert([{
              emergency_id: emergencyId,
              sender_id: user.id,
              sender_name: profile?.name || 'Unknown',
              sender_role: profile?.role || 'patient',
              message_type: 'location',
              location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
              created_at: new Date().toISOString(),
            }]);

          toast.success('📍 Location shared');
        } catch (error: any) {
          toast.error('Failed to share location: ' + error.message);
        }
      },
      () => {
        toast.error('Could not get location');
      }
    );
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be less than 5MB');
      return;
    }

    try {
      // Upload to Supabase storage
      const fileName = `${emergencyId}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('emergency-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('emergency-photos')
        .getPublicUrl(fileName);

      // Send message with photo
      await supabase
        .from('emergency_messages')
        .insert([{
          emergency_id: emergencyId,
          sender_id: user.id,
          sender_name: profile?.name || 'Unknown',
          sender_role: profile?.role || 'patient',
          message_type: 'photo',
          media_url: urlData.publicUrl,
          created_at: new Date().toISOString(),
        }]);

      toast.success('📷 Photo sent');
    } catch (error: any) {
      toast.error('Failed to upload photo: ' + error.message);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'patient': return 'bg-pink-100 text-pink-800';
      case 'ambulance': return 'bg-cyan-100 text-cyan-800';
      case 'hospital': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'patient': return '🤒';
      case 'ambulance': return '🚑';
      case 'hospital': return '🏥';
      default: return '👤';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pink-600" />
              Emergency Chat
            </CardTitle>
            <CardDescription>
              Real-time communication with all emergency participants
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
              Live
            </Badge>
          </div>
        </div>

        {/* Participants */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {participants.patient && (
            <Badge className={getRoleColor('patient')}>
              {getRoleIcon('patient')} {participants.patient.name}
            </Badge>
          )}
          {participants.ambulance && (
            <Badge className={getRoleColor('ambulance')}>
              {getRoleIcon('ambulance')} {participants.ambulance.vehicleNumber}
            </Badge>
          )}
          {participants.hospital && (
            <Badge className={getRoleColor('hospital')}>
              {getRoleIcon('hospital')} {participants.hospital.name}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.sender_id === user?.id;

                return (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className={getRoleColor(message.sender_role)}>
                        {getRoleIcon(message.sender_role)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Message Content */}
                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-600">
                          {message.sender_name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {message.sender_role}
                        </Badge>
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.message_type === 'text' && (
                          <p className="text-sm break-words">{message.message_text}</p>
                        )}

                        {message.message_type === 'photo' && message.media_url && (
                          <div>
                            <img
                              src={message.media_url}
                              alt="Shared photo"
                              className="rounded-lg max-w-full h-auto mb-2"
                            />
                            {message.message_text && (
                              <p className="text-sm">{message.message_text}</p>
                            )}
                          </div>
                        )}

                        {message.message_type === 'location' && message.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <a
                              href={`https://www.google.com/maps?q=${message.location.latitude},${message.location.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm underline"
                            >
                              View Location
                            </a>
                          </div>
                        )}

                        {message.message_type === 'system' && (
                          <p className="text-xs italic">{message.message_text}</p>
                        )}
                      </div>

                      {/* Timestamp */}
                      <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="border-t p-2 bg-gray-50">
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => sendQuickMessage("I can't find you. Where are you exactly?")}
            >
              🔍 Can't find you
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => sendQuickMessage("I'm at the main entrance")}
            >
              🚪 At entrance
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => sendQuickMessage("Look for the red building")}
            >
              🏢 Red building
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => sendQuickMessage("I'll be there in 2 minutes")}
            >
              ⏱️ 2 minutes
            </Button>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t p-4 bg-white">
          <div className="flex gap-2">
            {/* Photo Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              title="Send photo"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>

            {/* Share Location */}
            <Button
              variant="outline"
              size="icon"
              onClick={sendLocation}
              title="Share location"
            >
              <MapPin className="w-4 h-4" />
            </Button>

            {/* Message Input */}
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="flex-1"
            />

            {/* Send Button */}
            <Button
              onClick={sendMessage}
              disabled={loading || !newMessage.trim()}
              className="bg-gradient-to-r from-pink-600 to-red-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
