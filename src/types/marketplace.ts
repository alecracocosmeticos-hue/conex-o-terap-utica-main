
export interface TherapistPublicProfile {
    id: string;
    therapist_id: string;
    crp_number: string;
    display_name: string;
    bio?: string;
    specialties: string[];
    is_accepting_new: boolean;
    is_visible: boolean;
    created_at: string;
    updated_at: string;
}

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

export interface ConnectionRequest {
    id: string;
    patient_id: string;
    therapist_id: string;
    status: ConnectionStatus;
    message?: string;
    response_message?: string;
    created_at: string;
    updated_at: string;
}
