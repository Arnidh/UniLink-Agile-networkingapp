
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { getProfileById } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  read: boolean;
  created_at: string;
  updated_at: string;
  profile?: any;
}

interface MessagesListProps {
  messages: Message[];
  currentUserId: string;
  onSelectMessage: (message: Message) => void;
}

const MessagesList: React.FC<MessagesListProps> = ({ 
  messages, 
  currentUserId, 
  onSelectMessage 
}) => {
  const [profileCache, setProfileCache] = useState<Record<string, any>>({});
  
  // Load profiles for all users in messages
  useEffect(() => {
    const userIds = new Set<string>();
    
    messages.forEach(message => {
      const otherId = message.sender_id === currentUserId ? message.recipient_id : message.sender_id;
      if (!profileCache[otherId]) {
        userIds.add(otherId);
      }
    });
    
    userIds.forEach(async (userId) => {
      const profile = await getProfileById(userId);
      if (profile) {
        setProfileCache(prev => ({
          ...prev,
          [userId]: profile
        }));
      }
    });
  }, [messages, currentUserId]);
  
  // Mark message as read when selected
  const handleSelectMessage = async (message: Message) => {
    if (!message.read && message.recipient_id === currentUserId) {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', message.id);
    }
    
    onSelectMessage(message);
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  
  const getGroupedMessages = () => {
    const grouped: Record<string, Message[]> = {};
    
    messages.forEach(message => {
      const otherId = message.sender_id === currentUserId ? message.recipient_id : message.sender_id;
      
      if (!grouped[otherId]) {
        grouped[otherId] = [];
      }
      
      grouped[otherId].push(message);
    });
    
    // Sort each group by latest message first
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
    
    return grouped;
  };
  
  const groupedMessages = getGroupedMessages();
  const sortedUserIds = Object.keys(groupedMessages).sort((a, b) => {
    const latestA = groupedMessages[a][0].created_at;
    const latestB = groupedMessages[b][0].created_at;
    return new Date(latestB).getTime() - new Date(latestA).getTime();
  });
  
  const getUnreadCount = (userId: string) => {
    return groupedMessages[userId].filter(
      msg => msg.recipient_id === currentUserId && !msg.read
    ).length;
  };

  return (
    <div className="space-y-2">
      {sortedUserIds.map(userId => {
        const profile = profileCache[userId];
        const latestMessage = groupedMessages[userId][0];
        const unreadCount = getUnreadCount(userId);
        
        if (!profile) return null;
        
        return (
          <Button 
            key={userId}
            variant="ghost" 
            className={`w-full justify-start p-3 ${unreadCount > 0 ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
            onClick={() => handleSelectMessage(latestMessage)}
          >
            <div className="flex items-start gap-3 w-full">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={profile.profile_picture} alt={profile.name} />
                <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{profile.name}</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(latestMessage.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 truncate">
                  {latestMessage.sender_id === currentUserId ? 'You: ' : ''}
                  {latestMessage.content}
                </p>
              </div>
              
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-blue-500">{unreadCount}</Badge>
              )}
            </div>
          </Button>
        );
      })}
      
      {sortedUserIds.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No messages yet
        </div>
      )}
    </div>
  );
};

export default MessagesList;
