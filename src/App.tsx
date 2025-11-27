import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSprinty } from '../../context/SprintyContext';
import SprintyAvatar from './sprinty/SprintyAvatar';

const ChatInterface: React.FC = () => {
  const { messages, sendMessage, isTyping } = useSprinty();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll automatique vers le bas à chaque nouveau message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
    // On garde le focus sur l'input pour enchaîner
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-black/20 relative">
      
      {/* ZONE DES MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 pb-24">
        {messages.length === 0 ? (
          // État vide (Message de bienvenue)
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70 mt-10">
            <div className="w-24 h-24">
              <SprintyAvatar scale={2} onClick={() => {}} />
            </div>
            <div className="max-w-xs mx-auto">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                Salut, je suis Sprinty !
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ton coach IA personnel. Pose-moi une question sur ton entraînement, ta nutrition ou tes stats.
              </p>
            </div>
          </div>
        ) : (
          // Liste des messages
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar */}
                  <div className="flex-shrink-0 mt-auto">
                    {isUser ? (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User size={16} className="text-gray-500 dark:text-gray-300" />
                      </div>
                    ) : (
                      <div className="w-8 h-8">
                        <SprintyAvatar scale={0.7} onClick={() => {}} />
                      </div>
                    )}
                  </div>

                  {/* Bulle de message */}
                  <div
                    className={`p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
                      isUser
                        ? 'bg-sprint-primary text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700'
                    }`}
                  >
                    {msg.content}
                    <div className={`text-[10px] mt-1 text-right opacity-70 ${isUser ? 'text-white/80' : 'text-gray-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}

        {/* Indicateur de frappe (Typing...) */}
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start w-full"
          >
             <div className="flex items-end gap-3">
                <div className="w-8 h-8">
                   <SprintyAvatar scale={0.7} onClick={() => {}} />
                </div>
                <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700 flex items-center space-x-1">
                  <span className="w-2 h-2 bg-sprint-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-sprint-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-sprint-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
             </div>
          </motion.div>
        )}
        
        {/* Ancre invisible pour le scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* BARRE DE SAISIE FLOTTANTE */}
      {/* calc(100vh) permet de s'assurer qu'elle est toujours accessible au dessus du clavier virtuel sur mobile */}
      <div className="absolute bottom-4 left-0 right-0 px-4 z-20">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center gap-2 bg-white dark:bg-[#1a1f2e] p-2 rounded-full shadow-xl border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
            
            {/* Bouton IA (Décoratif) */}
            <div className="pl-2 hidden md:block">
              <div className="w-8 h-8 rounded-full bg-sprint-primary/10 flex items-center justify-center">
                <Sparkles size={16} className="text-sprint-primary" />
              </div>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Demande un conseil à Sprinty..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 dark:text-white placeholder-gray-400 px-4 py-3 h-12"
            />

            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center w-12 h-12 flex-shrink-0 ${
                inputValue.trim()
                  ? 'bg-sprint-primary text-white shadow-lg shadow-sprint-primary/30 hover:scale-105 active:scale-95'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send size={20} className={inputValue.trim() ? 'ml-0.5' : ''} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ChatInterface;