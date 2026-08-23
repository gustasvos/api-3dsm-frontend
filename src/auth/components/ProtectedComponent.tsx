import { type ReactNode } from 'react';
import { useCanAccess } from '../hooks/useCanAccess';
import type { UserRole } from '../../config/permissions';

interface ProtectedComponentProps {
  requiredRoles: UserRole | UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean;
}

export const ProtectedComponent = ({
  requiredRoles,
  children,
  fallback = null,
  requireAll = false,
}: ProtectedComponentProps) => {
  const { canAccess } = useCanAccess();

  const hasAccess = canAccess(requiredRoles, requireAll);

  return <>{hasAccess ? children : fallback}</>;
};
