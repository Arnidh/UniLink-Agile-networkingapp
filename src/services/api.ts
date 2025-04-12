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

export interface ProfileStatistics {
  postsCount: number;
  connectionsCount: number;
  commentsCount: number;
  lastActive?: string;
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

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export const getProfileStatistics = async (userId: string): Promise<ProfileStatistics> => {
  try {
    const { count: postsCount, error: postsError } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (postsError) throw postsError;
    
    const { count: commentsCount, error: commentsError } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (commentsError) throw commentsError;
    
    const { data: sentConnections, error: sentError } = await supabase
      .from('connections')
      .select('id')
      .eq('requester_id', userId)
      .eq('status', 'accepted');
    
    if (sentError) throw sentError;
    
    const { data: receivedConnections, error: receivedError } = await supabase
      .from('connections')
      .select('id')
      .eq('addressee_id', userId)
      .eq('status', 'accepted');
    
    if (receivedError) throw receivedError;
    
    const connectionsCount = (sentConnections?.length || 0) + (receivedConnections?.length || 0);
    
    const latestDates = [];
    
    const { data: latestPost, error: latestPostError } = await supabase
      .from('posts')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (!latestPostError && latestPost) {
      latestDates.push(new Date(latestPost.created_at));
    }
    
    const { data: latestComment, error: latestCommentError } = await supabase
      .from('comments')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (!latestCommentError && latestComment) {
      latestDates.push(new Date(latestComment.created_at));
    }
    
    const { data: latestConnection, error: latestConnectionError } = await supabase
      .from('connections')
      .select('created_at')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (!latestConnectionError && latestConnection) {
      latestDates.push(new Date(latestConnection.created_at));
    }
    
    let lastActive = undefined;
    if (latestDates.length > 0) {
      const mostRecentDate = new Date(Math.max(...latestDates.map(date => date.getTime())));
      lastActive = mostRecentDate.toISOString();
    }
    
    return {
      postsCount: postsCount || 0,
      commentsCount: commentsCount || 0,
      connectionsCount,
      lastActive
    };
  } catch (error: any) {
    console.error('Error fetching profile statistics:', error);
    toast.error('Error fetching profile statistics', {
      description: error.message || 'An error occurred while fetching profile statistics'
    });
    return {
      postsCount: 0,
      commentsCount: 0,
      connectionsCount: 0
    };
  }
};

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

export const getUserPosts = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
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
    console.error('Error fetching user posts:', error);
    toast.error('Error fetching posts', {
      description: error.message || 'An error occurred while fetching posts'
    });
    return [];
  }
};

export const createPost = async (content: string) => {
  try {
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('comments')
      .insert({ 
        post_id: postId,
        content,
        user_id: user.id
      })
      .select(`
        *,
        profile:profiles(*)
      `)
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

export const getConnections = async (userId: string, status: 'pending' | 'accepted' | 'rejected' | 'all' = 'all') => {
  try {
    let sentQuery = supabase
      .from('connections')
      .select(`
        *,
        profile:profiles!connections_addressee_id_fkey(*)
      `)
      .eq('requester_id', userId);
    
    if (status !== 'all') {
      sentQuery = sentQuery.eq('status', status);
    }
    
    const { data: sentConnections, error: sentError } = await sentQuery;
    
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
    
    const allConnections = [...(sentConnections || []), ...(receivedConnections || [])];
    
    allConnections.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return allConnections as Connection[];
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

export const checkConnectionStatus = async (userId: string, otherUserId: string) => {
  try {
    const { data: sentConnection, error: sentError } = await supabase
      .from('connections')
      .select('*')
      .eq('requester_id', userId)
      .eq('addressee_id', otherUserId)
      .maybeSingle();
    
    if (sentError) throw sentError;
    
    if (sentConnection) {
      return sentConnection.status;
    }
    
    const { data: receivedConnection, error: receivedError } = await supabase
      .from('connections')
      .select('*')
      .eq('requester_id', otherUserId)
      .eq('addressee_id', userId)
      .maybeSingle();
    
    if (receivedError) throw receivedError;
    
    if (receivedConnection) {
      return receivedConnection.status;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error checking connection status:', error);
    return null;
  }
};

export const sendConnectionRequest = async (addresseeId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const existing = await checkConnectionStatus(user.id, addresseeId);
    if (existing) {
      toast.info('Connection request already exists', {
        description: `You already have a ${existing} connection with this user.`
      });
      return null;
    }

    const { data, error } = await supabase
      .from('connections')
      .insert({
        addressee_id: addresseeId,
        requester_id: user.id,
        status: 'pending'
      })
      .select(`
        *,
        profile:profiles!connections_addressee_id_fkey(*)
      `)
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
      .select(`
        *,
        profile:profiles!connections_requester_id_fkey(*)
      `)
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

export const searchProfiles = async (query: string) => {
  try {
    if (!query.trim()) return [];
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`name.ilike.%${query}%, university.ilike.%${query}%, department.ilike.%${query}%`)
      .limit(50);
    
    if (error) throw error;
    
    const { data: { user } } = await supabase.auth.getUser();
    const filteredData = user ? data.filter(profile => profile.id !== user.id) : data;
    
    return filteredData as Profile[];
  } catch (error: any) {
    console.error('Error searching profiles:', error);
    toast.error('Error searching profiles', {
      description: error.message || 'An error occurred while searching profiles'
    });
    return [];
  }
};

export const getProfileById = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    return data as Profile | null;
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    toast.error('Error fetching profile', {
      description: error.message || 'An error occurred while fetching the profile'
    });
    return null;
  }
};

export const getAllProfiles = async (role?: string, limit: number = 50) => {
  try {
    let query = supabase
      .from('profiles')
      .select('*')
      .limit(limit);
    
    if (role) {
      query = query.eq('role', role);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const { data: { user } } = await supabase.auth.getUser();
    const filteredData = user ? data.filter(profile => profile.id !== user.id) : data;
    
    return filteredData as Profile[];
  } catch (error: any) {
    console.error('Error fetching profiles:', error);
    toast.error('Error fetching profiles', {
      description: error.message || 'An error occurred while fetching profiles'
    });
    return [];
  }
};

export const getDepartmentStatistics = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_department_stats');
    
    if (error) throw error;
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching department statistics:', error);
    toast.error('Error fetching statistics', {
      description: error.message || 'An error occurred while fetching statistics'
    });
    return [];
  }
};

export const getUniversityStatistics = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_university_stats');
    
    if (error) throw error;
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching university statistics:', error);
    toast.error('Error fetching statistics', {
      description: error.message || 'An error occurred while fetching statistics'
    });
    return [];
  }
};

export const getRoleStatistics = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_role_stats');
    
    if (error) throw error;
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching role statistics:', error);
    toast.error('Error fetching statistics', {
      description: error.message || 'An error occurred while fetching statistics'
    });
    return [];
  }
};

export const likePost = async (postId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('likes')
      .insert({ 
        post_id: postId,
        user_id: user.id 
      });
    
    if (error) {
      if (error.code === '23505') {
        return true;
      }
      throw error;
    }
    
    return true;
  } catch (error: any) {
    console.error('Error liking post:', error);
    toast.error('Error liking post', {
      description: error.message || 'An error occurred while liking the post'
    });
    return false;
  }
};

export const unlikePost = async (postId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('likes')
      .delete()
      .match({ 
        post_id: postId,
        user_id: user.id 
      });
    
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error('Error unliking post:', error);
    toast.error('Error unliking post', {
      description: error.message || 'An error occurred while unliking the post'
    });
    return false;
  }
};

export const getPostLikes = async (postId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_post_likes_count', {
        post_id_param: postId
      });
    
    if (error) throw error;
    
    return data || 0;
  } catch (error: any) {
    console.error('Error getting post likes:', error);
    return 0;
  }
};

export const hasUserLikedPost = async (postId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .rpc('has_user_liked_post', {
        user_id_param: user.id,
        post_id_param: postId
      });
    
    if (error) throw error;
    
    return data || false;
  } catch (error: any) {
    console.error('Error checking if user liked post:', error);
    return false;
  }
};

export const sendMessage = async (recipientId: string, content: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('messages')
      .insert({ 
        sender_id: user.id,
        recipient_id: recipientId,
        content
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    toast.success('Message sent');
    
    return data;
  } catch (error: any) {
    console.error('Error sending message:', error);
    toast.error('Error sending message', {
      description: error.message || 'An error occurred while sending the message'
    });
    return null;
  }
};

export const getMessages = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    toast.error('Error fetching messages', {
      description: error.message || 'An error occurred while fetching messages'
    });
    return [];
  }
};

export const markMessageAsRead = async (messageId: string) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);
    
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error('Error marking message as read:', error);
    return false;
  }
};

export const getUnreadMessagesCount = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .eq('read', false);
    
    if (error) throw error;
    
    return count || 0;
  } catch (error: any) {
    console.error('Error getting unread messages count:', error);
    return 0;
  }
};

export const searchPosts = async (query: string): Promise<Post[]> => {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, profiles:user_id(*)')
    .textSearch('content', query, {
      type: 'websearch',
      config: 'english'
    });
  
  if (error) {
    console.error("Error searching posts:", error);
    return [];
  }
  
  const postsWithCommentCounts = await Promise.all(
    (posts || []).map(async (post) => {
      const commentsCount = await getCommentsCount(post.id);
      return { ...post, comments_count: commentsCount };
    })
  );
  
  return postsWithCommentCounts;
};

export const getCommentsCount = async (postId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId);
  
  if (error) throw error;
  
  return count || 0;
};
