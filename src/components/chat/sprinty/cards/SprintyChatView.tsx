import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import QuickReplies from './QuickReplies';
import TypingIndicator from './TypingIndicator';
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
  const { records, loading: recordsLoading } = useRecords();
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getWelcomeMessage = () => {
    const userName = user?.user_metadata?.first_name || 'Athlète';
    return `Bonjour ${userName}. Je suis Sprinty, votre assistant personnel. Je suis prêt à analyser vos données pour la journée. Que souhaitez-vous vérifier en premier ?`;
  };

  useEffect(() => {
    const savedMessagesJSON = localStorage.getItem('sprintyChatHistory');
    // Ensure we don't try to parse 'undefined' or empty string
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
    // Fallback to welcome message
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

  const handleSendMessage = (text: string) => {
    addMessage({ text, sender: 'user' });
    setIsTyping(true);

    setTimeout(() => {
      let sprintyResponse: Omit<Message, 'id'>;

      switch (text) {
        case 'Mes Records Récents':
          if (recordsLoading) {
            sprintyResponse = { text: "Un instant, je consulte vos performances...", sender: 'sprinty' };
          } else if (records && records.length > 0) {
            const latestRecord = records[0];
            sprintyResponse = {
              text: `Absolument ! Voici votre record le plus récent pour **${latestRecord.name}**. Continuez comme ça !`,
              sender: 'sprinty',
              component: <RecordCard record={latestRecord} />
            };
          } else {
            sprintyResponse = { text: "Il semble que vous n'ayez pas encore enregistré de records.", sender: 'sprinty' };
          }
          break;
        case 'Mon Planning':
           if (workoutsLoading) {
            sprintyResponse = { text: "Je regarde votre agenda...", sender: 'sprinty' };
          } else if (workouts && workouts.length > 0) {
            const upcomingWorkouts = workouts
              .filter(w => new Date(w.date) >= new Date() && w.status === 'planned')
              .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            if (upcomingWorkouts.length > 0) {
              const nextWorkout = upcomingWorkouts[0];
              const workoutDate = new Date(nextWorkout.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
              sprintyResponse = { text: `Votre prochaine séance est programmée pour **${workoutDate}**. Au programme : **${nextWorkout.tag_seance || 'une séance non spécifiée'}**.`, sender: 'sprinty' };
            } else {
              sprintyResponse = { text: "Bonne nouvelle, vous n'avez aucune séance planifiée à venir. C'est le moment de planifier ou de vous reposer !", sender: 'sprinty' };
            }
          } else {
            sprintyResponse = { text: "Votre planning est vide pour le moment.", sender: 'sprinty' };
          }
          break;
        default:
          sprintyResponse = { text: `Je ne suis pas encore entraîné pour répondre à cela. Vous pouvez essayer une des options ci-dessous pour commencer.`, sender: 'sprinty' };
          break;
      }
      addMessage(sprintyResponse);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-light-background dark:bg-dark-background">
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
