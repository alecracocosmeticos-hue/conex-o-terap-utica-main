-- Habilitar Realtime para as tabelas de registros do paciente
ALTER PUBLICATION supabase_realtime ADD TABLE check_ins;
ALTER PUBLICATION supabase_realtime ADD TABLE emotional_records;
ALTER PUBLICATION supabase_realtime ADD TABLE diary_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE patient_history;