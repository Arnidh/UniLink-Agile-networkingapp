
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import CreatePost from "@/components/posts/CreatePost";
import PostCard from "@/components/posts/PostCard";
import { getPosts } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Calendar, Users, Network } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ProfessorDashboard: React.FC = () => {
  const { theme } = useTheme();
  const { currentUser, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("feed");

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate("/signin");
    }
  }, [currentUser, isLoading, navigate]);

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
    enabled: !!currentUser,
  });

  const universityEvents = [
    {
      id: '1',
      title: 'Faculty Meeting',
      date: '2025-04-15T14:00:00',
      location: 'Science Building, Room 302',
      description: 'Discussion about the upcoming semester curriculum changes.',
      category: 'academic'
    },
    {
      id: '2',
      title: 'Research Symposium',
      date: '2025-04-18T10:00:00',
      location: 'University Center, Grand Hall',
      description: 'Faculty and graduate students present their latest research findings.',
      category: 'research'
    },
    {
      id: '3',
      title: 'Department Social',
      date: '2025-04-20T17:00:00',
      location: 'University Gardens',
      description: 'Networking event for faculty members across departments.',
      category: 'social'
    },
    {
      id: '4',
      title: 'Guest Lecture Series',
      date: '2025-04-25T15:00:00',
      location: 'Lecture Hall A',
      description: 'Hosting Dr. Emily Chen from Stanford University.',
      category: 'lecture'
    }
  ];

  const getEventCategoryBadge = (category: string) => {
    switch(category) {
      case 'research':
        return <Badge className="bg-purple-500">Research</Badge>;
      case 'academic':
        return <Badge className="bg-green-500">Academic</Badge>;
      case 'social':
        return <Badge className="bg-blue-500">Social</Badge>;
      case 'lecture':
        return <Badge className="bg-orange-500">Lecture</Badge>;
      default:
        return <Badge>Event</Badge>;
    }
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

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!profile) {
    return null;
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#141821]' : 'bg-gray-50'}`}>
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-20"> {/* Added pt-20 for navbar spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar - User profile */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-[#1A1F2C]' : 'bg-white'}`}>
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white text-3xl font-bold">
                  {profile.name.charAt(0)}
                </div>
                <h2 className="mt-4 text-xl font-bold">{profile.name}</h2>
                <Badge className="mt-2 bg-unilink-professor">Professor</Badge>
                
                {profile.university && (
                  <p className="mt-3 text-gray-600">{profile.university}</p>
                )}
                
                {profile.department && (
                  <p className="text-sm text-gray-500">{profile.department}</p>
                )}
                
                {profile.bio && (
                  <p className="mt-4 text-gray-700">{profile.bio}</p>
                )}
                
                <div className="mt-6 w-full">
                  <Button variant="outline" className="w-full" onClick={() => navigate("/profile")}>
                    Edit Profile
                  </Button>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Connections</h3>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-600">Students</span>
                  <span className="font-medium">87</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-600">Professors</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-600">Alumni</span>
                  <span className="font-medium">36</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content - Posts feed */}
          <div className="lg:col-span-2">
            <Tabs 
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
                <CreatePost />
                
                <div className="mt-6 space-y-6">
                  {postsLoading ? (
                    <div className="text-center py-8">Loading posts...</div>
                  ) : posts && posts.length > 0 ? (
                    posts.map((post) => <PostCard key={post.id} post={post} />)
                  ) : (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                      <h3 className="font-medium text-lg">No posts yet</h3>
                      <p className="text-gray-600 mt-2">
                        Be the first to share something with your university network!
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="network" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Academic Network</CardTitle>
                    <CardDescription>
                      Connect with other academics and students in your field
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-medium">Students</h3>
                        <p className="text-sm text-gray-500 mb-3">Connect with your students</p>
                        <Button variant="outline" size="sm" onClick={() => navigate('/connections')}>
                          Find Students
                        </Button>
                      </div>
                      
                      <div className="border rounded-lg p-4 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                          <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="font-medium">Professors</h3>
                        <p className="text-sm text-gray-500 mb-3">Connect with colleagues</p>
                        <Button variant="outline" size="sm" onClick={() => navigate('/connections')}>
                          Find Colleagues
                        </Button>
                      </div>
                      
                      <div className="border rounded-lg p-4 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                          <Network className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="font-medium">Research Network</h3>
                        <p className="text-sm text-gray-500 mb-3">Find research collaborators</p>
                        <Button variant="outline" size="sm" onClick={() => navigate('/connections')}>
                          Find Collaborators
                        </Button>
                      </div>
                      
                      <div className="border rounded-lg p-4 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                          <Users className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="font-medium">Departments</h3>
                        <p className="text-sm text-gray-500 mb-3">Browse by department</p>
                        <Button variant="outline" size="sm" onClick={() => navigate('/connections')}>
                          Browse Departments
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
                    <CardTitle>Upcoming Academic Events</CardTitle>
                    <CardDescription>
                      Stay informed about upcoming events at your university
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
                              Add to Calendar
                            </Button>
                            <Button size="sm" variant="outline">
                              RSVP
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
        </div>
      </main>
    </div>
  );
};

export default ProfessorDashboard;
