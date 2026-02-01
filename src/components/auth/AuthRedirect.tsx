import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export const AuthRedirect = () => {
  const { user, role, loading, isRoleLoading } = useAuth();
  
  if (loading || isRoleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  if (!role) return <Navigate to="/onboarding/role" replace />;
  
  const paths = { patient: '/patient', therapist: '/therapist', admin: '/admin' } as const;
  return <Navigate to={paths[role]} replace />;
};
