
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import { Profile, getProfileById, sendConnectionRequest, getConnections } from '@/services/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Check, Clock } from 'lucide-react';

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');
  const [isRequestingConnection, setIsRequestingConnection] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/connections');
      return;
    }

    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const profile = await getProfileById(id);
        if (profile) {
          setUserProfile(profile);
          
          // Check connection status if logged in
          if (currentUser) {
            const connections = await getConnections(currentUser.id, 'all');
            const connection = connections.find(conn => 
              (conn.requester_id === currentUser.id && conn.addressee_id === id) ||
              (conn.requester_id === id && conn.addressee_id === currentUser.id)
            );
            
            if (connection) {
              if (connection.status === 'accepted') {
                setConnectionStatus('connected');
              } else if (connection.status === 'pending') {
                setConnectionStatus('pending');
              }
            }
          }
        } else {
          navigate('/not-found');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [id, currentUser, navigate]);

  const handleConnect = async () => {
    if (!id || !currentUser) return;
    
    setIsRequestingConnection(true);
    try {
      await sendConnectionRequest(id);
      setConnectionStatus('pending');
    } catch (error) {
      console.error('Error sending connection request:', error);
    } finally {
      setIsRequestingConnection(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'student':
        return 'bg-blue-100 text-blue-800';
      case 'professor':
        return 'bg-green-100 text-green-800';
      case 'alumni':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container py-8 flex justify-center items-center">
          <p className="text-lg text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container py-8 flex justify-center items-center">
          <p className="text-lg text-gray-500">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile header */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-40 bg-gradient-to-r from-unilink-primary to-unilink-secondary"></div>
            <div className="relative px-6 pb-6">
              <div className="absolute -top-16 left-6">
                <div className="h-32 w-32 rounded-full border-4 border-white bg-white overflow-hidden">
                  <img 
                    src={userProfile.profile_picture || "/placeholder.svg"} 
                    alt={userProfile.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="pt-20">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold">{userProfile.name}</h1>
                    <div className="mt-1 flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${getRoleBadgeColor(userProfile.role)}`}>
                        {userProfile.role}
                      </span>
                      {userProfile.university && (
                        <span className="text-sm text-gray-600">{userProfile.university}</span>
                      )}
                    </div>
                  </div>
                  
                  {currentUser && currentUser.id !== id && (
                    <div>
                      {connectionStatus === 'none' && (
                        <Button 
                          onClick={handleConnect}
                          disabled={isRequestingConnection}
                          className="flex items-center gap-1"
                        >
                          <UserPlus className="h-4 w-4" />
                          Connect
                        </Button>
                      )}
                      {connectionStatus === 'pending' && (
                        <Button variant="outline" disabled className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Pending
                        </Button>
                      )}
                      {connectionStatus === 'connected' && (
                        <Button variant="outline" className="flex items-center gap-1 bg-green-50">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">Connected</span>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {userProfile.bio && (
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-2">About</h2>
                    <p className="text-gray-700">{userProfile.bio}</p>
                  </div>
                )}
                
                <div className="mt-6 border-t pt-6">
                  <h2 className="text-lg font-semibold mb-4">Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userProfile.department && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Department</h3>
                        <p className="text-gray-700">{userProfile.department}</p>
                      </div>
                    )}
                    
                    {userProfile.graduation_year && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Graduation Year</h3>
                        <p className="text-gray-700">{userProfile.graduation_year}</p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                      <p className="text-gray-700">{new Date(userProfile.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
