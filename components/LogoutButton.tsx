// components/LogoutButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation'; // Importa useRouter

export default function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter(); // Usa useRouter

  const handleLogout = () => {
    logout();
    router.push('/auth/login'); // Redirige al login
  };

  return (
    <Button onClick={handleLogout} size="sm" variant="ghost">
      Logout
    </Button>
  );
}
