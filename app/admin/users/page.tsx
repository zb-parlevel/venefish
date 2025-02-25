'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { withRole } from '@/components/auth/with-role';
import { ROLES } from '@/lib/roles';
import { useFirestore } from 'reactfire';
import { collection, getDocs, QueryDocumentSnapshot } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface User {
  id: string;
  email: string;
  role: string;
  subscriptionTier: string;
  createdAt: string;
}

const columns: ColumnDef<User, any>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      return (
        <Badge variant={
          role === 'admin' ? 'destructive' :
          role === 'manager' ? 'default' :
          'secondary'
        }>
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'subscriptionTier',
    header: 'Subscription',
    cell: ({ row }) => {
      const tier = row.getValue('subscriptionTier') as string;
      return (
        <Badge variant={
          tier === 'premium' ? 'default' :
          tier === 'pro' ? 'destructive' :
          'secondary'
        }>
          {tier}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const timestamp = row.getValue('createdAt') as string;
      return new Date(timestamp).toLocaleDateString();
    },
  },
];

function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    async function fetchUsers() {
      try {
        console.log('Fetching users...');
        const usersCollection = collection(firestore, 'users');
        const snapshot = await getDocs(usersCollection);
        console.log('Snapshot size:', snapshot.size);
        console.log('Raw docs:', snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        const usersData = snapshot.docs.map((doc: QueryDocumentSnapshot) => {
          const data = doc.data();
          console.log('Processing doc:', doc.id, data);
          return {
            id: doc.id,
            email: data.email || '',
            role: data.role || 'staff',
            subscriptionTier: data.subscriptionTier || 'core',
            createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
          };
        }) as User[];
        
        console.log('Processed users:', usersData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [firestore]);

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">User Management</h1>
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">User Management</h1>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">User Management</h1>
      {users.length === 0 ? (
        <div className="text-center py-4">
          No users found. Try signing up a new user.
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={users}
          searchKey="email"
        />
      )}
    </div>
  );
}

export default withRole(UserManagementPage, ROLES.ADMIN);
