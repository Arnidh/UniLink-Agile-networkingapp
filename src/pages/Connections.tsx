
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Profile, Connection, searchProfiles, getConnections, sendConnectionRequest, respondToConnectionRequest } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, Users, Link2 } from 'lucide-react';
import ConnectionCard from '@/components/connections/ConnectionCard';

const Connections = () => {
  const { currentUser, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [sentRequests, setSentRequests] = useState<Connection[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading2, setIsLoading2] = useState(true);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/signin');
    }
  }, [currentUser, isLoading, navigate]);

  useEffect(() => {
    if (currentUser) {
      loadConnections();
    }
  }, [currentUser]);

  const loadConnections = async () => {
    if (!currentUser) return;
    
    setIsLoading2(true);
    const allConnections = await getConnections(currentUser.id, 'all');
    
    const accepted = allConnections.filter(conn => conn.status === 'accepted');
    const pending = allConnections.filter(
      conn => conn.status === 'pending' && conn.addressee_id === currentUser.id
    );
    const sent = allConnections.filter(
      conn => conn.status === 'pending' && conn.requester_id === currentUser.id
    );
    
    setConnections(accepted);
    setPendingRequests(pending);
    setSentRequests(sent);
    setIsLoading2(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    const results = await searchProfiles(searchQuery);
    
    // Filter out the current user
    const filteredResults = results.filter(user => user.id !== currentUser?.id);
    
    // Filter out users that are already connected or have pending connections
    const allConnectionUserIds = [...connections, ...pendingRequests, ...sentRequests]
      .map(conn => {
        if (conn.requester_id === currentUser?.id) return conn.addressee_id;
        return conn.requester_id;
      });
    
    const finalResults = filteredResults.filter(
      user => !allConnectionUserIds.includes(user.id)
    );
    
    setSearchResults(finalResults);
    setIsSearching(false);
  };

  const handleConnect = async (userId: string) => {
    const connection = await sendConnectionRequest(userId);
    if (connection) {
      setSentRequests([...sentRequests, connection]);
      // Remove from search results
      setSearchResults(searchResults.filter(user => user.id !== userId));
    }
  };

  const handleConnectionResponse = async (connection: Connection) => {
    await loadConnections();
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

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container py-8 flex justify-center items-center">
          <p className="text-lg text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Your Network</h1>
            <p className="text-gray-600 mt-1">
              Connect with other students, professors, and alumni in your university network
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">Find Connections</CardTitle>
                  <CardDescription>
                    Search for people by name, university, or department
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search people..."
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

                  {isSearching ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="mt-6 space-y-4">
                      <h3 className="text-sm font-medium text-gray-500">
                        {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {searchResults.map(user => (
                          <Card key={user.id} className="overflow-hidden border">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage src={user.profile_picture} alt={user.name} />
                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="font-semibold">
                                      {user.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                                        {user.role}
                                      </Badge>
                                      {user.department && (
                                        <span className="text-xs text-gray-500">{user.department}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleConnect(user.id)}
                                  className="gap-1"
                                >
                                  <UserPlus className="h-4 w-4" />
                                  Connect
                                </Button>
                              </div>
                              {user.bio && (
                                <p className="text-sm text-gray-600 mt-3 line-clamp-2">{user.bio}</p>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="mt-2 text-gray-500"
                                onClick={() => navigate(`/profile/${user.id}`)}
                              >
                                View Profile
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : searchQuery.trim() !== '' && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">
                    <Users className="h-4 w-4 mr-2" />
                    My Connections ({connections.length})
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Pending Requests ({pendingRequests.length})
                  </TabsTrigger>
                  <TabsTrigger value="sent">
                    <Link2 className="h-4 w-4 mr-2" />
                    Sent Requests ({sentRequests.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Connections</CardTitle>
                      <CardDescription>
                        People you are connected with in your network
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading2 ? (
                        <div className="text-center py-4">
                          <p className="text-gray-500">Loading connections...</p>
                        </div>
                      ) : connections.length === 0 ? (
                        <div className="text-center py-6">
                          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-lg font-medium text-gray-900">No connections yet</h3>
                          <p className="text-gray-500 mt-1">
                            Start building your network by connecting with others
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {connections.map(connection => (
                            <Card key={connection.id} className="overflow-hidden border">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarImage 
                                        src={connection.profile?.profile_picture} 
                                        alt={connection.profile?.name} 
                                      />
                                      <AvatarFallback>
                                        {connection.profile ? getInitials(connection.profile.name) : "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="font-semibold">
                                        {connection.profile?.name || "Unknown User"}
                                      </h3>
                                      <div className="flex items-center gap-2 mt-1">
                                        {connection.profile?.role && (
                                          <Badge variant="outline" className={getRoleBadgeColor(connection.profile.role)}>
                                            {connection.profile.role}
                                          </Badge>
                                        )}
                                        {connection.profile?.department && (
                                          <span className="text-xs text-gray-500">{connection.profile.department}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => navigate(`/profile/${connection.profile?.id}`)}
                                  >
                                    View
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="pending">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pending Requests</CardTitle>
                      <CardDescription>
                        People who want to connect with you
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading2 ? (
                        <div className="text-center py-4">
                          <p className="text-gray-500">Loading requests...</p>
                        </div>
                      ) : pendingRequests.length === 0 ? (
                        <div className="text-center py-6">
                          <h3 className="text-lg font-medium text-gray-900">No pending requests</h3>
                          <p className="text-gray-500 mt-1">
                            When someone wants to connect with you, their request will appear here
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
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
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="sent">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sent Requests</CardTitle>
                      <CardDescription>
                        People you've requested to connect with
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading2 ? (
                        <div className="text-center py-4">
                          <p className="text-gray-500">Loading sent requests...</p>
                        </div>
                      ) : sentRequests.length === 0 ? (
                        <div className="text-center py-6">
                          <h3 className="text-lg font-medium text-gray-900">No sent requests</h3>
                          <p className="text-gray-500 mt-1">
                            When you send connection requests, they will appear here
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {sentRequests.map(request => (
                            <Card key={request.id}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarImage 
                                        src={request.profile?.profile_picture} 
                                        alt={request.profile?.name} 
                                      />
                                      <AvatarFallback>
                                        {request.profile ? getInitials(request.profile.name) : "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="font-semibold">
                                        {request.profile?.name || "Unknown User"}
                                      </h3>
                                      <div className="flex items-center gap-2 mt-1">
                                        {request.profile?.role && (
                                          <Badge variant="outline" className={getRoleBadgeColor(request.profile.role)}>
                                            {request.profile.role}
                                          </Badge>
                                        )}
                                        {request.profile?.department && (
                                          <span className="text-xs text-gray-500">{request.profile.department}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <Badge variant="outline">Pending</Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="lg:col-span-1">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={profile.profile_picture} alt={profile.name} />
                      <AvatarFallback className="text-xl">{getInitials(profile.name)}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold">{profile.name}</h2>
                    <Badge className={`mt-2 ${getRoleBadgeColor(profile.role)}`}>
                      {profile.role}
                    </Badge>
                    {profile.university && (
                      <p className="text-gray-600 mt-2">{profile.university}</p>
                    )}
                    {profile.department && (
                      <p className="text-gray-500 text-sm">{profile.department}</p>
                    )}
                    <Button 
                      className="mt-4 w-full" 
                      variant="outline"
                      onClick={() => navigate('/profile')}
                    >
                      View My Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Connection Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Connections</span>
                      <span className="font-medium">{connections.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Pending Requests</span>
                      <span className="font-medium">{pendingRequests.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Sent Requests</span>
                      <span className="font-medium">{sentRequests.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Connections;
