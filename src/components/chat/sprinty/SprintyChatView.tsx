import React, { useState, useEffect, useRef, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import QuickReplies from './QuickReplies';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import TypingIndicator from './TypingIndicator';
import SprintyChatHeader from './SprintyChatHeader';
import useAuth from '../../../hooks/useAuth';
import { BrainCircuit } from 'lucide-react';
import ConversationMenu from './ConversationMenu';
import ConversationActions from './ConversationActions';

type SprintyMode = 'simplified' | 'expert';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'sprinty';
  component?: React.ReactNode;
}

interface ConversationRow {
  id: string;
  title: string | null;
  is_pinned: boolean | null;
  user_id?: string;
  timestamp?: string | null;
}

interface ConversationRecord {
  id: string;
  title: string;
  is_pinned: boolean;
  user_id?: string;
  timestamp?: string | null;
}

interface MessageRow {
  id: string;
  text: string;
  sender: 'user' | 'sprinty';
  conversation_id: string;
  timestamp?: string;
}

const SprintyChatView = () => {
  const { user } = useAuth();
  const { id: conversationId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [sprintyMode, setSprintyMode] = useState<SprintyMode>('simplified');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    conversationId || null
  );
  const [isTyping, setIsTyping] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationRecord | null>(null);
  const [isActionsOpen, setActionsOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const normalizeConversation = useCallback((conversation: ConversationRow): ConversationRecord => ({
    id: conversation.id,
    title: conversation.title ?? 'Nouvelle conversation',
    is_pinned: Boolean(conversation.is_pinned),
    user_id: conversation.user_id,
    timestamp: conversation.timestamp ?? null,
  }), []);

  const normalizeMessage = useCallback((message: MessageRow): Message => ({
    id: message.id,
    text: message.text,
    sender: message.sender,
  }), []);

  const getWelcomeMessage = useCallback(() => {
    const userName = user?.user_metadata?.first_name || 'Athlète';
    return `Bonjour ${userName}. Je suis Sprinty, votre assistant personnel. Je suis prêt à analyser vos données pour la journée. Que souhaitez-vous vérifier en premier ?`;
  }, [user]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (user) {
        const { data, error } = await supabase
          .from<ConversationRow>('conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });

        if (error) {
          console.error("Error fetching conversations:", error);
        } else {
          setConversations((data ?? []).map(normalizeConversation));
        }
      }
    };

    fetchConversations();
  }, [user, normalizeConversation]);

  useEffect(() => {
    const loadMessages = async () => {
      if (conversationId) {
        setActiveConversationId(conversationId);

        const { data, error } = await supabase
          .from<MessageRow>('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('timestamp', { ascending: true });

        if (error) {
          console.error("Error loading messages:", error);
          setMessages([{ id: 'error', text: 'Impossible de charger cette conversation.', sender: 'sprinty' }]);
        } else {
          setMessages((data ?? []).map(normalizeMessage));
        }
      } else {
        setMessages([{ id: Date.now().toString(), text: getWelcomeMessage(), sender: 'sprinty' }]);
      }
    };

    loadMessages();
  }, [conversationId, user, normalizeMessage, getWelcomeMessage]);

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
  }, [user, getWelcomeMessage]);

  useEffect(() => {
    if (messages.length > 0) {
      const history = messages.map(message => {
        const { component, ...rest } = message;
        void component;
        return rest;
      });
      localStorage.setItem('sprintyChatHistory', JSON.stringify(history));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addMessage = (message: Omit<Message, 'id'>) => {
    setMessages(prev => [...prev, { ...message, id: Date.now().toString() }]);
  };

  const handleSendMessage = async (text: string) => {
    const sanitizedText = text.trim();
    if (!sanitizedText) return;

    const userMessage = { text: sanitizedText, sender: 'user' as const };
    addMessage(userMessage);
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke<{ reply?: string }>(
        'sprinty-rag-pipeline',
        {
          body: {
            question: sanitizedText,
            expertiseMode: sprintyMode,
          },
        }
      );

      if (error) throw error;

      const sprintyReply = {
        text:
          data?.reply ||
          "Je n'arrive pas à récupérer les informations nécessaires. Peux-tu reformuler dans un instant ?",
        sender: 'sprinty' as const,
      };

      addMessage(sprintyReply);
    } catch (err) {
      console.error('Erreur lors de la récupération de la réponse Sprinty:', err);
      addMessage({
        text: "Je rencontre une difficulté technique pour répondre pour le moment. Réessaie dans quelques secondes.",
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

  const handleOpenActions = (conversation: ConversationRecord) => {
    setSelectedConversation(conversation);
    setActionsOpen(true);
  };

  const handleTogglePin = async () => {
    if (!selectedConversation) return;

    const { data, error } = await supabase
      .from<ConversationRow>('conversations')
      .update({ is_pinned: !selectedConversation.is_pinned })
      .eq('id', selectedConversation.id)
      .select()
      .single();

    if (error) {
      console.error("Error pinning conversation:", error);
    } else {
      const normalized = normalizeConversation(data);
      setConversations(prev => prev.map(c => (c.id === normalized.id ? normalized : c)));
      setSelectedConversation(normalized);
      setActionsOpen(false);
    }
  };

  const handleRename = async () => {
    if (!selectedConversation) return;

    const newTitle = prompt("Entrez le nouveau nom de la conversation:", selectedConversation.title);
    if (newTitle && newTitle.trim() !== "") {
      const { data, error } = await supabase
        .from<ConversationRow>('conversations')
        .update({ title: newTitle.trim() })
        .eq('id', selectedConversation.id)
        .select()
        .single();

      if (error) {
        console.error("Error renaming conversation:", error);
      } else {
        const normalized = normalizeConversation(data);
        setConversations(prev => prev.map(c => (c.id === normalized.id ? normalized : c)));
        setSelectedConversation(normalized);
        setActionsOpen(false);
      }
    }
  };

  return (
    <div className="relative h-full bg-light-background dark:bg-dark-background overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-20 bg-light-background bg-opacity-80 dark:bg-dark-background dark:bg-opacity-80 backdrop-blur-lg border-b border-white/10">
        <SprintyChatHeader
          onMenuClick={() => setMenuOpen(true)}
          mode={sprintyMode}
          onModeChange={setSprintyMode}
        />
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
        <div className="pt-20 pb-32 px-4 space-y-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              sender={msg.sender}
              text={msg.text}
              component={msg.component}
            />
          ))}

          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <ConversationActions
        isOpen={isActionsOpen}
        onClose={() => setActionsOpen(false)}
        conversation={selectedConversation}
        onTogglePin={handleTogglePin}
        onRename={handleRename}
      />

      <div className="absolute bottom-0 left-0 right-0 bg-light-background dark:bg-dark-background p-4 border-t border-white/10">
        <QuickReplies onSelect={handleSendMessage} />

        <ChatInput
          onSend={handleSendMessage}
          disabled={isTyping}
        />
      </div>
    </div>
  );
};

export default SprintyChatView;
