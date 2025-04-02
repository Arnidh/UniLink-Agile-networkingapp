
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import { getPosts, Post } from '@/services/api';
import CreatePost from '@/components/posts/CreatePost';
import PostCard from '@/components/posts/PostCard';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser, profile, isLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const navigate = useNavigate();

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

  if (isLoading) {
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left sidebar - User Profile Summary */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
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
            </div>
          </div>
          
          {/* Main content area - Posts feed */}
          <div className="lg:col-span-6">
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
          </div>
          
          {/* Right sidebar - Connections */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold mb-4">Grow your network</h2>
              <p className="text-sm text-gray-500">
                Connect with other students, professors, and alumni to expand your professional network.
              </p>
              <button 
                onClick={() => navigate('/connections')} 
                className="mt-4 w-full py-2 bg-unilink-primary text-white rounded-md hover:bg-unilink-primary/90 transition-colors"
              >
                Find connections
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
