-- Add invitation columns to patient_therapist_relations
ALTER TABLE patient_therapist_relations
ADD COLUMN IF NOT EXISTS invitation_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS invitation_email TEXT,
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

-- Create index for fast code lookup
CREATE INDEX IF NOT EXISTS idx_invitation_code ON patient_therapist_relations(invitation_code);

-- Create index for email lookup
CREATE INDEX IF NOT EXISTS idx_invitation_email ON patient_therapist_relations(invitation_email);

-- Update RLS: Allow patients to view pending invitations by their email
CREATE POLICY "Patients can view pending invitations by email"
ON patient_therapist_relations FOR SELECT
USING (
  status = 'pending' 
  AND invitation_email = (SELECT email FROM profiles WHERE id = auth.uid())
);

-- Allow patients to accept invitations (update patient_id and status)
CREATE POLICY "Patients can accept pending invitations"
ON patient_therapist_relations FOR UPDATE
USING (
  status = 'pending'
  AND invitation_email = (SELECT email FROM profiles WHERE id = auth.uid())
);