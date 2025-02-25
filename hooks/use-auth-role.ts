import { useEffect, useState } from 'react';
import { useAuth, useFirestore } from 'reactfire';
import { doc, getDoc } from 'firebase/firestore';
import { UserRole, DEFAULT_ROLE } from '@/lib/roles';

export function useAuthRole() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [role, setRole] = useState<UserRole>(DEFAULT_ROLE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setRole(userData.role || DEFAULT_ROLE);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      } else {
        setRole(DEFAULT_ROLE);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  return { role, isLoading };
}
