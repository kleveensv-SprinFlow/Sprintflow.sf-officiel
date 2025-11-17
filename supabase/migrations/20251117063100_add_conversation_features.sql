
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- Add RLS policies for the new columns
-- Ensure users can only see their own conversations
CREATE POLICY "Enable read access for user's own conversations"
ON public.conversations
FOR SELECT
USING (auth.uid() = user_id);

-- Ensure users can only update their own conversations
CREATE POLICY "Enable update access for user's own conversations"
ON public.conversations
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
