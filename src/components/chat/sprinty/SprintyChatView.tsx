import React, { useState, useEffect, useRef, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import TypingIndicator from './TypingIndicator';
import SprintyChatHeader from './SprintyChatHeader';
import useAuth from '../../../hooks/useAuth';
import ConversationMenu from './ConversationMenu';
import ConversationActions from './ConversationActions';
import { sprintyLocalAnswer, SprintyMode as LocalSprintyMode } from '../../../lib/sprintyLocalEngine';

type SprintyMode = LocalSprintyMode;

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
  created_at?: string | null;
}

interface ConversationRecord {
  id: string;
  title: string;
  is_pinned: boolean;
  user_id?: string;
  created_at?: string | null;
}

interface MessageRow {
  id: string;
  text: string;
  sender: 'user' | 'sprinty';
  conversation_id: string;
  timestamp?: string;
}

const SprintyChatView = () => {
  const { user } = useAuth() || {};
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

  const normalizeConversation = useCallback(
    (conversation: ConversationRow): ConversationRecord => ({
      id: conversation.id,
      title: conversation.title ?? 'Nouvelle conversation',
      is_pinned: Boolean(conversation.is_pinned),
      user_id: conversation.user_id,
      created_at: conversation.created_at ?? null,
    }),
    []
  );

  const normalizeMessage = useCallback(
    (message: MessageRow): Message => ({
      id: message.id,
      text: message.text,
      sender: message.sender,
    }),
    []
  );

  const getWelcomeMessage = useCallback(() => {
    const userName =
      // @ts-expect-error
      (user && (user as any).user_metadata?.first_name) || 'Athlète';
    return `Bonjour ${userName}. Je suis Sprinty, ton assistant personnel. Pose-moi des questions sur ton entraînement, ta VO2 max ou ta nutrition.`;
  }, [user]);

  // 1) Charger les conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from<ConversationRow>('conversations')
        .select('*')
        .eq('user_id', (user as any).id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
      } else {
        setConversations((data ?? []).map(normalizeConversation));
      }
    };

    void fetchConversations();
  }, [user, normalizeConversation]);

  // 2) Charger les messages
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
          console.error('Error loading messages:', error);
          setMessages([
            {
              id: 'error',
              text: 'Impossible de charger cette conversation.',
              sender: 'sprinty',
            },
          ]);
        } else {
          const normalized = (data ?? [])
            .map(normalizeMessage)
            .filter(
              (m) =>
                m &&
                typeof m.text === 'string' &&
                (m.sender === 'user' || m.sender === 'sprinty')
            );
          setMessages(
            normalized.length > 0
              ? normalized
              : [
                  {
                    id: Date.now().toString(),
                    text: getWelcomeMessage(),
                    sender: 'sprinty',
                  },
                ]
          );
        }
      } else {
        setActiveConversationId(null);
        setMessages([
          {
            id: Date.now().toString(),
            text: getWelcomeMessage(),
            sender: 'sprinty',
          },
        ]);
      }
    };

    void loadMessages();
  }, [conversationId, normalizeMessage, getWelcomeMessage]);

  // 3) Sauvegarde locale
  useEffect(() => {
    if (messages.length === 0) return;
    const history = messages.map((message) => {
      const { component, ...rest } = message;
      void component;
      return rest;
    });

    try {
      localStorage.setItem('sprintyChatHistory', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save chat history:', e);
    }
  }, [messages]);

  // 4) Scroll auto vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addMessage = (message: Omit<Message, 'id'>) => {
    setMessages((prev) => [...prev, { ...message, id: Date.now().toString() }]);
  };

  const handleSendMessage = async (text: string) => {
    console.log('[SprintyChatView] handleSendMessage:', text);
    const sanitizedText = text.trim();
    if (!sanitizedText) return;

    const userMessage = { text: sanitizedText, sender: 'user' as const };
    addMessage(userMessage);
    setIsTyping(true);

    try {
      const result = await sprintyLocalAnswer(sanitizedText, sprintyMode);

      const sprintyReply = {
        text: result.text,
        sender: 'sprinty' as const,
      };

      addMessage(sprintyReply);
    } catch (err) {
      console.error('Erreur dans le moteur local Sprinty:', err);
      addMessage({
        text:
          "Je rencontre une difficulté pour analyser ta question en mode local. Reformule ou réessaie dans quelques instants.",
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
    setMessages([
      {
        id: Date.now().toString(),
        text: getWelcomeMessage(),
        sender: 'sprinty',
      },
    ]);
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
      console.error('Error pinning conversation:', error);
    } else if (data) {
      const normalized = normalizeConversation(data);
      setConversations((prev) => prev.map((c) => (c.id === normalized.id ? normalized : c)));
      setSelectedConversation(normalized);
      setActionsOpen(false);
    }
  };

  const handleRename = async () => {
    if (!selectedConversation) return;

    const newTitle = prompt(
      'Entrez le nouveau nom de la conversation:',
      selectedConversation.title
    );
    if (newTitle && newTitle.trim() !== '') {
      const { data, error } = await supabase
        .from<ConversationRow>('conversations')
        .update({ title: newTitle.trim() })
        .eq('id', selectedConversation.id)
        .select()
        .single();

      if (error) {
        console.error('Error renaming conversation:', error);
      } else if (data) {
        const normalized = normalizeConversation(data);
        setConversations((prev) => prev.map((c) => (c.id === normalized.id ? normalized : c)));
        setSelectedConversation(normalized);
        setActionsOpen(false);
      }
    }
  };

  // ⚠️ Hauteur = écran - tabbar (72px à ajuster selon la hauteur réelle de ta tabbar)
  return (
    <div
      className="relative bg-light-background dark:bg-dark-background"
      style={{ height: 'calc(100vh - 72px)' }}
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* HEADER FIXE, proprement séparé */}
        <div className="flex-shrink-0 border-b border-white/10 bg-light-background dark:bg-dark-background">
          <SprintyChatHeader
            onMenuClick={() => setMenuOpen(true)}
            mode={sprintyMode}
            onModeChange={setSprintyMode}
          />
        </div>

        {/* MENU CONVERSATIONS (overlay) */}
        <ConversationMenu
          isOpen={isMenuOpen}
          onClose={() => setMenuOpen(false)}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onOpenActions={handleOpenActions}
        />

        {/* ZONE DE MESSAGES : COMMENCE CLAIREMENT SOUS LE HEADER (pt-4) */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-8 pb-4 space-y-4">
            {messages
              .filter((msg) => {
                const isValid =
                  msg &&
                  typeof msg.text === 'string' &&
                  (msg.sender === 'user' || msg.sender === 'sprinty');
                if (!isValid) {
                  console.warn('Invalid message in list:', msg);
                }
                return isValid;
              })
              .map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ACTIONS CONVERSATION */}
        {selectedConversation && (
          <ConversationActions
            isOpen={isActionsOpen}
            onClose={() => setActionsOpen(false)}
            conversation={selectedConversation}
            onTogglePin={handleTogglePin}
            onRename={handleRename}
          />
        )}

        {/* FOOTER FIXE : SAISIE AU-DESSUS DE LA TABBAR */}
        <div className="flex-shrink-0 bg-light-background dark:bg-dark-background px-3 py-2 border-t border-white/10">
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </div>
      </div>
    </div>
  );
};

export default SprintyChatView;