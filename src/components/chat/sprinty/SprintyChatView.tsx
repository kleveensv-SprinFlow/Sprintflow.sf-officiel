import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { getSprintyAnswer, SprintyMode } from '../../../lib/sprintyEngine';
import { useLanguage } from '../../../hooks/useLanguage';
import SprintyChatHeader from './SprintyChatHeader';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import ConversationMenu from './ConversationMenu';
import ConversationActions from './ConversationActions';
import { Loader2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'sprinty';
  component?: React.ReactNode;
}

interface ConversationRecord {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const SprintyChatView: React.FC = () => {
  const { id: conversationId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sprintyMode, setSprintyMode] = useState<SprintyMode>('simplified');
  const [menuOpen, setMenuOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<ConversationRecord | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const getWelcomeMessage = useCallback(() => {
    return t('sprinty.welcome');
  }, [t]);

  const normalizeMessage = useCallback((msg: any): Message | null => {
    if (!msg || typeof msg !== 'object') return null;
    return {
      id: msg.id || Date.now().toString(),
      text: msg.message_text || msg.text || '',
      sender: msg.role === 'user' || msg.sender === 'user' ? 'user' : 'sprinty',
    };
  }, []);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('sprinty_conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setConversations(data || []);
      } catch (error) {
        console.error('Erreur chargement conversations:', error);
      }
    };

    loadConversations();
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (conversationId) {
        setActiveConversationId(conversationId);
        
        const { data, error } = await supabase
          .from('sprinty_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('timestamp', { ascending: true });

        if (error) {
          console.error('Error loading messages:', error);
          setMessages([
            {
              id: 'error',
              text: t('sprinty.error'),
              sender: 'sprinty',
            },
          ]);
        } else {
          const normalized = (data ?? [])
            .map(normalizeMessage)
            .filter((m): m is Message => m !== null && m.text.length > 0);

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

    loadMessages();
  }, [conversationId, normalizeMessage, getWelcomeMessage, t]);

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
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const result = await getSprintyAnswer(
        sanitizedText,
        sprintyMode,
        language,
        conversationHistory
      );

      const sprintyReply = {
        text: result.text,
        sender: 'sprinty' as const,
      };

      addMessage(sprintyReply);

      if (activeConversationId) {
        await supabase.from('sprinty_messages').insert([
          {
            conversation_id: activeConversationId,
            role: 'user',
            message_text: sanitizedText,
          },
          {
            conversation_id: activeConversationId,
            role: 'assistant',
            message_text: result.text,
          },
        ]);
      }
    } catch (err) {
      console.error('Erreur Sprinty:', err);
      addMessage({
        text: t('sprinty.error'),
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

  const handleModeChange = (newMode: SprintyMode) => {
    setSprintyMode(newMode);
  };

  return (
    <div className="flex flex-col h-screen bg-light-background dark:bg-dark-background">
      <SprintyChatHeader
        onMenuClick={() => setMenuOpen(true)}
        mode={sprintyMode}
        onModeChange={handleModeChange}
      />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-24">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <MessageBubble message={message} />
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-lg px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{t('sprinty.typing')}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-20 left-0 right-0 p-4 bg-light-background dark:bg-dark-background border-t border-gray-200 dark:border-gray-700">
        <ChatInput onSend={handleSendMessage} disabled={isTyping} />
      </div>

      <ConversationMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onOpenActions={handleOpenActions}
      />

      {selectedConversation && (
        <ConversationActions
          isOpen={actionsOpen}
          onClose={() => {
            setActionsOpen(false);
            setSelectedConversation(null);
          }}
          conversation={selectedConversation}
          onUpdate={() => {
            setActionsOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default SprintyChatView;