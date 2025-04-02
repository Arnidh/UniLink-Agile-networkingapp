
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Book, GraduationCap, Building, Calendar } from "lucide-react";
import ProfileForm from "@/components/profiles/ProfileForm";
import ProfileStatistics from "@/components/profiles/ProfileStatistics";
import PostCard from "@/components/posts/PostCard";
import { useQuery } from "@tanstack/react-query";
import { getUserPosts } from "@/services/api";

const Profile = () => {
  const { currentUser, profile } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  
  const { data: userPosts = [], refetch: refetchPosts } = useQuery({
    queryKey: ['userPosts', currentUser?.id],
    queryFn: () => currentUser ? getUserPosts(currentUser.id) : Promise.resolve([]),
    enabled: !!currentUser,
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!currentUser || !profile) {
    return null; // or a loading spinner/skeleton
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container px-4">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center mb-6">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={profile.profile_picture} alt={profile.name} />
                      <AvatarFallback className="text-lg">{getInitials(profile.name)}</AvatarFallback>
                    </Avatar>
                    
                    <h2 className="text-2xl font-bold">{profile.name}</h2>
                    <Badge className="mt-2 capitalize">{profile.role}</Badge>
                    
                    <Button 
                      variant="outline" 
                      className="mt-4 w-full"
                      onClick={() => setIsEditProfileOpen(true)}
                    >
                      Edit Profile
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {profile.bio && (
                      <div>
                        <h3 className="font-medium text-sm flex items-center mb-2 text-gray-500">
                          <Book className="h-4 w-4 mr-2" /> Bio
                        </h3>
                        <p className="text-sm">{profile.bio}</p>
                      </div>
                    )}
                    
                    {profile.university && (
                      <div>
                        <h3 className="font-medium text-sm flex items-center mb-2 text-gray-500">
                          <Building className="h-4 w-4 mr-2" /> University
                        </h3>
                        <p className="font-medium">{profile.university}</p>
                      </div>
                    )}
                    
                    {profile.department && (
                      <div>
                        <h3 className="font-medium text-sm flex items-center mb-2 text-gray-500">
                          <GraduationCap className="h-4 w-4 mr-2" /> Department
                        </h3>
                        <p className="font-medium">{profile.department}</p>
                      </div>
                    )}
                    
                    {profile.graduation_year && (
                      <div>
                        <h3 className="font-medium text-sm flex items-center mb-2 text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" /> Graduation Year
                        </h3>
                        <p className="font-medium">{profile.graduation_year}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              {/* Profile Statistics */}
              {currentUser && <ProfileStatistics userId={currentUser.id} />}
              
              <Tabs defaultValue="posts" className="w-full">
                <TabsList>
                  <TabsTrigger value="posts">My Posts</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                
                <TabsContent value="posts">
                  {userPosts.length === 0 ? (
                    <div className="text-center py-8 border rounded-lg bg-gray-50 mt-4">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold">No posts yet</h3>
                      <p className="text-gray-500">You haven't created any posts yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4 mt-4">
                      {userPosts.map(post => (
                        <PostCard 
                          key={post.id} 
                          post={post} 
                          onPostDeleted={() => refetchPosts()}
                          onPostUpdated={() => refetchPosts()}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="activity">
                  <div className="text-center py-8 border rounded-lg bg-gray-50 mt-4">
                    <p>Your recent activity will appear here.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information to help others connect with you
            </DialogDescription>
          </DialogHeader>
          <ProfileForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
