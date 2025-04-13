
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import MessagesList, { Message } from "@/components/messaging/MessagesList";
import MessageChat from "@/components/messaging/MessageChat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getProfileById } from "@/services/api";

const Messages = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Parse URL parameters to get any direct message recipient
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const userId = searchParams.get('userId');
    if (userId) {
      setSelectedUserId(userId);
      // Clean up the URL
      navigate('/messages', { replace: true });
    }
  }, [location, navigate]);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate("/signin");
    }
  }, [currentUser, navigate]);
  
  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentUser) return;
      
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } else {
        setMessages(data || []);
      }
      
      setIsLoading(false);
    };
    
    loadMessages();
    
    // Subscribe to new messages
    if (!currentUser) return;
    
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${currentUser?.id}` 
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [payload.new as Message, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => 
              prev.map(msg => msg.id === payload.new.id ? payload.new as Message : msg)
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${currentUser?.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [payload.new as Message, ...prev]);
            toast.info('New message received');
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => 
              prev.map(msg => msg.id === payload.new.id ? payload.new as Message : msg)
            );
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, navigate]);

  // Try to initiate a new conversation if selectedUserId is set but not in our existing conversation list
  useEffect(() => {
    const checkNewConversation = async () => {
      if (!selectedUserId || !currentUser) return;
      
      // Check if we already have a conversation with this user
      const existingConversation = messages.some(msg => 
        (msg.sender_id === currentUser.id && msg.recipient_id === selectedUserId) || 
        (msg.recipient_id === currentUser.id && msg.sender_id === selectedUserId)
      );
      
      // If not, we'll verify the user exists and prepare for a new conversation
      if (!existingConversation) {
        try {
          const profileData = await getProfileById(selectedUserId);
          if (!profileData) {
            setSelectedUserId(null);
            toast.error("User not found");
          }
          // We'll keep selectedUserId set so the chat interface opens
        } catch (error) {
          console.error('Error fetching profile:', error);
          setSelectedUserId(null);
          toast.error("Couldn't load user profile");
        }
      }
    };
    
    checkNewConversation();
  }, [selectedUserId, messages, currentUser]);
  
  const handleSelectMessage = (message: Message) => {
    const otherId = message.sender_id === currentUser?.id ? message.recipient_id : message.sender_id;
    setSelectedUserId(otherId);
  };
  
  const handleSendMessage = async (content: string) => {
    if (!currentUser || !selectedUserId) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          recipient_id: selectedUserId,
          content
        });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };
  
  // Filter messages for the selected user
  const filteredMessages = selectedUserId 
    ? messages.filter(msg => 
        (msg.sender_id === currentUser?.id && msg.recipient_id === selectedUserId) ||
        (msg.recipient_id === currentUser?.id && msg.sender_id === selectedUserId)
      )
    : [];
  
  if (!currentUser) return null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container px-4">
          <h1 className="text-3xl font-bold mb-4">Messages</h1>
          
          <Card className="h-[calc(80vh-4rem)] overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading messages...</p>
              </div>
            ) : selectedUserId ? (
              <MessageChat 
                currentUserId={currentUser.id}
                otherUserId={selectedUserId}
                messages={filteredMessages}
                onBack={() => setSelectedUserId(null)}
                onSendMessage={handleSendMessage}
              />
            ) : (
              <div className="p-4 h-full">
                <MessagesList 
                  messages={messages} 
                  currentUserId={currentUser.id}
                  onSelectMessage={handleSelectMessage}
                />
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Messages;
