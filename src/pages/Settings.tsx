import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Lock, User, Globe, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Settings = () => {
  const { currentUser, profile, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    connectionRequests: true,
    messageNotifications: true,
    postMentions: true
  });
  
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'everyone',
    allowMessages: true,
    showOnlineStatus: true,
  });

  // Set dark mode switch based on the actual theme
  const [darkModeEnabled, setDarkModeEnabled] = useState(theme === 'dark');
  
  // Keep dark mode switch in sync with theme
  useEffect(() => {
    setDarkModeEnabled(theme === 'dark');
  }, [theme]);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/signin');
    }
  }, [currentUser, isLoading, navigate]);
  
  const handleSaveSettings = (settingType: string) => {
    toast.success(`Your ${settingType} settings have been updated.`);
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkModeEnabled(checked);
    toggleTheme();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container py-8 flex justify-center items-center">
          <p className="text-lg text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center mb-6 pt-4">
                  <Avatar className="h-20 w-20 mb-3">
                    <AvatarImage src={profile.profile_picture} alt={profile.name} />
                    <AvatarFallback className="text-lg">{getInitials(profile.name)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{profile.role}</p>
                </div>
                
                <Tabs 
                  value={activeTab} 
                  onValueChange={setActiveTab} 
                  orientation="vertical" 
                  className="w-full"
                >
                  <TabsList className="flex flex-col h-auto items-stretch p-0 bg-transparent">
                    <TabsTrigger 
                      value="profile" 
                      className="justify-start gap-3 px-3 py-2 data-[state=active]:bg-accent rounded-md"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </TabsTrigger>
                    <TabsTrigger 
                      value="privacy" 
                      className="justify-start gap-3 px-3 py-2 data-[state=active]:bg-accent rounded-md"
                    >
                      <Lock className="h-4 w-4" />
                      Privacy
                    </TabsTrigger>
                    <TabsTrigger 
                      value="notifications" 
                      className="justify-start gap-3 px-3 py-2 data-[state=active]:bg-accent rounded-md"
                    >
                      <Bell className="h-4 w-4" />
                      Notifications
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content */}
          <div className="md:col-span-9">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="profile" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>
                      Manage your profile information and visibility
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        To update your profile information, go to your profile page.
                      </p>
                      <Button onClick={() => navigate('/profile')}>
                        Edit Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="privacy" className="m-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>
                      Control who can see your information and how your data is used
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="profile-visibility" className="text-base">Profile Visibility</Label>
                          <p className="text-sm text-muted-foreground">Control who can view your profile</p>
                        </div>
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                          <select 
                            id="profile-visibility"
                            className="rounded-md border bg-background py-2 px-3 text-sm"
                            value={privacy.profileVisibility}
                            onChange={(e) => setPrivacy({...privacy, profileVisibility: e.target.value})}
                          >
                            <option value="everyone">Everyone</option>
                            <option value="connections">Connections Only</option>
                            <option value="university">University Members</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="allow-messages" className="text-base">Allow Direct Messages</Label>
                          <p className="text-sm text-muted-foreground">Allow others to send you direct messages</p>
                        </div>
                        <Switch 
                          id="allow-messages" 
                          checked={privacy.allowMessages}
                          onCheckedChange={(checked) => setPrivacy({...privacy, allowMessages: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="show-status" className="text-base">Show Online Status</Label>
                          <p className="text-sm text-muted-foreground">Let others see when you're active</p>
                        </div>
                        <Switch 
                          id="show-status" 
                          checked={privacy.showOnlineStatus}
                          onCheckedChange={(checked) => setPrivacy({...privacy, showOnlineStatus: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                          <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Sun className="h-4 w-4 text-muted-foreground" />
                          <Switch 
                            id="dark-mode" 
                            checked={darkModeEnabled}
                            onCheckedChange={handleDarkModeToggle}
                          />
                          <Moon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      
                      <Button onClick={() => handleSaveSettings('privacy')}>
                        Save Privacy Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="m-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Control which notifications you receive and how
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                        </div>
                        <Switch 
                          id="email-notifications" 
                          checked={notifications.emailNotifications}
                          onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="connection-requests" className="text-base">Connection Requests</Label>
                          <p className="text-sm text-muted-foreground">Get notified about new connection requests</p>
                        </div>
                        <Switch 
                          id="connection-requests" 
                          checked={notifications.connectionRequests}
                          onCheckedChange={(checked) => setNotifications({...notifications, connectionRequests: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="message-notifications" className="text-base">Messages</Label>
                          <p className="text-sm text-muted-foreground">Get notified when you receive messages</p>
                        </div>
                        <Switch 
                          id="message-notifications" 
                          checked={notifications.messageNotifications}
                          onCheckedChange={(checked) => setNotifications({...notifications, messageNotifications: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="post-mentions" className="text-base">Post Mentions</Label>
                          <p className="text-sm text-muted-foreground">Get notified when mentioned in posts</p>
                        </div>
                        <Switch 
                          id="post-mentions" 
                          checked={notifications.postMentions}
                          onCheckedChange={(checked) => setNotifications({...notifications, postMentions: checked})}
                        />
                      </div>
                      
                      <Button onClick={() => handleSaveSettings('notification')}>
                        Save Notification Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
