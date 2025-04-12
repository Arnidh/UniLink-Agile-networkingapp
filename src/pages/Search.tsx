
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon } from "lucide-react";
import { Link } from "react-router-dom";
import PostCard from "@/components/posts/PostCard";
import { searchProfiles, searchPosts } from "@/services/api";
import { Profile, Post } from "@/services/api";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"profiles" | "posts">("profiles");
  const [isLoading, setIsLoading] = useState(false);

  // Search functionality
  useEffect(() => {
    const performSearch = async () => {
      if (!initialQuery) return;
      
      setIsLoading(true);
      
      // Search for profiles
      const foundProfiles = await searchProfiles(initialQuery);
      setProfiles(foundProfiles);
      
      // Search for posts
      try {
        // Assuming we have a searchPosts function in the API
        const foundPosts = await searchPosts(initialQuery);
        setPosts(foundPosts);
      } catch (error) {
        console.error("Error searching posts:", error);
        setPosts([]);
      }
      
      setIsLoading(false);
    };
    
    performSearch();
  }, [initialQuery]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container px-4">
          <h1 className="text-3xl font-bold mb-6">Search Results</h1>
          
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  placeholder="Search users or posts"
                  className="pl-10"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </div>
          </form>
          
          {initialQuery ? (
            <>
              <div className="flex border-b mb-6">
                <Button 
                  variant="ghost" 
                  className={`rounded-none ${activeTab === "profiles" ? "border-b-2 border-unilink-primary" : ""}`}
                  onClick={() => setActiveTab("profiles")}
                >
                  People ({profiles.length})
                </Button>
                <Button 
                  variant="ghost" 
                  className={`rounded-none ${activeTab === "posts" ? "border-b-2 border-unilink-primary" : ""}`}
                  onClick={() => setActiveTab("posts")}
                >
                  Posts ({posts.length})
                </Button>
              </div>
              
              {isLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                  <p className="mt-4">Searching...</p>
                </div>
              ) : (
                <>
                  {activeTab === "profiles" && (
                    <div className="space-y-4">
                      {profiles.length === 0 ? (
                        <p className="text-center py-10 text-gray-500">No profiles found matching "{initialQuery}"</p>
                      ) : (
                        profiles.map(profile => (
                          <Link to={`/profile/${profile.id}`} key={profile.id}>
                            <Card className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4 flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={profile.profile_picture} alt={profile.name} />
                                  <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h3 className="font-semibold">{profile.name}</h3>
                                  <p className="text-sm text-gray-600">
                                    {profile.role} {profile.department ? `• ${profile.department}` : ""}
                                  </p>
                                  {profile.university && (
                                    <p className="text-sm text-gray-600">{profile.university}</p>
                                  )}
                                </div>
                                {profile.department && (
                                  <Badge variant="outline">{profile.department}</Badge>
                                )}
                              </CardContent>
                            </Card>
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                  
                  {activeTab === "posts" && (
                    <div className="space-y-4">
                      {posts.length === 0 ? (
                        <p className="text-center py-10 text-gray-500">No posts found matching "{initialQuery}"</p>
                      ) : (
                        posts.map(post => (
                          <PostCard 
                            key={post.id} 
                            post={post} 
                            readOnly={true} 
                          />
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Search for people or posts</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-500">
                <p>Enter a search term in the field above to find users or posts.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Search;
