import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionState {
  plan: string;
  status: string;
  subscriptionEnd: string | null;
  stripeCustomerId: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useSubscription() {
  const { user, session } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    plan: 'none',
    status: 'inactive',
    subscriptionEnd: null,
    stripeCustomerId: null,
    isLoading: true,
    error: null,
  });

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setState({
        plan: data.plan || 'none',
        status: data.subscribed ? 'active' : 'inactive',
        subscriptionEnd: data.subscription_end || null,
        stripeCustomerId: null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error('Error checking subscription:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to check subscription',
      }));
    }
  }, [session?.access_token]);

  // Check subscription on mount and when session changes
  useEffect(() => {
    if (user && session) {
      checkSubscription();
    } else {
      setState({
        plan: 'none',
        status: 'inactive',
        subscriptionEnd: null,
        stripeCustomerId: null,
        isLoading: false,
        error: null,
      });
    }
  }, [user, session, checkSubscription]);

  // Refresh subscription every 60 seconds
  useEffect(() => {
    if (!user || !session) return;

    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, session, checkSubscription]);

  const isSubscribed = state.status === 'active' && state.plan !== 'none';

  return {
    ...state,
    isSubscribed,
    checkSubscription,
  };
}
