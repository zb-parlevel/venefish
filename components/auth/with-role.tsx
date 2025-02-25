import { useRouter } from 'next/navigation';
import { FC, ComponentType, useEffect } from 'react';
import { useAuthRole } from '@/hooks/use-auth-role';
import { UserRole, hasPermission } from '@/lib/roles';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface WithRoleProps {
  requiredRole: UserRole;
}

export function withRole<P extends object>(
  WrappedComponent: ComponentType<P>,
  requiredRole: UserRole
) {
  return function WithRoleWrapper(props: P) {
    const { role, isLoading } = useAuthRole();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !hasPermission(role, requiredRole)) {
        router.push('/unauthorized');
      }
    }, [isLoading, role, router]);

    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (!hasPermission(role, requiredRole)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
