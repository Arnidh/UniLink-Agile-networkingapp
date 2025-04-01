
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { Comment, getComments, createComment, deleteComment, updateComment } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/hooks/use-toast';

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { currentUser, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  
  useEffect(() => {
    loadComments();
  }, [postId]);
  
  const loadComments = async () => {
    setIsLoading(true);
    const fetchedComments = await getComments(postId);
    setComments(fetchedComments);
    setIsLoading(false);
  };
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please write something before commenting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const comment = await createComment(postId, newComment);
      if (comment) {
        // Add the profile to the comment for display
        const commentWithProfile = {
          ...comment,
          profile: profile
        };
        setComments([...comments, commentWithProfile as Comment]);
        setNewComment('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    const success = await deleteComment(commentId);
    if (success) {
      setComments(comments.filter(comment => comment.id !== commentId));
    }
  };
  
  const handleEditComment = async (commentId: string) => {
    if (!editedContent.trim()) return;
    
    const updatedComment = await updateComment(commentId, editedContent);
    if (updatedComment) {
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...updatedComment, profile: comment.profile } 
          : comment
      ));
      setEditingCommentId(null);
    }
  };
  
  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditedContent(comment.content);
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="py-4 text-center text-gray-500">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="py-4 text-center text-gray-500">No comments yet. Be the first to comment!</div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.profile?.profile_picture} alt={comment.profile?.name || "User"} />
                <AvatarFallback>{comment.profile ? getInitials(comment.profile.name) : "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm">{comment.profile?.name}</h4>
                      {editingCommentId === comment.id ? (
                        <div className="mt-2">
                          <Textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="min-h-[60px] mb-2"
                          />
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setEditingCommentId(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleEditComment(comment.id)}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-md">{comment.content}</p>
                      )}
                    </div>
                    
                    {currentUser?.id === comment.user_id && !editingCommentId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEditing(comment)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteComment(comment.id)} className="cursor-pointer text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add comment form */}
      <form onSubmit={handleSubmitComment} className="mt-4 flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile?.profile_picture} alt={profile?.name || "User"} />
          <AvatarFallback>{profile ? getInitials(profile.name) : "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-[60px] mb-2"
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="sm"
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
