
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, Clock, Search, Plus, Bell } from "lucide-react";
import CreatePost from "@/components/posts/CreatePost";
import PostCard from "@/components/posts/PostCard";
import ConnectionCard from "@/components/connections/ConnectionCard";
import ProfileForm from "@/components/profiles/ProfileForm";
import { Post, getPosts, getPendingConnectionRequests, Connection, searchProfiles, Profile, sendConnectionRequest } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/contexts/ThemeContext";

const StudentDashboard: React.FC = () => {
  const { theme } = useTheme();
  const { currentUser, profile } = useAuth();
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not logged in or not a student
  useEffect(() => {
    if (!currentUser) {
      navigate("/signin");
    } else if (profile && profile.role !== "student") {
      navigate(`/${profile.role}-dashboard`);
    }
  }, [currentUser, profile, navigate]);
  
  // Load posts
  useEffect(() => {
    if (currentUser) {
      loadPosts();
      loadPendingRequests();
    }
  }, [currentUser]);
  
  const loadPosts = async () => {
    setIsLoading(true);
    const fetchedPosts = await getPosts();
    setPosts(fetchedPosts);
    setIsLoading(false);
  };
  
  const loadPendingRequests = async () => {
    if (!currentUser) return;
    
    const requests = await getPendingConnectionRequests(currentUser.id);
    setPendingRequests(requests);
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    const results = await searchProfiles(searchQuery);
    
    // Filter out the current user
    const filteredResults = results.filter(user => user.id !== currentUser?.id);
    
    setSearchResults(filteredResults);
    setIsSearching(false);
    setIsSearchDialogOpen(true);
  };
  
  const handleSendRequest = async (userId: string) => {
    const connection = await sendConnectionRequest(userId);
    if (connection) {
      // Close dialog
      setIsSearchDialogOpen(false);
    }
  };
  
  const handleConnectionResponse = async (connection: Connection) => {
    setPendingRequests(pendingRequests.filter(req => req.id !== connection.id));
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!currentUser || !profile) {
    return null;
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-[#141821] text-gray-200' : 'bg-gray-50'}`}>
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Welcome, {profile?.name.split(" ")[0]}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your student dashboard for academic networking and opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <GraduationCap className="mr-2 text-unilink-student" />
                  Profile Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full mb-2">
                  <div
                    className="h-2 bg-unilink-student rounded-full"
                    style={{ width: profile?.bio ? "75%" : "25%" }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {profile?.bio ? "75% complete. Add your graduation year to improve your profile." : "25% complete. Complete your profile to improve visibility."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 text-unilink-student" />
                  Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-gray-600">
                      Connections
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => setIsSearchDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Bell className="mr-2 text-unilink-student" />
                  Pending Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{pendingRequests.length}</p>
                    <p className="text-sm text-gray-600">
                      Connection requests
                    </p>
                  </div>
                  {pendingRequests.length > 0 && (
                    <Badge className="bg-unilink-student">{pendingRequests.length} new</Badge>
                  )}
                </div>
                
                {pendingRequests.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Recent requests:</p>
                    <div className="space-y-2">
                      {pendingRequests.slice(0, 2).map((request) => (
                        <ConnectionCard 
                          key={request.id} 
                          connection={request} 
                          isPending={true}
                          onResponse={handleConnectionResponse}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="feed">Feed</TabsTrigger>
                  <TabsTrigger value="network">Network</TabsTrigger>
                </TabsList>
                
                <TabsContent value="feed">
                  <CreatePost onPostCreated={loadPosts} />
                  
                  {isLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading posts...</div>
                  ) : posts.length === 0 ? (
                    <div className="text-center py-8 border rounded-lg bg-gray-50">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold">No posts yet</h3>
                      <p className="text-gray-500">Be the first to share something with your network</p>
                    </div>
                  ) : (
                    <div>
                      {posts.map(post => (
                        <PostCard 
                          key={post.id} 
                          post={post} 
                          onPostDeleted={loadPosts}
                          onPostUpdated={(updatedPost) => {
                            setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
                          }}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="network">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Network</CardTitle>
                      <CardDescription>
                        Manage your connections and requests
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <h3 className="text-md font-semibold mb-2">Pending Requests ({pendingRequests.length})</h3>
                        {pendingRequests.length === 0 ? (
                          <p className="text-gray-500 text-sm">No pending requests</p>
                        ) : (
                          <div className="space-y-3">
                            {pendingRequests.map(request => (
                              <ConnectionCard 
                                key={request.id} 
                                connection={request} 
                                isPending={true}
                                onResponse={handleConnectionResponse}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-md font-semibold mb-2">Find Connections</h3>
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Search by name, university, or department"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            onClick={handleSearch}
                            disabled={!searchQuery.trim() || isSearching}
                          >
                            <Search className="h-4 w-4 mr-2" />
                            Search
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                  <CardDescription>
                    Your professional information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center text-center mb-4">
                    <Avatar className="h-20 w-20 mb-3">
                      <AvatarImage src={profile.profile_picture} alt={profile.name} />
                      <AvatarFallback className="text-lg">{getInitials(profile.name)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold">{profile.name}</h3>
                    <p className="text-gray-600">{profile.role}</p>
                    
                    {profile.university && (
                      <p className="text-sm text-gray-600 mt-1">{profile.university}</p>
                    )}
                    
                    {profile.department && (
                      <Badge variant="outline" className="mt-2">{profile.department}</Badge>
                    )}
                  </div>
                  
                  {profile.bio ? (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-1">About</h4>
                      <p className="text-sm text-gray-600">{profile.bio}</p>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 border rounded-md text-center">
                      <p className="text-sm text-gray-500">Add a bio to tell others about yourself</p>
                    </div>
                  )}
                  
                  <Button
                    className="w-full mt-4"
                    onClick={() => setIsEditProfileOpen(true)}
                  >
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
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
      
      {/* Search Results Dialog */}
      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Search Results</DialogTitle>
            <DialogDescription>
              Connect with other users in the UniLink network
            </DialogDescription>
          </DialogHeader>
          
          {isSearching ? (
            <div className="py-8 text-center">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No users found matching "{searchQuery}"
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto py-2">
              {searchResults.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.profile_picture} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-gray-600">
                        {user.role} {user.department ? `• ${user.department}` : ""}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleSendRequest(user.id)}
                  >
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSearchDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
