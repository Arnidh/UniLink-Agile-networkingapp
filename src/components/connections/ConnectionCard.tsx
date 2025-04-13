
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Connection, respondToConnectionRequest } from '@/services/api';
import { Check, X, User, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ConnectionCardProps {
  connection: Connection;
  isPending?: boolean;
  onResponse?: (connection: Connection) => void;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({ connection, isPending = false, onResponse }) => {
  const isProfileDefined = !!connection.profile;
  const navigate = useNavigate();
  
  const handleAccept = async () => {
    try {
      const updatedConnection = await respondToConnectionRequest(connection.id, 'accepted');
      if (updatedConnection && onResponse) {
        onResponse(updatedConnection);
        toast.success("Connection request accepted");
      }
    } catch (error) {
      console.error("Error accepting connection request:", error);
      toast.error("Failed to accept connection request");
    }
  };
  
  const handleReject = async () => {
    try {
      const updatedConnection = await respondToConnectionRequest(connection.id, 'rejected');
      if (updatedConnection && onResponse) {
        onResponse(updatedConnection);
        toast.success("Connection request rejected");
      }
    } catch (error) {
      console.error("Error rejecting connection request:", error);
      toast.error("Failed to reject connection request");
    }
  };
  
  const handleViewProfile = () => {
    if (isProfileDefined && connection.profile.id) {
      navigate(`/profile/${connection.profile.id}`);
    }
  };

  const handleMessage = () => {
    if (isProfileDefined && connection.profile.id) {
      navigate(`/messages?userId=${connection.profile.id}`);
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleViewProfile}>
            <Avatar>
              <AvatarImage 
                src={isProfileDefined ? connection.profile.profile_picture : undefined} 
                alt={isProfileDefined ? connection.profile.name : "User"} 
              />
              <AvatarFallback>
                {isProfileDefined ? getInitials(connection.profile.name) : <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">
                {isProfileDefined ? connection.profile.name : "Unknown User"}
              </h3>
              <p className="text-sm text-gray-600">
                {isProfileDefined ? connection.profile.role : ""} 
                {isProfileDefined && connection.profile.department ? ` • ${connection.profile.department}` : ""}
              </p>
            </div>
          </div>
          
          {isPending ? (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={handleReject}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button 
                size="sm" 
                className="bg-green-500 hover:bg-green-600"
                onClick={handleAccept}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm px-2 py-1 rounded bg-gray-100 text-gray-700">
                {connection.status === 'accepted' ? 'Connected' : 
                 connection.status === 'pending' ? 'Pending' : 'Rejected'}
              </span>
              <div className="flex gap-2">
                {isProfileDefined && connection.profile.id && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleViewProfile}
                  >
                    View
                  </Button>
                )}
                {connection.status === 'accepted' && isProfileDefined && connection.profile.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMessage}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionCard;
