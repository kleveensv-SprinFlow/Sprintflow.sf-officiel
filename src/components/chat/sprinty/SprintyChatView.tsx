import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { getSprintyAnswer, SprintyMode } from '../../../lib/sprintyEngine';
import { useLanguage } from '../../../hooks/useLanguage';
import { useSprinty } from '../../../context/SprintyContext';
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
  
  const { setExpression } = useSprinty();
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
    const sanitizedText = text.trim();
    if (!sanitizedText) return;

    const userMessage = { text: sanitizedText, sender: 'user' as const };
    addMessage(userMessage);
    setIsTyping(true);
    setExpression('typing');

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
      setExpression('success');
      setTimeout(() => setExpression('neutral'), 3000);

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
      setExpression('perplexed');
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
    <div className="fixed inset-0 bg-[#020617] overflow-hidden">
      
      {/* Subtle Background Gradient (Deep Blue to Black) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050B14] via-[#020617] to-[#020617]" />

      <SprintyChatHeader
        onMenuClick={() => setMenuOpen(true)}
        mode={sprintyMode}
        onModeChange={handleModeChange}
      />

      {/* Scrollable Message Area */}
      {/* Added padding top for header and bottom for input area */}
      <div className="absolute inset-0 overflow-y-auto pt-[70px] pb-[140px] px-4 space-y-6 no-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <MessageBubble message={message} />
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-[#1E293B] border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container - Floating above TabBar */}
      <div className="fixed bottom-[80px] left-0 right-0 px-4 z-[60]">
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
