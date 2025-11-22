import React from 'react';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, UserPlus, ChevronRight } from 'lucide-react';
import { GroupAnalytics } from '../../hooks/useGroups';

interface GroupLiquidCardProps {
  group: GroupAnalytics;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const GroupLiquidCard: React.FC<GroupLiquidCardProps> = ({ group, onClick, onDelete }) => {
  // Calculate liquid height based on score (0-100%)
  // If score is 0 (e.g. no check-ins), show a minimal level (5%) so it's not empty
  const score = Math.round(group.avg_score);
  const liquidHeight = Math.max(5, score);

  // Determine color based on score
  const getStatusColor = (score: number) => {
    if (group.checkin_count === 0) return 'bg-gray-400'; // No data
    if (score < 40) return 'bg-red-500';
    if (score < 70) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const liquidColor = getStatusColor(score);
  const hasAlerts = group.alerts_count > 0;
  const hasPending = group.pending_requests_count > 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative w-full h-48 rounded-2xl overflow-hidden shadow-neumorphic bg-white dark:bg-gray-800 cursor-pointer group border border-white/20"
      style={group.color ? { borderColor: `${group.color}40` } : undefined} // Subtle border hint of group color
    >
      {/* Liquid Animation Container */}
      <div className="absolute inset-0 z-0 flex items-end">
        <div 
          className={`w-full transition-all duration-1000 ease-in-out relative ${liquidColor} opacity-20`}
          style={{ height: `${liquidHeight}%` }}
        >
          {/* Animated Wave Top */}
          <div 
            className={`absolute -top-4 left-0 w-[200%] h-8 ${liquidColor} opacity-50 rounded-[100%] animate-wave`} 
          />
          <div 
            className={`absolute -top-2 left-0 w-[200%] h-8 ${liquidColor} opacity-30 rounded-[100%] animate-wave-slow`} 
          />
        </div>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 p-5 flex flex-col justify-between">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 
              className="text-xl font-bold text-gray-900 dark:text-white leading-tight truncate pr-2"
              style={group.color ? { textShadow: `0 0 15px ${group.color}40` } : undefined}
            >
              {group.group_name}
            </h3>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
              <Users size={14} className="mr-1" />
              <span>{group.member_count} membres</span>
            </div>
          </div>
          
          {/* Score Badge */}
          {group.checkin_count > 0 ? (
            <div className={`px-2 py-1 rounded-lg text-xs font-bold text-white shadow-sm ${liquidColor.replace('bg-', 'bg-opacity-100 bg-')}`}>
              {score}%
            </div>
          ) : (
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: group.color || '#9CA3AF' }} 
              title="Couleur du groupe"
            />
          )}
        </div>

        {/* Indicators / Bottom Row */}
        <div className="flex items-end justify-between">
          <div className="flex space-x-2">
            {/* Alerts Indicator */}
            {hasAlerts && (
              <div className="flex items-center px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-xs font-semibold border border-red-200 dark:border-red-800">
                <AlertTriangle size={12} className="mr-1" />
                {group.alerts_count} alerte{group.alerts_count > 1 ? 's' : ''}
              </div>
            )}
            
            {/* Pending Requests Indicator */}
            {hasPending && (
              <div className="flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md text-xs font-semibold border border-blue-200 dark:border-blue-800">
                <UserPlus size={12} className="mr-1" />
                {group.pending_requests_count}
              </div>
            )}
            
            {/* No Check-ins State */}
            {group.checkin_count === 0 && group.member_count > 0 && (
              <span className="text-xs text-gray-400 italic mt-1">
                Aucun check-in aujourd'hui
              </span>
            )}
          </div>

          <div className="p-2 bg-white/80 dark:bg-black/20 rounded-full backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
