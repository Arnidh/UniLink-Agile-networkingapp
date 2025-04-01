
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRole, useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RoleSelector from "./RoleSelector";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const SignUpForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { signUp, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    // Validate password match
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }
    
    // Validate password strength
    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters long");
      return;
    }
    
    try {
      await signUp(name, email, password, role);
      toast.success("Account created successfully");
      
      // Navigate to the appropriate dashboard based on role
      navigate(`/${role}-dashboard`);
    } catch (error) {
      // Error is handled in the AuthContext
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <RoleSelector selectedRole={role} onChange={setRole} />
      
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-11 rounded-lg"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-11 rounded-lg"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 rounded-lg pr-10"
          />
          <button 
            type="button" 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="text-xs text-gray-500">Password must be at least 8 characters</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="h-11 rounded-lg pr-10"
          />
          <button 
            type="button" 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={toggleConfirmPasswordVisibility}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      
      {validationError && (
        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <p className="text-sm text-red-600">{validationError}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <Button
        type="submit"
        className="w-full unilink-gradient h-12 rounded-lg text-base font-medium"
        disabled={isLoading}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
};

export default SignUpForm;
