import { WifiOff, Wifi } from 'lucide-react';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineIndicator() {
  const { isOnline } = useOfflineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white py-2 px-4 flex items-center justify-center gap-2 shadow-lg"
        >
          <WifiOff className="w-5 h-5" />
          <span className="font-medium">Mode hors ligne</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ConnectionStatusBadge() {
  const { isOnline } = useOfflineStatus();

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
        isOnline
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          En ligne
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          Hors ligne
        </>
      )}
    </div>
  );
}
