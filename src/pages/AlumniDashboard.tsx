
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import CreatePost from "@/components/posts/CreatePost";
import PostCard from "@/components/posts/PostCard";
import { getPosts } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

const AlumniDashboard: React.FC = () => {
  const { currentUser, profile, isLoading } = useAuth();
  const navigate = useNavigate();

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

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar - User profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                  {profile.name.charAt(0)}
                </div>
                <h2 className="mt-4 text-xl font-bold">{profile.name}</h2>
                <Badge className="mt-2 bg-unilink-alumni">Alumni</Badge>
                
                {profile.university && (
                  <p className="mt-3 text-gray-600">{profile.university}</p>
                )}
                
                {profile.graduation_year && (
                  <p className="text-sm text-gray-500">Class of {profile.graduation_year}</p>
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
                <h3 className="font-medium text-gray-900">Connections</h3>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-600">Alumni</span>
                  <span className="font-medium">28</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-600">Students</span>
                  <span className="font-medium">42</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-600">Professors</span>
                  <span className="font-medium">13</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content - Posts feed */}
          <div className="lg:col-span-2">
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default AlumniDashboard;
