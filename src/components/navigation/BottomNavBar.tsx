// src/components/navigation/BottomNavBar.tsx
import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart2, FolderKanban, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Fab from './Fab';
import FabMenu from './FabMenu';
import WeightEntryModal from '../dashboard/WeightEntryModal';

const navItems = [
  { to: '/', icon: Home, label: 'FOCUS' },
  { to: '/flows', icon: FolderKanban, label: 'FLOWS' },
  { to: '/data', icon: BarChart2, label: 'DATA' },
  { to: '/profile', icon: User, label: 'PROFIL' },
];

const BottomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  const handleFabAction = (actionId: string) => {
    setIsFabOpen(false);
    switch (actionId) {
      case 'record':
        navigate('/records/new');
        break;
      case 'workout':
        navigate('/planning/new');
        break;
      case 'sleep':
        navigate('/sleep/add');
        break;
      case 'weight':
        setIsWeightModalOpen(true);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md mx-auto z-50">
        <div className="relative flex items-center justify-around h-20 bg-sprint-dark-surface/70 backdrop-blur-lg rounded-3xl border border-white/10 shadow-premium-dark">
          {/* We map over a sliced array to correctly place the FAB gap */}
          {navItems.slice(0, 2).map(item => (
             <NavItem key={item.to} {...item} isActive={location.pathname === item.to} />
          ))}
          <div className="w-24 h-24 flex-shrink-0" aria-hidden="true"></div>
          {navItems.slice(2, 4).map(item => (
             <NavItem key={item.to} {...item} isActive={location.pathname === item.to} />
          ))}
        </div>
        <Fab onClick={() => setIsFabOpen(true)} />
      </footer>
      <FabMenu
        isOpen={isFabOpen}
        onClose={() => setIsFabOpen(false)}
        onAction={handleFabAction}
      />
      <WeightEntryModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
      />
    </>
  );
};

const NavItem = ({ to, icon: Icon, label, isActive }) => {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className="relative flex flex-col items-center justify-center gap-1 w-full h-full text-xs transition-colors font-manrope text-gray-400 hover:text-white"
    >
      <Icon size={24} className={isActive ? "text-sprint-primary" : ""} />
      <span className={`font-din uppercase tracking-wider ${isActive ? "text-white" : ""}`}>{label}</span>

      {isActive && (
        <motion.div
          layoutId="active-indicator"
          className="absolute bottom-2 h-1 w-8 bg-sprint-primary rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </NavLink>
  );
};

export default BottomNavBar;
