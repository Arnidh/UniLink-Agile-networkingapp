
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, UserPlus, UserX, User, Book, Building, GraduationCap, Calendar } from "lucide-react";
import PostCard from "@/components/posts/PostCard";
import ProfileStatistics from "@/components/profiles/ProfileStatistics";
import { useQuery } from "@tanstack/react-query";
import { Profile, getUserPosts, getProfileById, checkConnectionStatus, sendConnectionRequest } from "@/services/api";
import { toast } from "sonner";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!userId) {
      navigate("/dashboard");
      return;
    }
    
    if (currentUser?.id === userId) {
      navigate("/profile");
      return;
    }
    
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const profileData = await getProfileById(userId);
        
        if (profileData) {
          setProfile(profileData);
          
          if (currentUser) {
            const status = await checkConnectionStatus(currentUser.id, userId);
            setConnectionStatus(status);
          }
        } else {
          toast.error("Profile not found");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [userId, currentUser, navigate]);
  
  const { data: userPosts = [] } = useQuery({
    queryKey: ['userPosts', userId],
    queryFn: () => userId ? getUserPosts(userId) : Promise.resolve([]),
    enabled: !!userId,
  });
  
  const handleConnect = async () => {
    if (!userId || !currentUser) return;
    
    try {
      const connection = await sendConnectionRequest(userId);
      if (connection) {
        setConnectionStatus('pending');
        toast.success("Connection request sent");
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast.error("Failed to send connection request");
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  
  const getConnectionButtonContent = () => {
    if (!connectionStatus) {
      return (
        <Button 
          className="w-full"
          onClick={handleConnect}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Connect
        </Button>
      );
    }
    
    if (connectionStatus === 'pending') {
      return (
        <Button 
          variant="outline"
          className="w-full"
          disabled
        >
          <User className="h-4 w-4 mr-2" />
          Connection Pending
        </Button>
      );
    }
    
    if (connectionStatus === 'accepted') {
      return (
        <Button 
          variant="outline"
          className="w-full bg-green-50"
          disabled
        >
          <UserCheck className="h-4 w-4 mr-2 text-green-500" />
          Connected
        </Button>
      );
    }
    
    if (connectionStatus === 'rejected') {
      return (
        <Button 
          variant="outline"
          className="w-full"
          disabled
        >
          <UserX className="h-4 w-4 mr-2" />
          Connection Rejected
        </Button>
      );
    }
    
    return null;
  };
  
  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container px-4">
            <div className="text-center py-10">
              <div className="animate-pulse">
                <div className="h-32 w-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-8"></div>
                <div className="h-48 bg-gray-200 rounded max-w-md mx-auto"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container px-4">
          <h1 className="text-3xl font-bold mb-8">{profile?.name}'s Profile</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center mb-6">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={profile?.profile_picture} alt={profile?.name} />
                      <AvatarFallback className="text-lg">{getInitials(profile?.name)}</AvatarFallback>
                    </Avatar>
                    
                    <h2 className="text-2xl font-bold">{profile?.name}</h2>
                    <Badge className="mt-2 capitalize">{profile?.role}</Badge>
                    
                    <div className="mt-4 w-full">
                      {getConnectionButtonContent()}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {profile?.bio && (
                      <div>
                        <h3 className="font-medium text-sm flex items-center mb-2 text-gray-500">
                          <Book className="h-4 w-4 mr-2" /> Bio
                        </h3>
                        <p className="text-sm">{profile?.bio}</p>
                      </div>
                    )}
                    
                    {profile?.university && (
                      <div>
                        <h3 className="font-medium text-sm flex items-center mb-2 text-gray-500">
                          <Building className="h-4 w-4 mr-2" /> University
                        </h3>
                        <p className="font-medium">{profile?.university}</p>
                      </div>
                    )}
                    
                    {profile?.department && (
                      <div>
                        <h3 className="font-medium text-sm flex items-center mb-2 text-gray-500">
                          <GraduationCap className="h-4 w-4 mr-2" /> Department
                        </h3>
                        <p className="font-medium">{profile?.department}</p>
                      </div>
                    )}
                    
                    {profile?.graduation_year && (
                      <div>
                        <h3 className="font-medium text-sm flex items-center mb-2 text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" /> Graduation Year
                        </h3>
                        <p className="font-medium">{profile?.graduation_year}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              {profile && <ProfileStatistics userId={profile.id} />}
              
              <Tabs defaultValue="posts" className="w-full">
                <TabsList>
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                </TabsList>
                
                <TabsContent value="posts">
                  {userPosts.length === 0 ? (
                    <div className="text-center py-8 border rounded-lg bg-gray-50 mt-4">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold">No posts yet</h3>
                      <p className="text-gray-500">{profile?.name} hasn't created any posts yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4 mt-4">
                      {userPosts.map(post => (
                        <PostCard 
                          key={post.id} 
                          post={post} 
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
