import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from './usePlan';

interface CapacityState {
  currentPatients: number;
  maxPatients: number | null;
  isLoading: boolean;
  error: string | null;
}

export function useCapacity() {
  const { user, role } = useAuth();
  const { maxPatients } = usePlan();
  const [state, setState] = useState<CapacityState>({
    currentPatients: 0,
    maxPatients: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (role !== 'therapist' || !user) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchPatientCount = async () => {
      try {
        const { count, error } = await supabase
          .from('patient_therapist_relations')
          .select('*', { count: 'exact', head: true })
          .eq('therapist_id', user.id)
          .eq('status', 'active');

        if (error) throw error;

        setState({
          currentPatients: count || 0,
          maxPatients,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error fetching patient count:', err);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load capacity',
        }));
      }
    };

    fetchPatientCount();
  }, [user, role, maxPatients]);

  const canAddPatient = state.maxPatients === null || state.currentPatients < state.maxPatients;
  const usagePercent = state.maxPatients 
    ? Math.min((state.currentPatients / state.maxPatients) * 100, 100)
    : 0;
  const isNearLimit = state.maxPatients !== null && usagePercent >= 80;
  const isAtLimit = state.maxPatients !== null && state.currentPatients >= state.maxPatients;

  return {
    ...state,
    canAddPatient,
    usagePercent,
    isNearLimit,
    isAtLimit,
  };
}
