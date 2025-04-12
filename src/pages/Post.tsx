
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import PostCard from "@/components/posts/PostCard";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Post as PostType } from "@/services/api";

const Post = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<PostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError("No post ID provided");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const { data, error: fetchError } = await supabase
          .from('posts')
          .select('*, profiles:user_id(*)')
          .eq('id', id)
          .single();
          
        if (fetchError) {
          throw new Error(fetchError.message);
        }
        
        if (!data) {
          throw new Error("Post not found");
        }
        
        // Get comments count
        const { count, error: countError } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', id);
          
        if (countError) {
          console.error("Error fetching comments count:", countError);
        }
        
        setPost({
          ...data,
          comments_count: count || 0
        });
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container px-4 max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4">Loading post...</p>
            </div>
          ) : error ? (
            <Card className="mb-4">
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-semibold text-red-500 mb-2">Error</h2>
                <p className="text-gray-600">{error}</p>
                <button 
                  onClick={() => navigate(-1)} 
                  className="mt-4 text-unilink-primary hover:underline"
                >
                  Go back
                </button>
              </CardContent>
            </Card>
          ) : post ? (
            <PostCard post={post} readOnly={true} />
          ) : (
            <Card className="mb-4">
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-semibold mb-2">Post not found</h2>
                <p className="text-gray-600">The post you're looking for doesn't exist or has been removed.</p>
                <button 
                  onClick={() => navigate(-1)} 
                  className="mt-4 text-unilink-primary hover:underline"
                >
                  Go back
                </button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Post;
