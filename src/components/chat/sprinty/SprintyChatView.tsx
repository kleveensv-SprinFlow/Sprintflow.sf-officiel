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

const SprintyChatView: React.FC = () => {
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
    // 1. Structure Flexbox Pleine Hauteur : Règle le problème de flottement
    <div className="flex flex-col h-full w-full bg-sprint-dark-background relative overflow-hidden">
      
      {/* Fond Dégradé */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050B14] via-[#020617] to-[#020617] pointer-events-none" />

      {/* HEADER (Fixe en haut de la flex column) */}
      <div className="shrink-0 z-50">
        <SprintyChatHeader
          onOpenMenu={() => setMenuOpen(true)}
          onOpenCharacterSelector={() => setCharacterSelectorOpen(true)}
          currentCharacterName={currentPersona.name}
        />
      </div>

      {/* ZONE DE MESSAGES (Prend tout l'espace disponible - Flex 1) */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 no-scrollbar relative z-10 scroll-smooth">
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
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* INPUT AREA (Ancré en bas de la flex column) */}
      {/* z-40 pour être au dessus des messages, shrink-0 pour ne pas s'écraser */}
      {/* pb-[85px] crée l'espace exact pour la TabBar sans espace vide inutile */}
      <div className="shrink-0 z-40 w-full bg-sprint-dark-background/95 backdrop-blur-md border-t border-white/5 pb-[85px] pt-2 px-4 transition-all duration-300">
        <ChatInput onSend={handleSendMessage} disabled={isTyping} />
      </div>

      {/* MODALES */}
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

export default SprintyChatView;