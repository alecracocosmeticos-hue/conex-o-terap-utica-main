export type IntakeForm = {
    id: string;
    user_id: string;
    preferred_name?: string;
    age: number;
    gender_identity?: string;
    main_complaint?: string;
    has_therapy_history: boolean;
    therapy_history_details?: string;
    medications?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    created_at: string;
};
