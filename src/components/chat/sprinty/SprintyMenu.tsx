import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Calendar, Zap, Moon, BarChart2 } from 'lucide-react';
import { useSprinty } from '../../../context/SprintyContext';
import { useNavigate } from 'react-router-dom';

interface SprintyMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SprintyMenu: React.FC<SprintyMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { setExpression } = useSprinty();

  const quickActions = [
    { 
      id: 'checkin', 
      label: 'Comment est ma forme ?', 
      icon: BarChart2, 
      color: 'bg-blue-500',
      action: () => {
        setExpression('thinking');
        // Logic to trigger analysis
        navigate('/sprinty'); // Go to chat to see answer
      }
    },
    { 
      id: 'plan', 
      label: 'Planifier une séance', 
      icon: Calendar, 
      color: 'bg-green-500',
      action: () => {
        setExpression('happy');
        navigate('/planning/new');
      }
    },
    { 
      id: 'sleep', 
      label: 'Analyse mon sommeil', 
      icon: Moon, 
      color: 'bg-indigo-500',
      action: () => {
        setExpression('sleep');
        navigate('/sleep');
      }
    },
    { 
      id: 'motivation', 
      label: 'Motive-moi !', 
      icon: Zap, 
      color: 'bg-yellow-500',
      action: () => {
        setExpression('success');
        navigate('/sprinty'); // Sprinty should send a message
      }
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-96 z-50"
          >
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-4 shadow-neumorphic-strong border border-white/20">
              <div className="mb-4 text-center">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Je peux t'aider ?
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Choisis une action rapide
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      action.action();
                      onClose();
                    }}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all active:scale-95 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                  >
                    <div className={`p-3 rounded-full ${action.color} text-white mb-2 shadow-lg`}>
                      <action.Icon size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 text-center">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SprintyMenu;
