export type EmotionalStatus = {
    scale: number; // 1-5
    text?: string;
};

export type NarrativeContent = {
    self_description?: string;
    current_concerns?: string;
    therapy_expectations?: string;
    emotional_status?: EmotionalStatus;
};

export type PatientNarrative = {
    id: string;
    user_id: string;
    content: NarrativeContent;
    shared_with_therapist: boolean;
    shared_at?: string | null;
    created_at: string;
};
