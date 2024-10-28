import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { ValidationHistory } from '../types/validation';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const useValidationHistory = (user: User | null) => {
  const [history, setHistory] = useState<ValidationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sanitizeHistoryItem = (item: any): ValidationHistory => ({
    id: String(item?.id || ''),
    fileName: String(item?.file_name || ''),
    status: String(item?.status || 'pending'),
    resultUrl: String(item?.result_url || ''),
    createdAt: new Date(item?.created_at || Date.now()).toISOString(),
    totalEmails: Number(item?.total_emails || 0),
    validEmails: Number(item?.valid_emails || 0),
    invalidEmails: Number(item?.invalid_emails || 0)
  });

  const fetchHistory = useCallback(async () => {
    if (!user?.id) {
      setHistory([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Subscribe to real-time updates
      const subscription = supabase
        .channel('validation_history_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'validation_history',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchLatestHistory();
          }
        )
        .subscribe();

      // Initial fetch
      await fetchLatestHistory();

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      let errorMessage = 'Failed to fetch validation history';
      
      if (err instanceof AxiosError) {
        errorMessage = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('Validation history error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchLatestHistory = async () => {
    const { data, error } = await supabase
      .from('validation_history')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    const sanitizedHistory = (data || []).map(sanitizeHistoryItem);
    setHistory(sanitizedHistory);
  };

  useEffect(() => {
    const cleanup = fetchHistory();
    return () => {
      cleanup.then(unsubscribe => unsubscribe?.());
    };
  }, [fetchHistory]);

  const refreshHistory = useCallback(() => {
    fetchLatestHistory();
  }, []);

  return {
    history,
    loading,
    error,
    refreshHistory
  };
};