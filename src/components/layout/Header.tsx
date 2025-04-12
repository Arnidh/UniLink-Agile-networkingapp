
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Menu, X, User, Settings, LogOut, Bell, MessageSquare } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { getUnreadMessagesCount } from '@/services/api';

const Header = () => {
  const { currentUser, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  useEffect(() => {
    const checkUnreadMessages = async () => {
      if (currentUser) {
        const count = await getUnreadMessagesCount();
        setUnreadMessagesCount(count);
      }
    };
    
    checkUnreadMessages();
    
    const interval = setInterval(checkUnreadMessages, 30000);
    
    return () => clearInterval(interval);
  }, [currentUser]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };
  
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
  
  const renderNavLinks = () => (
    <>
      {currentUser && (
        <>
          <Link to="/dashboard">
            <Button variant="ghost" className={`hidden md:inline-flex ${location.pathname === '/dashboard' ? 'bg-gray-100' : ''}`}>
              Dashboard
            </Button>
          </Link>
          <Link to="/connections">
            <Button variant="ghost" className={`hidden md:inline-flex ${location.pathname === '/connections' ? 'bg-gray-100' : ''}`}>
              Network
            </Button>
          </Link>
          <Link to="/messages" className="relative hidden md:block">
            <Button 
              variant="ghost" 
              className={`relative ${location.pathname === '/messages' ? 'bg-gray-100' : ''}`}
            >
              <MessageSquare className="h-5 w-5" />
              <span className="ml-2">Messages</span>
              {unreadMessagesCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
                >
                  {unreadMessagesCount}
                </Badge>
              )}
            </Button>
          </Link>
        </>
      )}
    </>
  );
  
  const renderMobileMenu = () => (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/63a71ce9-c955-47d6-ad75-6d2698674e1b.png" 
            alt="UniLink Logo" 
            className="h-8 w-8" 
          />
          <span className="text-2xl font-bold text-[#5D5FEF]">
            UniLink
          </span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
          <X className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="flex-1 p-4 space-y-2">
        {currentUser ? (
          <>
            <Link to="/dashboard" className="block">
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${location.pathname === '/dashboard' ? 'bg-gray-100' : ''}`}
              >
                Dashboard
              </Button>
            </Link>
            <Link to="/connections" className="block">
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${location.pathname === '/connections' ? 'bg-gray-100' : ''}`}
              >
                Network
              </Button>
            </Link>
            <Link to="/messages" className="block">
              <Button 
                variant="ghost" 
                className={`w-full justify-start flex items-center ${location.pathname === '/messages' ? 'bg-gray-100' : ''}`}
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Messages
                {unreadMessagesCount > 0 && (
                  <Badge className="ml-2 bg-red-500">{unreadMessagesCount}</Badge>
                )}
              </Button>
            </Link>
            <Link to="/profile" className="block">
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${location.pathname === '/profile' ? 'bg-gray-100' : ''}`}
              >
                <User className="h-5 w-5 mr-2" />
                Profile
              </Button>
            </Link>
            <Link to="/settings" className="block">
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${location.pathname === '/settings' ? 'bg-gray-100' : ''}`}
              >
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-500 hover:text-red-700"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Link to="/signin" className="block">
              <Button variant="ghost" className="w-full justify-start">Sign In</Button>
            </Link>
            <Link to="/signup" className="block">
              <Button className="w-full justify-start">Sign Up</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b z-10 shadow-sm">
      <div className="container px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/63a71ce9-c955-47d6-ad75-6d2698674e1b.png" 
                alt="UniLink Logo" 
                className="h-8 w-8" 
              />
              <span className="text-2xl font-bold text-[#5D5FEF]">
                UniLink
              </span>
            </Link>
            
            {isMobile ? (
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}>
                <Menu className="h-6 w-6" />
              </Button>
            ) : (
              <div className="ml-4">
                {renderNavLinks()}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="hidden md:flex">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search users or posts"
                  className="pl-8 w-[220px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            
            {currentUser && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.profile_picture} alt={profile.name} />
                      <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link to="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/messages" className="block md:hidden">
                    <DropdownMenuItem className="cursor-pointer relative">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                      {unreadMessagesCount > 0 && (
                        <Badge className="ml-2 bg-red-500">{unreadMessagesCount}</Badge>
                      )}
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/settings">
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/signin">
                  <Button variant="ghost" className="hidden md:inline-flex">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isMenuOpen && renderMobileMenu()}
    </header>
  );
};

export default Header;
