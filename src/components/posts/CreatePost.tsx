
import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { Image, Video, X } from 'lucide-react';
import { uploadPostAttachment } from '@/utils/fileUpload';

interface CreatePostProps {
  onPostCreated?: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile } = useAuth();
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Only images and videos are allowed",
        variant: "destructive"
      });
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && selectedFiles.length === 0) {
      toast({
        title: "Empty post",
        description: "Please write something or add media before posting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const post = await createPost(content);
      
      if (post && selectedFiles.length > 0) {
        await Promise.all(
          selectedFiles.map(file => uploadPostAttachment(file, post.id))
        );
      }
      
      setContent('');
      setSelectedFiles([]);
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
    <Card className="mb-6">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.profile_picture} alt={profile?.name || "User"} />
              <AvatarFallback>{profile ? getInitials(profile.name) : "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share something with your network..."
                className="mb-3 min-h-[100px]"
              />
              
              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-md"
                        />
                      ) : (
                        <video
                          src={URL.createObjectURL(file)}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Add Media
                  </Button>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting || (!content.trim() && selectedFiles.length === 0)}
                  className="bg-unilink-primary hover:bg-unilink-primary/90"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
