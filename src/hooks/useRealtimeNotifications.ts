import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

type NotificationType = 'check_in' | 'emotional_record' | 'diary_entry' | 'patient_history';

interface Notification {
  id: string;
  type: NotificationType;
  patientId: string;
  patientName: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

export const useRealtimeNotifications = () => {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [linkedPatients, setLinkedPatients] = useState<Map<string, string>>(new Map());

  // Fetch linked patients on load
  useEffect(() => {
    if (!user || role !== 'therapist') return;

    const fetchLinkedPatients = async () => {
      const { data } = await supabase
        .from('patient_therapist_relations')
        .select('patient_id, patient:profiles!patient_therapist_relations_patient_id_fkey(full_name)')
        .eq('therapist_id', user.id)
        .eq('status', 'active');

      if (data) {
        const map = new Map<string, string>();
        data.forEach((r) => {
          const patientData = r.patient as { full_name: string } | null;
          map.set(r.patient_id, patientData?.full_name || 'Paciente');
        });
        setLinkedPatients(map);
      }
    };

    fetchLinkedPatients();
  }, [user, role]);

  // Handle new record notification
  const handleNewRecord = useCallback(
    (record: { id: string; user_id: string; shared_with_therapist?: boolean }, type: NotificationType, action: string) => {
      const patientId = record.user_id;

      // Only notify if patient is linked
      if (!linkedPatients.has(patientId)) return;

      // Only notify if shared with therapist
      if (record.shared_with_therapist === false) return;

      const patientName = linkedPatients.get(patientId) || 'Paciente';

      const notification: Notification = {
        id: `${type}-${record.id}-${Date.now()}`,
        type,
        patientId,
        patientName,
        message: `${patientName} ${action}`,
        createdAt: new Date(),
        read: false,
      };

      setNotifications((prev) => [notification, ...prev.slice(0, 19)]);
      setUnreadCount((prev) => prev + 1);

      toast({
        title: 'Nova Atividade',
        description: notification.message,
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['patient-records', patientId] });
      queryClient.invalidateQueries({ queryKey: ['patient-checkins', patientId] });
    },
    [linkedPatients, queryClient]
  );

  // Set up Realtime subscriptions
  useEffect(() => {
    if (!user || role !== 'therapist' || linkedPatients.size === 0) return;

    const channel = supabase
      .channel('therapist-notifications')
      // Listen to check-ins
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'check_ins' },
        (payload) => {
          const record = payload.new as { id: string; user_id: string; shared_with_therapist: boolean };
          if (record.shared_with_therapist) {
            handleNewRecord(record, 'check_in', 'fez um novo check-in');
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'check_ins' },
        (payload) => {
          const newRecord = payload.new as { id: string; user_id: string; shared_with_therapist: boolean };
          const oldRecord = payload.old as { shared_with_therapist?: boolean };
          if (newRecord.shared_with_therapist && !oldRecord.shared_with_therapist) {
            handleNewRecord(newRecord, 'check_in', 'compartilhou um check-in');
          }
        }
      )
      // Listen to emotional records
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emotional_records' },
        (payload) => {
          const record = payload.new as { id: string; user_id: string; shared_with_therapist: boolean };
          if (record.shared_with_therapist) {
            handleNewRecord(record, 'emotional_record', 'criou um registro emocional');
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'emotional_records' },
        (payload) => {
          const newRecord = payload.new as { id: string; user_id: string; shared_with_therapist: boolean };
          const oldRecord = payload.old as { shared_with_therapist?: boolean };
          if (newRecord.shared_with_therapist && !oldRecord.shared_with_therapist) {
            handleNewRecord(newRecord, 'emotional_record', 'compartilhou um registro emocional');
          }
        }
      )
      // Listen to diary entries
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'diary_entries' },
        (payload) => {
          const record = payload.new as { id: string; user_id: string; shared_with_therapist: boolean };
          if (record.shared_with_therapist) {
            handleNewRecord(record, 'diary_entry', 'adicionou uma entrada no diário');
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'diary_entries' },
        (payload) => {
          const newRecord = payload.new as { id: string; user_id: string; shared_with_therapist: boolean };
          const oldRecord = payload.old as { shared_with_therapist?: boolean };
          if (newRecord.shared_with_therapist && !oldRecord.shared_with_therapist) {
            handleNewRecord(newRecord, 'diary_entry', 'compartilhou uma entrada do diário');
          }
        }
      )
      // Listen to patient history
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'patient_history' },
        (payload) => {
          const newRecord = payload.new as { id: string; user_id: string; shared_with_therapist: boolean };
          const oldRecord = payload.old as { shared_with_therapist?: boolean };
          if (newRecord.shared_with_therapist && !oldRecord.shared_with_therapist) {
            handleNewRecord(newRecord, 'patient_history', 'compartilhou sua história');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, role, linkedPatients, handleNewRecord]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
};
