import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { getSprintyAdvice } from '../../services/sprintyAdvisor.ts';

interface SprintyAdviceProps {
  step: 'sleep' | 'wellness' | 'cycle' | 'summary';
  data?: any;
}

export const SprintyAdvice: React.FC<SprintyAdviceProps> = ({ step, data }) => {
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchAdvice = async () => {
      setLoading(true);
      try {
        const text = await getSprintyAdvice(step, data);
        if (isMounted) setAdvice(text);
      } catch (error) {
        console.error("Failed to get advice", error);
        if (isMounted) setAdvice("Je suis là pour t'aider !");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAdvice();

    return () => { isMounted = false; };
  }, [step]); // We could add 'data' dependency if we want real-time updates as user types, but simple step change is safer for rate limits.

  return (
    <div className="flex items-start space-x-3 mb-6 p-1">
       <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 p-0.5 shadow-lg">
           <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
             <img src="/icone-sprintflow.png" alt="Sprinty" className="w-full h-full object-cover" />
           </div>
        </div>
        <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1 shadow-sm border border-white dark:border-slate-900">
          <Sparkles size={10} />
        </div>
      </div>

      <div className="flex-1">
        <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl rounded-tl-none p-3 shadow-sm min-h-[60px] flex items-center">
          <AnimatePresence mode="wait">
            {loading ? (
                <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex space-x-1"
                >
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </motion.div>
            ) : (
                <motion.p
                  key="text"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-gray-700 dark:text-gray-200 font-medium leading-relaxed"
                >
                  {advice}
                </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
