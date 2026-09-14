// src/components/layout/RoleRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import type { UserRole } from '../../types';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/dashboard',
}) => {
  const { hasRole } = useRole();

  if (!hasRole(allowedRoles)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;