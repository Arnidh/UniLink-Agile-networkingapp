
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  comments_count?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  profile?: Profile; // The other user's profile
}

// Posts API
export const getPosts = async () => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profile:profiles(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Get comment counts for each post
    const postsWithCommentCounts = await Promise.all(
      data.map(async (post) => {
        const { count, error: countError } = await supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        return {
          ...post,
          comments_count: countError ? 0 : count || 0
        };
      })
    );
    
    return postsWithCommentCounts as Post[];
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    toast({
      title: 'Error fetching posts',
      description: error.message || 'An error occurred while fetching posts',
      variant: 'destructive'
    });
    return [];
  }
};

export const createPost = async (content: string) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({ content })
      .select('*')
      .single();
    
    if (error) throw error;
    
    toast({
      title: 'Post created',
      description: 'Your post has been successfully created.'
    });
    
    return data as Post;
  } catch (error: any) {
    console.error('Error creating post:', error);
    toast({
      title: 'Error creating post',
      description: error.message || 'An error occurred while creating your post',
      variant: 'destructive'
    });
    return null;
  }
};

export const updatePost = async (id: string, content: string) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .update({ content })
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    
    toast({
      title: 'Post updated',
      description: 'Your post has been successfully updated.'
    });
    
    return data as Post;
  } catch (error: any) {
    console.error('Error updating post:', error);
    toast({
      title: 'Error updating post',
      description: error.message || 'An error occurred while updating your post',
      variant: 'destructive'
    });
    return null;
  }
};

export const deletePost = async (id: string) => {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast({
      title: 'Post deleted',
      description: 'Your post has been successfully deleted.'
    });
    
    return true;
  } catch (error: any) {
    console.error('Error deleting post:', error);
    toast({
      title: 'Error deleting post',
      description: error.message || 'An error occurred while deleting your post',
      variant: 'destructive'
    });
    return false;
  }
};

// Comments API
export const getComments = async (postId: string) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    return data as Comment[];
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    toast({
      title: 'Error fetching comments',
      description: error.message || 'An error occurred while fetching comments',
      variant: 'destructive'
    });
    return [];
  }
};

export const createComment = async (postId: string, content: string) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, content })
      .select('*')
      .single();
    
    if (error) throw error;
    
    toast({
      title: 'Comment added',
      description: 'Your comment has been successfully added.'
    });
    
    return data as Comment;
  } catch (error: any) {
    console.error('Error creating comment:', error);
    toast({
      title: 'Error adding comment',
      description: error.message || 'An error occurred while adding your comment',
      variant: 'destructive'
    });
    return null;
  }
};

export const updateComment = async (id: string, content: string) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    
    toast({
      title: 'Comment updated',
      description: 'Your comment has been successfully updated.'
    });
    
    return data as Comment;
  } catch (error: any) {
    console.error('Error updating comment:', error);
    toast({
      title: 'Error updating comment',
      description: error.message || 'An error occurred while updating your comment',
      variant: 'destructive'
    });
    return null;
  }
};

export const deleteComment = async (id: string) => {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast({
      title: 'Comment deleted',
      description: 'Your comment has been successfully deleted.'
    });
    
    return true;
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    toast({
      title: 'Error deleting comment',
      description: error.message || 'An error occurred while deleting your comment',
      variant: 'destructive'
    });
    return false;
  }
};

// Connections API
export const getConnections = async (userId: string, status: 'pending' | 'accepted' | 'rejected' | 'all' = 'all') => {
  try {
    let query = supabase
      .from('connections')
      .select(`
        *,
        profile:profiles!connections_addressee_id_fkey(*)
      `)
      .eq('requester_id', userId);
    
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    const { data: sentConnections, error: sentError } = await query;
    
    if (sentError) throw sentError;
    
    let receivedQuery = supabase
      .from('connections')
      .select(`
        *,
        profile:profiles!connections_requester_id_fkey(*)
      `)
      .eq('addressee_id', userId);
    
    if (status !== 'all') {
      receivedQuery = receivedQuery.eq('status', status);
    }
    
    const { data: receivedConnections, error: receivedError } = await receivedQuery;
    
    if (receivedError) throw receivedError;
    
    return [...sentConnections, ...receivedConnections] as Connection[];
  } catch (error: any) {
    console.error('Error fetching connections:', error);
    toast({
      title: 'Error fetching connections',
      description: error.message || 'An error occurred while fetching connections',
      variant: 'destructive'
    });
    return [];
  }
};

export const getPendingConnectionRequests = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        profile:profiles!connections_requester_id_fkey(*)
      `)
      .eq('addressee_id', userId)
      .eq('status', 'pending');
    
    if (error) throw error;
    
    return data as Connection[];
  } catch (error: any) {
    console.error('Error fetching connection requests:', error);
    return [];
  }
};

export const sendConnectionRequest = async (addresseeId: string) => {
  try {
    const { data, error } = await supabase
      .from('connections')
      .insert({
        addressee_id: addresseeId,
        status: 'pending'
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    toast({
      title: 'Connection request sent',
      description: 'Your connection request has been sent.'
    });
    
    return data as Connection;
  } catch (error: any) {
    console.error('Error sending connection request:', error);
    toast({
      title: 'Error sending connection request',
      description: error.message || 'An error occurred while sending the connection request',
      variant: 'destructive'
    });
    return null;
  }
};

export const respondToConnectionRequest = async (connectionId: string, status: 'accepted' | 'rejected') => {
  try {
    const { data, error } = await supabase
      .from('connections')
      .update({ status })
      .eq('id', connectionId)
      .select('*')
      .single();
    
    if (error) throw error;
    
    toast({
      title: `Connection ${status === 'accepted' ? 'accepted' : 'rejected'}`,
      description: `You have ${status === 'accepted' ? 'accepted' : 'rejected'} the connection request.`
    });
    
    return data as Connection;
  } catch (error: any) {
    console.error('Error responding to connection request:', error);
    toast({
      title: 'Error responding to connection request',
      description: error.message || 'An error occurred while responding to the connection request',
      variant: 'destructive'
    });
    return null;
  }
};

// Profiles API
export const searchProfiles = async (query: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`name.ilike.%${query}%, university.ilike.%${query}%, department.ilike.%${query}%`)
      .limit(10);
    
    if (error) throw error;
    
    return data as Profile[];
  } catch (error: any) {
    console.error('Error searching profiles:', error);
    return [];
  }
};

export const getProfileById = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data as Profile;
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return null;
  }
};
