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

type SprintyMode = 'simplified' | 'expert';

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
  const [sprintyMode, setSprintyMode] = useState<SprintyMode>('simplified');
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

  // --- Fonctions de simulation pour la Tâche 2.2 ---

  const recognizeIntent = (text: string): 'INTENT_RECORDS' | 'UNKNOWN' => {
    const lowerCaseText = text.toLowerCase();
    const keywords = ['record', 'records', 'récent', 'récents', 'performance', 'performances', 'meilleur temps'];
    
    if (keywords.some(keyword => lowerCaseText.includes(keyword))) {
      return 'INTENT_RECORDS';
    }
    
    return 'UNKNOWN';
  }

  const generateMockResponse = (intent: 'INTENT_RECORDS' | 'UNKNOWN', mode: SprintyMode) => {
    if (intent === 'INTENT_RECORDS') {
      const mockRecordData = {
        id: 'rec_mock_123',
        user_id: 'user_mock_123',
        name: '100m',
        value: '10.55',
        unit: 's',
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      const simplifiedText = "Voici votre dernier record sur 100m. Continuez comme ça !";
      const expertText = "Analyse du record : Basé sur votre performance de 10.55s sur 100m, les données suggèrent une excellente phase de mise en action. La vélocité maximale semble atteinte autour de 60m.";

      return {
        text: mode === 'simplified' ? simplifiedText : expertText,
        component: <RecordCard record={mockRecordData as any} />
      };
    }
    
    return {
      text: "Je ne suis pas sûr de comprendre. Pourriez-vous reformuler ?",
      component: null
    };
  }

  // --- Fin des fonctions de simulation ---

  const handleSendMessage = async (text: string) => {
    const userMessage = { text, sender: 'user' as const };
    addMessage(userMessage);
    setIsTyping(true);

    // Logique de simulation avec un délai pour l'indicateur de frappe
    setTimeout(() => {
      const intent = recognizeIntent(text);
      const response = generateMockResponse(intent, sprintyMode);
      
      const sprintyReply = { 
        text: response.text, 
        sender: 'sprinty' as const, 
        component: response.component 
      };
      addMessage(sprintyReply);
      
      setIsTyping(false);
    }, 1500);
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
        <div className="p-4 pt-24 pb-32">
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

      <div className="absolute bottom-0 left-0 right-0 z-10 bg-light-background bg-opacity-80 dark:bg-dark-background dark:bg-opacity-80 backdrop-blur-lg border-t border-white/10 p-4">
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