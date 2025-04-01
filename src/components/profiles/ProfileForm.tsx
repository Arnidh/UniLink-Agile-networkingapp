
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/hooks/use-toast';

const ProfileForm: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    university: '',
    department: '',
    profile_picture: '',
    graduation_year: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        university: profile.university || '',
        department: profile.department || '',
        profile_picture: profile.profile_picture || '',
        graduation_year: profile.graduation_year ? String(profile.graduation_year) : ''
      });
    }
  }, [profile]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please provide your name.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert graduation_year to number if present
      const updatedProfile = {
        ...formData,
        graduation_year: formData.graduation_year 
          ? parseInt(formData.graduation_year, 10) 
          : null
      };
      
      await updateProfile(updatedProfile);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profile_picture">Profile Picture URL</Label>
              <Input
                id="profile_picture"
                name="profile_picture"
                value={formData.profile_picture}
                onChange={handleChange}
                placeholder="https://example.com/profile.jpg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                name="university"
                value={formData.university}
                onChange={handleChange}
                placeholder="e.g. Stanford University"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="graduation_year">Graduation Year</Label>
              <Input
                id="graduation_year"
                name="graduation_year"
                type="number"
                value={formData.graduation_year}
                onChange={handleChange}
                placeholder="e.g. 2025"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself"
                className="min-h-[120px]"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-unilink-primary hover:bg-unilink-primary/90"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
