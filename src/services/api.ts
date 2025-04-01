
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Profile {
  id: string;
  name: string;
  role: "student" | "professor" | "alumni";
  bio?: string;
  university?: string;
  department?: string;
  profile_picture?: string;
  graduation_year?: number;
  created_at: string;
  updated_at: string;
}

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
      data.map(async (post: any) => {
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
    toast.error('Error fetching posts', {
      description: error.message || 'An error occurred while fetching posts'
    });
    return [];
  }
};

export const createPost = async (content: string) => {
  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('posts')
      .insert({ 
        content,
        user_id: user.id 
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    toast.success('Post created', {
      description: 'Your post has been successfully created.'
    });
    
    return data as Post;
  } catch (error: any) {
    console.error('Error creating post:', error);
    toast.error('Error creating post', {
      description: error.message || 'An error occurred while creating your post'
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
    
    toast.success('Post updated', {
      description: 'Your post has been successfully updated.'
    });
    
    return data as Post;
  } catch (error: any) {
    console.error('Error updating post:', error);
    toast.error('Error updating post', {
      description: error.message || 'An error occurred while updating your post'
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
    
    toast.success('Post deleted', {
      description: 'Your post has been successfully deleted.'
    });
    
    return true;
  } catch (error: any) {
    console.error('Error deleting post:', error);
    toast.error('Error deleting post', {
      description: error.message || 'An error occurred while deleting your post'
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
    toast.error('Error fetching comments', {
      description: error.message || 'An error occurred while fetching comments'
    });
    return [];
  }
};

export const createComment = async (postId: string, content: string) => {
  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('comments')
      .insert({ 
        post_id: postId,
        content,
        user_id: user.id
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    toast.success('Comment added', {
      description: 'Your comment has been successfully added.'
    });
    
    return data as Comment;
  } catch (error: any) {
    console.error('Error creating comment:', error);
    toast.error('Error adding comment', {
      description: error.message || 'An error occurred while adding your comment'
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
    
    toast.success('Comment updated', {
      description: 'Your comment has been successfully updated.'
    });
    
    return data as Comment;
  } catch (error: any) {
    console.error('Error updating comment:', error);
    toast.error('Error updating comment', {
      description: error.message || 'An error occurred while updating your comment'
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
    
    toast.success('Comment deleted', {
      description: 'Your comment has been successfully deleted.'
    });
    
    return true;
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    toast.error('Error deleting comment', {
      description: error.message || 'An error occurred while deleting your comment'
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
    
    return [...(sentConnections as any), ...(receivedConnections as any)] as Connection[];
  } catch (error: any) {
    console.error('Error fetching connections:', error);
    toast.error('Error fetching connections', {
      description: error.message || 'An error occurred while fetching connections'
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
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('connections')
      .insert({
        addressee_id: addresseeId,
        requester_id: user.id,
        status: 'pending'
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    toast.success('Connection request sent', {
      description: 'Your connection request has been sent.'
    });
    
    return data as Connection;
  } catch (error: any) {
    console.error('Error sending connection request:', error);
    toast.error('Error sending connection request', {
      description: error.message || 'An error occurred while sending the connection request'
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
    
    toast.success(`Connection ${status === 'accepted' ? 'accepted' : 'rejected'}`, {
      description: `You have ${status === 'accepted' ? 'accepted' : 'rejected'} the connection request.`
    });
    
    return data as Connection;
  } catch (error: any) {
    console.error('Error responding to connection request:', error);
    toast.error('Error responding to connection request', {
      description: error.message || 'An error occurred while responding to the connection request'
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
