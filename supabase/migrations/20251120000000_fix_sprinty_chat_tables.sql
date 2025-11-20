-- Create sprinty_conversations table
CREATE TABLE IF NOT EXISTS public.sprinty_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create sprinty_messages table
CREATE TABLE IF NOT EXISTS public.sprinty_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.sprinty_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    message_text TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sprinty_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprinty_messages ENABLE ROW LEVEL SECURITY;

-- Policies for sprinty_conversations
CREATE POLICY "Users can view their own conversations"
    ON public.sprinty_conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
    ON public.sprinty_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
    ON public.sprinty_conversations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
    ON public.sprinty_conversations FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for sprinty_messages
CREATE POLICY "Users can view messages from their conversations"
    ON public.sprinty_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.sprinty_conversations
            WHERE id = sprinty_messages.conversation_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages into their conversations"
    ON public.sprinty_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sprinty_conversations
            WHERE id = sprinty_messages.conversation_id
            AND user_id = auth.uid()
        )
    );
