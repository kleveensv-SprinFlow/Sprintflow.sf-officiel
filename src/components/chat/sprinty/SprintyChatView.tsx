import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import QuickReplies from './QuickReplies';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import TypingIndicator from './TypingIndicator';
import SprintyChatHeader from './SprintyChatHeader';
import useAuth from '../../../hooks/useAuth';
import { useRecords } from '../../../hooks/useRecords';
import { useWorkouts } from '../../../hooks/useWorkouts';
import RecordCard from './cards/RecordCard';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'sprinty';
  component?: React.ReactNode;
}

const SprintyChatView = () => {
  const { user } = useAuth();
  const { id: conversationId } = useParams();
  const { records, loading: recordsLoading } = useRecords();
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversationIdFromUrl || null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMessages = async () => {
      if (conversationIdFromUrl) {
        setActiveConversationId(conversationIdFromUrl);
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationIdFromUrl)
          .order('timestamp', { ascending: true });
        
        if (error) {
          console.error("Error loading messages:", error);
          setMessages([ { id: 'error', text: 'Impossible de charger cette conversation.', sender: 'sprinty' } ]);
        } else {
          setMessages(data || []);
        }
      } else {
        setMessages([{ id: Date.now().toString(), text: getWelcomeMessage(), sender: 'sprinty' }]);
      }
    };
    loadMessages();
  }, [conversationId, user]);

  const getWelcomeMessage = () => {
    const userName = user?.user_metadata?.first_name || 'Athlète';
    return `Bonjour ${userName}. Je suis Sprinty, votre assistant personnel. Je suis prêt à analyser vos données pour la journée. Que souhaitez-vous vérifier en premier ?`;
  };

  useEffect(() => {
    const savedMessagesJSON = localStorage.getItem('sprintyChatHistory');
    if (savedMessagesJSON && savedMessagesJSON !== 'undefined') {
        try {
            const savedMessages = JSON.parse(savedMessagesJSON);
            if (Array.isArray(savedMessages) && savedMessages.length > 0) {
                setMessages(savedMessages);
                return;
            }
        } catch (e) {
            console.error("Failed to parse chat history:", e);
        }
    }
    setMessages([{ id: Date.now().toString(), text: getWelcomeMessage(), sender: 'sprinty' }]);
  }, [user]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('sprintyChatHistory', JSON.stringify(messages.map(({ component, ...rest }) => rest)));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addMessage = (message: Omit<Message, 'id'>) => {
    setMessages(prev => [...prev, { ...message, id: Date.now().toString() }]);
  };

  const { profile } = useAuth();

  const handleSendMessage = async (text: string) => {
    const userMessage = { text, sender: 'user' as const, conversation_id: activeConversationId };
    addMessage(userMessage);
    setIsTyping(true);

    try {
      let currentConversationId = activeConversationId;

      // Create conversation if it doesn't exist yet
      if (!currentConversationId && user) {
        const { data: newConversation } = await supabase
          .from('conversations')
          .insert({ user_id: user.id })
          .select('id')
          .single();
        if (newConversation) {
          currentConversationId = newConversation.id;
          setActiveConversationId(currentConversationId);
        }
      }

      if (!currentConversationId) throw new Error("Could not create or find conversation.");

      // Save user message to DB
      await supabase.from('messages').insert({
        conversation_id: currentConversationId,
        sender_type: 'user',
        content: text,
      });

      const expertiseMode = profile?.sprinty_mode || 'simple';
      const conversationHistory = [...messages, userMessage].slice(-200);
      
      const { data: functionData, error: functionError } = await supabase.functions.invoke('sprinty-chat', {
        body: { messages: conversationHistory, expertiseMode },
      });

      if (functionError) throw functionError;

      const sprintyReply = { text: functionData.reply, sender: 'sprinty' as const };
      addMessage(sprintyReply);
      
      // Save AI message to DB
      await supabase.from('messages').insert({
        conversation_id: currentConversationId,
        sender_type: 'ai',
        content: sprintyReply.text,
      });

    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      addMessage({
        text: "Désolé, une erreur est survenue. Veuillez réessayer.",
        sender: 'sprinty',
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-light-background dark:bg-dark-background">
      <SprintyChatHeader />
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(message => (
          <div key={message.id}>
            <MessageBubble message={message} />
            {message.component && <div className="ml-11">{message.component}</div>}
          </div>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700">
        <QuickReplies onSelectReply={handleSendMessage} />
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default SprintyChatView;