import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X, Home, User, Users, Mail, Settings, LogOut, MessageSquare, Calendar, Search } from 'lucide-react';
import { getUnreadMessagesCount } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';

const Header = () => {
  const { theme } = useTheme();
  const { currentUser, profile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthenticated = !!currentUser;

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (currentUser) {
        const count = await getUnreadMessagesCount();
        setUnreadCount(count);
      }
    };

    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 60000);
    
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header className={`
      ${theme === 'dark' 
        ? 'bg-[#1A1F2C] border-gray-800' 
        : 'bg-white border-gray-200'
      } 
      border-b py-3 px-4 fixed top-0 left-0 right-0 z-50`
    }>
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/c8b61bdd-a537-4d22-a772-d93ab3de15e0.png" 
                alt="UniLink Logo" 
                className="h-8 w-8" 
              />
              <span className="text-2xl font-bold text-[#5D5FEF]">
                UniLink
              </span>
            </Link>
            
            {isAuthenticated && (
              <nav className="hidden md:flex items-center ml-8 space-x-6">
                <Link 
                  to="/dashboard" 
                  className={`text-gray-600 hover:text-gray-900 font-medium ${
                    isActiveLink("/dashboard") ? "text-unilink-primary" : ""
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/connections" 
                  className={`text-gray-600 hover:text-gray-900 font-medium ${
                    isActiveLink("/connections") ? "text-unilink-primary" : ""
                  }`}
                >
                  Connections
                </Link>
                <Link 
                  to="/events" 
                  className={`text-gray-600 hover:text-gray-900 font-medium ${
                    isActiveLink("/events") ? "text-unilink-primary" : ""
                  }`}
                >
                  Events
                </Link>
                <Link 
                  to="/messages" 
                  className={`text-gray-600 hover:text-gray-900 font-medium relative ${
                    isActiveLink("/messages") ? "text-unilink-primary" : ""
                  }`}
                >
                  Messages
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 px-1 h-5 min-w-5 flex justify-center items-center rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Link>
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hidden md:flex"
                  onClick={() => navigate('/search')}
                >
                  <Search className="h-5 w-5" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.profile_picture} />
                      <AvatarFallback>{profile ? getInitials(profile.name) : "U"}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <Home className="mr-2 h-4 w-4" /> Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/connections')}>
                      <Users className="mr-2 h-4 w-4" /> Connections
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/messages')}>
                      <Mail className="mr-2 h-4 w-4" /> Messages
                      {unreadCount > 0 && (
                        <Badge className="ml-auto bg-red-500 px-1.5">
                          {unreadCount}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/events')}>
                      <Calendar className="mr-2 h-4 w-4" /> Events
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <button 
                  className="md:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X /> : <Menu />}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {isMenuOpen && isAuthenticated && (
          <div className="md:hidden mt-4 py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/dashboard" 
                className="flex items-center text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
              <Link 
                to="/profile" 
                className="flex items-center text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
              <Link 
                to="/connections" 
                className="flex items-center text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="mr-2 h-4 w-4" />
                Connections
              </Link>
              <Link 
                to="/messages" 
                className="flex items-center text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-red-500">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
              <Link 
                to="/events" 
                className="flex items-center text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Events
              </Link>
              <Link 
                to="/search" 
                className="flex items-center text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Link>
              <Link 
                to="/settings" 
                className="flex items-center text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
              <button 
                className="flex items-center text-gray-600 hover:text-gray-900"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
