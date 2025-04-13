
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import { getPosts, Post, getConnections, Connection } from '@/services/api';
import CreatePost from '@/components/posts/CreatePost';
import PostCard from '@/components/posts/PostCard';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Link, Settings, Calendar, Bookmark, Network, Bell, Search, Briefcase, GraduationCap, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import DepartmentStatistics from '@/components/stats/DepartmentStatistics';

const Dashboard = () => {
  const { currentUser, profile, isLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const universityEvents = [
    {
      id: '1',
      title: 'Fall Career Fair',
      date: '2023-10-15T14:00:00',
      location: 'University Main Hall',
      description: 'Connect with over 50 employers from various industries.',
      category: 'career'
    },
    {
      id: '2',
      title: 'Guest Lecture: AI in Healthcare',
      date: '2023-10-18T15:30:00',
      location: 'Science Building, Room 302',
      description: 'Dr. Sarah Chen discusses the latest advancements in AI applications for healthcare.',
      category: 'academic'
    },
    {
      id: '3',
      title: 'Student Government Elections',
      date: '2023-10-20T09:00:00',
      location: 'Online',
      description: 'Cast your vote for the student government representatives.',
      category: 'campus'
    },
    {
      id: '4',
      title: 'Alumni Networking Night',
      date: '2023-10-25T18:00:00',
      location: 'University Center, Grand Hall',
      description: 'Connect with alumni from various industries and build your professional network.',
      category: 'networking'
    }
  ];

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/signin');
    }
  }, [currentUser, isLoading, navigate]);

  useEffect(() => {
    const loadPosts = async () => {
      setIsPostsLoading(true);
      const loadedPosts = await getPosts();
      setPosts(loadedPosts);
      setIsPostsLoading(false);
    };

    loadPosts();
  }, []);

  useEffect(() => {
    const loadConnections = async () => {
      if (currentUser) {
        const userConnections = await getConnections(currentUser.id, 'accepted');
        setConnections(userConnections.slice(0, 5));
      }
    };

    loadConnections();
  }, [currentUser]);

  const handlePostCreated = async () => {
    const refreshedPosts = await getPosts();
    setPosts(refreshedPosts);
  };

  const handlePostDeleted = () => {
    handlePostCreated();
  };

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts(posts.map(post => post.id === updatedPost.id ? { ...updatedPost, profile: post.profile } : post));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventCategoryBadge = (category: string) => {
    switch(category) {
      case 'career':
        return <Badge className="bg-blue-500">Career</Badge>;
      case 'academic':
        return <Badge className="bg-green-500">Academic</Badge>;
      case 'campus':
        return <Badge className="bg-purple-500">Campus</Badge>;
      case 'networking':
        return <Badge className="bg-orange-500">Networking</Badge>;
      default:
        return <Badge>Event</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <Header />
        <div className="container py-8 flex justify-center items-center">
          <p className="text-lg text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Header />
      
      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden mb-4">
                    <img 
                      src={profile?.profile_picture || "/placeholder.svg"} 
                      alt={profile?.name || "User"} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-semibold">{profile?.name}</h2>
                  <span className="text-sm text-gray-500 capitalize">{profile?.role}</span>
                  {profile?.university && (
                    <span className="text-sm text-gray-700 mt-1">{profile?.university}</span>
                  )}
                  <button 
                    onClick={() => navigate('/profile')} 
                    className="mt-4 text-sm text-unilink-primary hover:underline"
                  >
                    View Profile
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/connections')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    My Network
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/profile')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate('/messages')}
                  >
                    <Link className="mr-2 h-4 w-4" />
                    Messages
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate('/events')}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Events
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-6">
            <Tabs 
              defaultValue={activeTab} 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="w-full mb-6"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="feed">Feed</TabsTrigger>
                <TabsTrigger value="network">Network</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </TabsList>
              
              <TabsContent value="feed" className="pt-4">
                <CreatePost onPostCreated={handlePostCreated} />
                
                {isPostsLoading ? (
                  <div className="text-center py-8">Loading posts...</div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg shadow p-6">
                    <p className="text-gray-500">No posts yet. Be the first to post!</p>
                  </div>
                ) : (
                  posts.map(post => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      onPostDeleted={handlePostDeleted} 
                      onPostUpdated={handlePostUpdated}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="network" className="pt-4">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>University Network</CardTitle>
                    <CardDescription>
                      Connect with students, professors, and alumni from your university
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search for people by name, role, or department..."
                          className="pl-9"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      <div className="border rounded-lg p-4 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                          <GraduationCap className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-medium">Students</h3>
                        <p className="text-sm text-gray-500 mb-3">Connect with fellow students</p>
                        <Button variant="outline" size="sm" onClick={() => navigate('/connections')}>
                          Find Students
                        </Button>
                      </div>
                      
                      <div className="border rounded-lg p-4 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                          <Briefcase className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="font-medium">Professors</h3>
                        <p className="text-sm text-gray-500 mb-3">Connect with professors</p>
                        <Button variant="outline" size="sm" onClick={() => navigate('/connections')}>
                          Find Professors
                        </Button>
                      </div>
                      
                      <div className="border rounded-lg p-4 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="font-medium">Alumni</h3>
                        <p className="text-sm text-gray-500 mb-3">Connect with university alumni</p>
                        <Button variant="outline" size="sm" onClick={() => navigate('/connections')}>
                          Find Alumni
                        </Button>
                      </div>
                      
                      <div className="border rounded-lg p-4 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                          <Network className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="font-medium">Departments</h3>
                        <p className="text-sm text-gray-500 mb-3">Browse by department</p>
                        <Button variant="outline" size="sm" onClick={() => navigate('/connections')}>
                          Find by Department
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => navigate('/connections')}>
                      View All Connections
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="events" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming University Events</CardTitle>
                    <CardDescription>
                      Stay updated with the latest events happening at your university
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {universityEvents.map(event => (
                        <div key={event.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            {getEventCategoryBadge(event.category)}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatEventDate(event.date)}
                          </div>
                          <div className="text-sm text-gray-500 mb-3">
                            <span className="font-medium">Location:</span> {event.location}
                          </div>
                          <p className="text-sm mb-3">{event.description}</p>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Bell className="h-4 w-4 mr-1" />
                              Remind Me
                            </Button>
                            <Button size="sm" variant="outline">
                              <Bookmark className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View All Events
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">My Connections</h2>
                <span className="text-sm text-gray-500">{connections.length}</span>
              </div>
              
              {connections.length > 0 ? (
                <div className="space-y-3">
                  {connections.map(connection => (
                    <div key={connection.id} className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage 
                          src={connection.profile?.profile_picture} 
                          alt={connection.profile?.name || "User"} 
                        />
                        <AvatarFallback>
                          {connection.profile ? getInitials(connection.profile.name) : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {connection.profile?.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {connection.profile?.role || ""} 
                          {connection.profile?.department ? ` • ${connection.profile.department}` : ""}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="ml-2"
                        onClick={() => navigate(`/profile/${connection.profile?.id}`)}
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => navigate('/connections')}
                  >
                    View All Connections
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    You haven't connected with anyone yet.
                  </p>
                  <Button 
                    onClick={() => navigate('/connections')} 
                    className="w-full"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Find Connections
                  </Button>
                </div>
              )}
            </div>
            
            <DepartmentStatistics />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
