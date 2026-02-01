-- First, clean up duplicate roles keeping only the earliest one per user
DELETE FROM public.user_roles 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id 
  FROM public.user_roles 
  ORDER BY user_id, created_at ASC
);

-- Add UNIQUE constraint to prevent future duplicates
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);