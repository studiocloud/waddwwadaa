import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, DEMO_CREDENTIALS } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AuthError extends Error {
  status?: number;
}

export function useSupabaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const handleAuthChange = async (_event: string, session: any) => {
      if (!mounted) return;

      try {
        if (session?.user) {
          setUser(session.user);
          setError(null);
        } else {
          const demoUser = localStorage.getItem('demo_user');
          if (demoUser) {
            try {
              const parsedUser = JSON.parse(demoUser);
              if (!parsedUser?.id || !parsedUser?.email) {
                throw new Error('Invalid demo user data');
              }
              setUser(parsedUser as User);
              setError(null);
            } catch (e) {
              localStorage.removeItem('demo_user');
              setUser(null);
              setError(new Error('Invalid demo user session'));
              navigate('/auth');
            }
          } else {
            setUser(null);
            navigate('/auth');
          }
        }
      } catch (e) {
        const authError = e as AuthError;
        setError(authError);
        console.error('Auth change error:', authError);
      } finally {
        setLoading(false);
      }
    };

    const setupAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (mounted) {
          await handleAuthChange('INITIAL', session);
        }
      } catch (e) {
        const authError = e as AuthError;
        if (mounted) {
          setError(authError);
          setLoading(false);
        }
        console.error('Auth setup error:', authError);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    setupAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      
      localStorage.removeItem('demo_user');
      setUser(null);
      setError(null);
      navigate('/auth');
    } catch (e) {
      const authError = e as AuthError;
      setError(authError);
      console.error('Sign out error:', authError);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, signOut };
}