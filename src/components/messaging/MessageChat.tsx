
import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Message } from "./MessagesList";
import { getProfileById } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";

interface MessageChatProps {
  currentUserId: string;
  messages: Message[];
  otherUserId: string;
  onBack: () => void;
  onSendMessage: (message: string) => Promise<void>;
}

const MessageChat: React.FC<MessageChatProps> = ({
  currentUserId,
  messages,
  otherUserId,
  onBack,
  onSendMessage,
}) => {
  const [otherUserProfile, setOtherUserProfile] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load the other user's profile
  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getProfileById(otherUserId);
      if (profile) {
        setOtherUserProfile(profile);
      }
    };
    
    loadProfile();
  }, [otherUserId]);
  
  // Mark messages as read
  useEffect(() => {
    const markMessagesAsRead = async () => {
      const unreadMessages = messages
        .filter(msg => !msg.read && msg.recipient_id === currentUserId)
        .map(msg => msg.id);
        
      if (unreadMessages.length > 0) {
        await supabase
          .from('messages')
          .update({ read: true })
          .in('id', unreadMessages);
      }
    };
    
    markMessagesAsRead();
  }, [messages, currentUserId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsSending(true);
    await onSendMessage(newMessage);
    setNewMessage("");
    setIsSending(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Sort messages by date
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-3 flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        {otherUserProfile ? (
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={otherUserProfile.profile_picture} alt={otherUserProfile.name} />
              <AvatarFallback>{getInitials(otherUserProfile.name)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{otherUserProfile.name}</span>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse mr-2"></div>
            <div className="h-5 w-32 bg-gray-200 animate-pulse rounded"></div>
          </div>
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sortedMessages.map(message => (
          <div 
            key={message.id}
            className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[75%] p-3 rounded-lg ${
                message.sender_id === currentUserId 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100'
              }`}
            >
              <p className="break-words">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.sender_id === currentUserId 
                  ? 'text-blue-100' 
                  : 'text-gray-500'
              }`}>
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="border-t p-3 flex items-end">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="resize-none flex-1 mr-2"
          rows={1}
        />
        <Button 
          size="icon" 
          onClick={handleSendMessage} 
          disabled={!newMessage.trim() || isSending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageChat;
