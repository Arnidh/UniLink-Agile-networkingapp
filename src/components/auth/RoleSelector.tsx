
import React from "react";
import { UserRole } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { GraduationCap, Library, Briefcase } from "lucide-react";

interface RoleSelectorProps {
  selectedRole: UserRole;
  onChange: (role: UserRole) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onChange }) => {
  const roles: { id: UserRole; label: string; icon: React.ReactNode; color: string; description: string }[] = [
    {
      id: "student",
      label: "Student",
      icon: <GraduationCap size={28} />,
      color: "bg-unilink-student",
      description: "Connect with peers and professors"
    },
    {
      id: "professor",
      label: "Professor",
      icon: <Library size={28} />,
      color: "bg-unilink-professor",
      description: "Mentor students and share research"
    },
    {
      id: "alumni",
      label: "Alumni",
      icon: <Briefcase size={28} />,
      color: "bg-unilink-alumni",
      description: "Network and give back to the community"
    }
  ];

  return (
    <div className="flex flex-col space-y-3">
      <label className="text-sm font-medium">I am a:</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => onChange(role.id)}
            className={cn(
              "flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all",
              selectedRole === role.id
                ? `border-${role.id === "student" ? "unilink-student" : role.id === "professor" ? "unilink-professor" : "unilink-alumni"} bg-${role.id === "student" ? "unilink-student" : role.id === "professor" ? "unilink-professor" : "unilink-alumni"}/10`
                : "border-gray-200 hover:border-gray-300 hover:shadow-md"
            )}
          >
            <div className={cn("p-3 rounded-full text-white mb-3", role.color)}>
              {role.icon}
            </div>
            <span className="font-semibold text-lg">{role.label}</span>
            <p className="text-sm text-gray-500 mt-1">{role.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;
