
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, ThumbsUp, Share, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Post, deletePost } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: Post;
  onPostDeleted?: () => void;
  onPostUpdated?: (updatedPost: Post) => void;
  readOnly?: boolean; // Add this new prop
}

const PostCard: React.FC<PostCardProps> = ({ post, onPostDeleted, onPostUpdated, readOnly = false }) => {
  const { currentUser } = useAuth();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isOwnPost = currentUser?.id === post.user_id;
  
  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await deletePost(post.id);
    setIsDeleting(false);
    
    if (success && onPostDeleted) {
      onPostDeleted();
    }
  };
  
  const handleUpdatePost = async () => {
    if (!editedContent.trim()) return;
    
    const updatedPost = await import('@/services/api').then(api => 
      api.updatePost(post.id, editedContent)
    );
    
    if (updatedPost && onPostUpdated) {
      onPostUpdated(updatedPost);
      setIsEditing(false);
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
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.profile?.profile_picture} alt={post.profile?.name || "User"} />
              <AvatarFallback>
                {post.profile ? getInitials(post.profile.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-md">{post.profile?.name}</h3>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {isOwnPost && !readOnly && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="my-3">
          <p className="text-md whitespace-pre-wrap">{post.content}</p>
        </div>
      </CardContent>
      
      <CardFooter className="flex-col items-stretch pt-0 pb-2 border-t">
        <div className="flex justify-between py-2">
          <Button variant="ghost" size="sm" className="flex gap-1 items-center text-gray-600">
            <ThumbsUp className="h-4 w-4" />
            <span>Like</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex gap-1 items-center text-gray-600"
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Comment {post.comments_count ? `(${post.comments_count})` : ''}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex gap-1 items-center text-gray-600">
            <Share className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
        
        {isCommentsOpen && !readOnly && (
          <div className="pt-3 border-t">
            <CommentSection postId={post.id} />
          </div>
        )}
      </CardFooter>
      
      {/* Edit Post Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <Textarea 
            value={editedContent} 
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[150px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleUpdatePost}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this post? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PostCard;
