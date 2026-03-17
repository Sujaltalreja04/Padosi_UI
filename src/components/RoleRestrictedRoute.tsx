import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRouteSkeleton from '@/components/skeletons/ProtectedRouteSkeleton';

interface RoleRestrictedRouteProps {
  children: React.ReactNode;
}

// Routes that agents and distributors are NOT allowed to access
// They will be redirected to their respective dashboards
const RoleRestrictedRoute: React.FC<RoleRestrictedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <ProtectedRouteSkeleton />;
  }

  // If user is an agent, redirect to agent dashboard
  if (user?.role === 'agent') {
    // Allow agents to access only their specific pages
    const allowedAgentPaths = ['/agent-dashboard', '/agent-profile-setup', '/login', '/register'];
    const isAllowedPath = allowedAgentPaths.some(path => location.pathname.startsWith(path));
    
    // Also allow agents to view their own profile page
    const isOwnProfilePage = location.pathname === `/agent/${user.id}`;
    
    if (!isAllowedPath && !isOwnProfilePage) {
      return <Navigate to="/agent-dashboard" replace />;
    }
  }

  // If user is a distributor, redirect to distributor dashboard
  if (user?.role === 'distributor') {
    // Allow distributors to access only their specific pages
    const allowedDistributorPaths = ['/distributor-dashboard', '/login', '/register'];
    const isAllowed = allowedDistributorPaths.some(path => location.pathname.startsWith(path));
    
    if (!isAllowed) {
      return <Navigate to="/distributor-dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default RoleRestrictedRoute;
