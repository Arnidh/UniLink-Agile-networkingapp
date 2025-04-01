
import React from "react";
import { UserRole } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { GraduationCap, Library, Briefcase } from "lucide-react";

interface RoleSelectorProps {
  selectedRole: UserRole;
  onChange: (role: UserRole) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onChange }) => {
  const roles: { id: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: "student",
      label: "Student",
      icon: <GraduationCap size={24} />,
      color: "bg-unilink-student"
    },
    {
      id: "professor",
      label: "Professor",
      icon: <Library size={24} />,
      color: "bg-unilink-professor"
    },
    {
      id: "alumni",
      label: "Alumni",
      icon: <Briefcase size={24} />,
      color: "bg-unilink-alumni"
    }
  ];

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium">I am a:</label>
      <div className="grid grid-cols-3 gap-4">
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => onChange(role.id)}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all",
              selectedRole === role.id
                ? `border-${role.color.split('-')[1]} bg-${role.color.split('-')[1]}/10`
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <div className={cn("p-2 rounded-full text-white mb-2", role.color)}>
              {role.icon}
            </div>
            <span className="font-medium">{role.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;
