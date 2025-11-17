import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import QuickReplies from './QuickReplies';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import TypingIndicator from './TypingIndicator';
import SprintyChatHeader from './SprintyChatHeader';
import useAuth from '../../../hooks/useAuth';
import { useRecords } from '../../../hooks/useRecords';
import { useWorkouts } from '../../../hooks/useWorkouts';
import RecordCard from './cards/RecordCard';
import { BrainCircuit } from 'lucide-react';
import ConversationMenu from './ConversationMenu';
import ConversationActions from './ConversationActions';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'sprinty';
  component?: React.ReactNode;
}

const SprintyChatView = () => {
  const { user } = useAuth();
  const { id: conversationId } = useParams();
  const navigate = useNavigate();
  const { records, loading: recordsLoading } = useRecords();
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversationId || null);
  const [isTyping, setIsTyping] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [isActionsOpen, setActionsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });
        
        if (error) {
          console.error("Error fetching conversations:", error);
        } else {
          setConversations(data);
        }
      }
    };
    fetchConversations();
  }, [user]);

  useEffect(() => {
    const loadMessages = async () => {
      if (conversationId) {
        setActiveConversationId(conversationId);
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
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
        const newTitle = text.split(' ').slice(0, 10).join(' ') + (text.split(' ').length > 10 ? '...' : '');
        const { data: newConversation } = await supabase
          .from('conversations')
          .insert({ user_id: user.id, title: newTitle })
          .select()
          .single();
        if (newConversation) {
          currentConversationId = newConversation.id;
          setActiveConversationId(currentConversationId);
          setConversations(prev => [newConversation, ...prev]);
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

  const handleSelectConversation = (id: string) => {
    navigate(`/sprinty/${id}`);
    setMenuOpen(false);
  };

  const handleNewConversation = () => {
    navigate('/sprinty');
    setMessages([{ id: Date.now().toString(), text: getWelcomeMessage(), sender: 'sprinty' }]);
    setActiveConversationId(null);
    setMenuOpen(false);
  };

  const handleOpenActions = (conversation: any) => {
    setSelectedConversation(conversation);
    setActionsOpen(true);
  };

  const handleTogglePin = async () => {
    if (!selectedConversation) return;

    const { data, error } = await supabase
      .from('conversations')
      .update({ is_pinned: !selectedConversation.is_pinned })
      .eq('id', selectedConversation.id)
      .select()
      .single();

    if (error) {
      console.error("Error pinning conversation:", error);
    } else {
      setConversations(prev =>
        prev.map(c => (c.id === data.id ? data : c))
      );
      setActionsOpen(false);
    }
  };

  const handleRename = async () => {
    if (!selectedConversation) return;
    const newTitle = prompt("Entrez le nouveau nom de la conversation:", selectedConversation.title);
    if (newTitle && newTitle.trim() !== "") {
      const { data, error } = await supabase
        .from('conversations')
        .update({ title: newTitle.trim() })
        .eq('id', selectedConversation.id)
        .select()
        .single();

      if (error) {
        console.error("Error renaming conversation:", error);
      } else {
        setConversations(prev =>
          prev.map(c => (c.id === data.id ? data : c))
        );
        setActionsOpen(false);
      }
    }
  };

  return (
    <div className="relative h-screen bg-light-background dark:bg-dark-background">
      <div className="absolute top-0 left-0 right-0 z-20 bg-light-background/90 dark:bg-dark-background/90 backdrop-blur-lg border-b border-white/10">
        <SprintyChatHeader onMenuClick={() => setMenuOpen(true)} />
      </div>
      <ConversationMenu
        isOpen={isMenuOpen}
        onClose={() => setMenuOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onOpenActions={handleOpenActions}
      />
      
      <div className="h-full overflow-y-auto">
        <div className="p-4 pt-24 pb-48">
          {messages.map((message, index) => (
            <div key={message.id} className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              {message.sender === 'sprinty' && (index === 0 || messages[index - 1].sender !== 'sprinty') && (
                <div className="w-8 h-8 flex-shrink-0">
                    <BrainCircuit className="h-8 w-8 text-sprint-accent" />
                </div>
              )}
              <div className={`${message.sender === 'sprinty' && (index > 0 && messages[index - 1].sender === 'sprinty') ? 'ml-10' : ''}`}>
                <MessageBubble message={message} />
              </div>
            </div>
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 bg-light-background/90 dark:bg-dark-background/90 backdrop-blur-lg border-t border-white/10 p-4 pb-8">
        <QuickReplies onSelectReply={handleSendMessage} />
        <ChatInput onSendMessage={handleSendMessage} />
      </div>

      <ConversationActions
        isOpen={isActionsOpen}
        onClose={() => setActionsOpen(false)}
        onRename={handleRename}
        onPin={handleTogglePin}
        isPinned={selectedConversation?.is_pinned || false}
      />
    </div>
  );
};

export default SprintyChatView;