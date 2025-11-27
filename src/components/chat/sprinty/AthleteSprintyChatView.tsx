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
import CharacterSelectorModal from './CharacterSelectorModal';

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

// Athlete Version
const AthleteSprintyChatView: React.FC = () => {
  const { id: conversationId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sprintyMode, setSprintyMode] = useState<SprintyMode>('simplified');
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<ConversationRecord | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);

  const {
    setExpression,
    isMenuOpen,
    setMenuOpen,
    isCharacterSelectorOpen,
    setCharacterSelectorOpen,
    currentPersona,
    setPersona
  } = useSprinty();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const getWelcomeMessage = useCallback(() => {
    if (currentPersona.id === 'zoom') {
      return "Salut ! Je suis Zoom, prêt à analyser ta vitesse. On démarre ?";
    }
    return t('sprinty.welcome');
  }, [t, currentPersona.id]);

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
        const { data } = await supabase.from('sprinty_conversations').select('*').eq('user_id', user.id).order('updated_at', { ascending: false });
        setConversations(data || []);
      } catch (e) { console.error(e); }
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
          setMessages([{ id: 'error', text: t('sprinty.error'), sender: 'sprinty' }]);
        } else {
          const normalized = (data ?? []).map(normalizeMessage).filter((m): m is Message => m !== null);
          setMessages(normalized.length > 0 ? normalized : [{ id: 'welcome', text: getWelcomeMessage(), sender: 'sprinty' }]);
        }
      } else {
        setActiveConversationId(null);
        setMessages([{ id: 'welcome', text: getWelcomeMessage(), sender: 'sprinty' }]);
      }
    };
    loadMessages();
  }, [conversationId, normalizeMessage, getWelcomeMessage, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    const sanitizedText = text.trim();
    if (!sanitizedText) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), text: sanitizedText, sender: 'user' }]);
    setIsTyping(true);
    setExpression('typing');

    try {
      const result = await getSprintyAnswer(sanitizedText, sprintyMode, language, []);
      setMessages(prev => [...prev, { id: Date.now().toString(), text: result.text, sender: 'sprinty' }]);
      setExpression('success');
      setTimeout(() => setExpression('neutral'), 3000);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now().toString(), text: "Erreur...", sender: 'sprinty' }]);
      setExpression('perplexed');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-0 bg-sprint-dark-background flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-b from-[#050B14] via-[#020617] to-[#020617] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 z-50">
        <SprintyChatHeader
          onOpenMenu={() => setMenuOpen(true)}
          onOpenCharacterSelector={() => setCharacterSelectorOpen(true)}
          currentCharacterName={currentPersona.name}
        />
      </div>
      <div className="flex-1 overflow-y-auto pt-[70px] pb-[140px] px-4 space-y-6 no-scrollbar relative z-10">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <MessageBubble message={message} />
          </div>
        ))}
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
      <div className="fixed bottom-[64px] left-0 right-0 z-40 px-4 py-2 bg-gradient-to-t from-sprint-dark-background via-sprint-dark-background/95 to-transparent backdrop-blur-sm">
        <div className="w-full max-w-3xl mx-auto">
           <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </div>
      </div>
      <ConversationMenu
        isOpen={isMenuOpen}
        onClose={() => setMenuOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => navigate(`/sprinty/${id}`)}
        onNewConversation={() => navigate('/sprinty')}
        onOpenActions={(conv) => { setSelectedConversation(conv); setActionsOpen(true); }}
      />
      {isCharacterSelectorOpen && (
        <CharacterSelectorModal
          isOpen={isCharacterSelectorOpen}
          onClose={() => setCharacterSelectorOpen(false)}
          onSelect={(persona) => {
            setPersona(persona);
            setCharacterSelectorOpen(false);
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              text: `Conversation basculée sur ${persona.name}.`,
              sender: 'sprinty'
            }]);
          }}
        />
      )}
    </div>
  );
};

export default AthleteSprintyChatView;
