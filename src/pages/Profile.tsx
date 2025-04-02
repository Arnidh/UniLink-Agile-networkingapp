
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import { Profile as ProfileType, getConnections } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Link2 } from 'lucide-react';

const Profile = () => {
  const { currentUser, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [connectionCount, setConnectionCount] = useState(0);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/signin');
    }
  }, [currentUser, isLoading, navigate]);

  useEffect(() => {
    const fetchConnectionCount = async () => {
      if (currentUser) {
        const connections = await getConnections(currentUser.id, 'accepted');
        setConnectionCount(connections.length);
      }
    };

    fetchConnectionCount();
  }, [currentUser]);

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container py-8 flex justify-center items-center">
          <p className="text-lg text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

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
                    src={profile.profile_picture || "/placeholder.svg"} 
                    alt={profile.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="pt-20">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold">{profile.name}</h1>
                    <div className="mt-1 flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${getRoleBadgeColor(profile.role)}`}>
                        {profile.role}
                      </span>
                      {profile.university && (
                        <span className="text-sm text-gray-600">{profile.university}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => navigate('/connections')}
                    >
                      <Link2 className="h-4 w-4" />
                      Connections ({connectionCount})
                    </Button>
                    <Button 
                      onClick={() => navigate('/edit-profile')} 
                      className="px-4 py-2"
                    >
                      Edit Profile
                    </Button>
                  </div>
                </div>
                
                {profile.bio && (
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-2">About</h2>
                    <p className="text-gray-700">{profile.bio}</p>
                  </div>
                )}
                
                <div className="mt-6 border-t pt-6">
                  <h2 className="text-lg font-semibold mb-4">Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.department && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Department</h3>
                        <p className="text-gray-700">{profile.department}</p>
                      </div>
                    )}
                    
                    {profile.graduation_year && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Graduation Year</h3>
                        <p className="text-gray-700">{profile.graduation_year}</p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                      <p className="text-gray-700">{new Date(profile.created_at).toLocaleDateString()}</p>
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

export default Profile;
