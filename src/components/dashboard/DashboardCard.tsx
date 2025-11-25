// src/components/dashboard/DashboardCard.tsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  to: string;
  children: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, to, children }) => {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="mx-4"
    >
      <Link to={to} className="block bg-sprint-dark-surface border border-sprint-dark-border-subtle rounded-3xl p-6 shadow-premium-dark focus:outline-none focus:ring-2 focus:ring-sprint-primary">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-din-title text-xl text-white">{title}</h2>
          <div className="flex items-center text-sprint-primary font-din-data text-sm">
            <span>VOIR TOUT</span>
            <ChevronRight size={18} />
          </div>
        </div>
        <div>
          {children}
        </div>
      </Link>
    </motion.div>
  );
};

export default DashboardCard;
