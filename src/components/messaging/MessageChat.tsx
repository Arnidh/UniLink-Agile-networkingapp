
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getProfileById } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  read: boolean;
}

interface MessageChatProps {
  currentUserId: string;
  otherUserId: string;
  messages: Message[];
  onBack: () => void;
  onSendMessage: (content: string) => Promise<void>;
}

const MessageChat: React.FC<MessageChatProps> = ({
  currentUserId,
  otherUserId,
  messages,
  onBack,
  onSendMessage,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [otherUserProfile, setOtherUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { profile } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const profileData = await getProfileById(otherUserId);
      setOtherUserProfile(profileData);
      setIsLoading(false);
    };

    fetchProfile();
  }, [otherUserId]);

  useEffect(() => {
    // Mark messages as read
    const markMessagesAsRead = async () => {
      const unreadMessages = messages.filter(
        (msg) => !msg.read && msg.sender_id === otherUserId
      );

      if (unreadMessages.length > 0) {
        const { error } = await supabase
          .from("messages")
          .update({ read: true })
          .in(
            "id",
            unreadMessages.map((msg) => msg.id)
          );

        if (error) {
          console.error("Error marking messages as read:", error);
        }
      }
    };

    markMessagesAsRead();
  }, [messages, otherUserId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsSending(true);
    await onSendMessage(newMessage.trim());
    setNewMessage("");
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

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
      <div className="border-b p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage
            src={otherUserProfile?.profile_picture}
            alt={otherUserProfile?.name || "User"}
          />
          <AvatarFallback>
            {otherUserProfile?.name ? getInitials(otherUserProfile.name) : "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{otherUserProfile?.name || "User"}</h3>
          <p className="text-xs text-gray-500 capitalize">
            {otherUserProfile?.role || ""}
            {otherUserProfile?.department ? ` • ${otherUserProfile.department}` : ""}
          </p>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sortedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-gray-500">
            <div>
              <p className="mb-2">No messages yet</p>
              <p className="text-sm">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          sortedMessages.map((msg) => {
            const isMine = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                {!isMine && (
                  <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                    <AvatarImage
                      src={otherUserProfile?.profile_picture}
                      alt={otherUserProfile?.name || "User"}
                    />
                    <AvatarFallback>
                      {otherUserProfile?.name ? getInitials(otherUserProfile.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="max-w-[75%]">
                  <div
                    className={`p-3 rounded-lg ${
                      isMine
                        ? "bg-unilink-primary text-white rounded-tr-none"
                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(msg.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {isMine && (
                  <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
                    <AvatarImage
                      src={profile?.profile_picture}
                      alt={profile?.name || "Me"}
                    />
                    <AvatarFallback>
                      {profile?.name ? getInitials(profile.name) : "Me"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 mr-2"
            disabled={isSending}
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSending}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageChat;
