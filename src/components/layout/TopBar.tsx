'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Bell, Menu, LogOut } from 'lucide-react';
import { toast } from '@/lib/toast';
import styles from './TopBar.module.css';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import NotificationPopover from '@/components/ui/NotificationPopover';

interface Props {
  title?: string;
  onMobileMenuToggle?: () => void;
}

export default function TopBar({ title, onMobileMenuToggle }: Props) {
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const displayName = user?.user_metadata?.full_name || user?.email || 'User';
  const initials = getInitials(displayName);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Mobile Menu Toggle (only shows on mobile via CSS usually, but we can do it inline or keep class) */}
      <button
        className={styles.mobileMenuBtn}
        onClick={() => window.dispatchEvent(new CustomEvent('toggleMobileMenu'))}
        aria-label="Toggle mobile menu"
      >
        <Menu size={18} />
      </button>

      <NotificationPopover />

      <button
        className={styles.iconBtn}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className={styles.userBadge}>
        {user?.user_metadata?.avatar_url ? (
          <img src={user.user_metadata.avatar_url} alt="Avatar" className={styles.avatarImage} style={{ width: 26, height: 26, borderRadius: '50%' }} />
        ) : (
          <div className={styles.avatar}>{initials}</div>
        )}
        <span className={styles.userName}>{displayName}</span>
      </div>

      <button
        className={styles.iconBtn}
        onClick={handleSignOut}
        aria-label="Sign out"
        title="Sign Out"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}
