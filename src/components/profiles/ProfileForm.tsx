
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';

const commonDepartments = [
  'Computer Science',
  'Business',
  'Engineering',
  'Liberal Arts',
  'Medicine',
  'Law',
  'Education',
  'Chemistry',
  'Physics',
  'Mathematics',
  'Biology',
  'Psychology',
  'Economics',
  'Sociology',
  'Political Science',
  'History',
  'English',
  'Communications',
  'Art',
  'Music'
];

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
  
  const [errors, setErrors] = useState({
    name: '',
    department: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customDepartment, setCustomDepartment] = useState(false);
  
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
      
      setCustomDepartment(!commonDepartments.includes(profile.department || ''));
    }
  }, [profile]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation errors as user types
    if (name === 'name' || name === 'department') {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'department') {
      setErrors(prev => ({ ...prev, department: '' }));
    }
  };
  
  const validate = () => {
    const newErrors = {
      name: '',
      department: ''
    };
    let isValid = true;
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
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
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
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
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" /> {errors.name}
                </p>
              )}
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
              <Label htmlFor="department">Department *</Label>
              {customDepartment ? (
                <div className="space-y-2">
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Enter your department"
                    className={errors.department ? "border-red-500" : ""}
                  />
                  <Button 
                    type="button" 
                    variant="link" 
                    className="p-0 h-auto text-sm"
                    onClick={() => setCustomDepartment(false)}
                  >
                    Select from common departments
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Select 
                    value={formData.department} 
                    onValueChange={(value) => handleSelectChange('department', value)}
                  >
                    <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonDepartments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    variant="link" 
                    className="p-0 h-auto text-sm"
                    onClick={() => setCustomDepartment(true)}
                  >
                    Enter custom department
                  </Button>
                </div>
              )}
              {errors.department && (
                <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" /> {errors.department}
                </p>
              )}
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
