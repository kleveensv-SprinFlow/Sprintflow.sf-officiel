// src/components/dashboard/AthleteRecordsCarousel.tsx
import React, { useMemo, useState, useRef } from 'react';
import { useRecords } from '../../hooks/useRecords';
import useAuth from '../../hooks/useAuth';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Record } from '../../types';
import { Loader, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

interface AthleteRecordsCarouselProps {
  onNavigate: () => void;
  userId?: string;
}

export const AthleteRecordsCarousel: React.FC<AthleteRecordsCarouselProps> = ({ onNavigate, userId }) => {
  const { user } = useAuth();
  const { records, loading: recordsLoading } = useRecords(userId || user?.id);
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLUListElement>(null);
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const offsetX = useMotionValue(0);
  const animatedX = useSpring(offsetX, { damping: 20, stiffness: 150 });

  const allRecords = useMemo(() => {
    if (!records) return [];
    
    const grouped: { [key:string]: Record[] } = {};
    records.forEach(record => {
      if (!grouped[record.name]) {
        grouped[record.name] = [];
      }
      grouped[record.name].push(record);
    });

    return Object.values(grouped).map(group => {
      group.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const lowerIsBetter = group[0].unit === 's' || group[0].unit === 'min';
      const bestRecord = group.reduce((best, current) => {
        if (lowerIsBetter) {
          return current.value < best.value ? current : best;
        }
        return current.value > best.value ? current : best;
      }, group[0]);

      return {
        name: group[0].name,
        best: bestRecord.value,
        unit: bestRecord.unit,
        history: group.map((r, index) => ({ date: index, value: r.value })),
      };
    });
  }, [records]);

  const updateOffset = (index: number) => {
    if (!containerRef.current || !itemsRef.current[index]) return;
    const containerWidth = containerRef.current.offsetWidth;
    const itemWidth = itemsRef.current[index]!.offsetWidth;
    const newOffset = (containerWidth / 2) - (itemWidth / 2) - itemsRef.current.slice(0, index).reduce((acc, item) => acc + (item?.offsetWidth || 0), 0);
    offsetX.set(newOffset);
    setActiveIndex(index);
  };

  const scrollPrev = () => {
    if (activeIndex > 0) {
      updateOffset(activeIndex - 1);
    }
  };

  const scrollNext = () => {
    if (activeIndex < allRecords.length - 1) {
      updateOffset(activeIndex + 1);
    }
  };

  if (recordsLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (allRecords.length === 0) {
    return (
      <div className="text-center py-8 card-glass shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mes Records</h2>
        <p className="text-gray-600 dark:text-gray-400">Aucun record pour le moment.</p>
        <button onClick={onNavigate} className="mt-4 px-6 py-2 font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-all duration-300 ease-in-out shadow-md transform hover:scale-105">Ajouter un record</button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 px-4 sm:px-0">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp size={24} /> Mes Records
        </h2>
        <button
          onClick={onNavigate}
          className="text-sm font-semibold text-primary-600 hover:underline dark:text-primary-400 dark:hover:underline"
        >
          Voir tout
        </button>
      </div>
      <div className="relative h-52 w-full overflow-hidden">
        <motion.ul
          ref={containerRef}
          className="flex items-center h-full"
          style={{ x: animatedX }}
        >
          {allRecords.map((record, index) => (
            <motion.li
              layout
              key={record.name}
              ref={(el) => (itemsRef.current[index] = el)}
              className="group relative shrink-0 select-none px-2 h-full"
              style={{ flexBasis: '60%', minWidth: '220px', maxWidth: '280px' }}
              onClick={() => updateOffset(index)}
            >
              <motion.div 
                className="card-glass shadow-lg p-4 h-full flex flex-col justify-between cursor-pointer"
                animate={{ scale: activeIndex === index ? 1 : 0.85, opacity: activeIndex === index ? 1 : 0.6 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <h3 className="text-lg font-bold text-center truncate text-gray-800 dark:text-white">{record.name}</h3>
                  <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400 text-center my-1">
                    {record.best} <span className="text-xl font-semibold">{record.unit}</span>
                  </p>
                </div>
                <div className="h-20 w-full opacity-60 group-hover:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={record.history}>
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.6)', 
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)', 
                          borderRadius: '12px',
                          color: '#1f2937'
                        }}
                        formatter={(value: number) => [`${value} ${record.unit}`, "Perf"]}
                        labelFormatter={() => ''}
                      />
                      <Line type="monotone" dataKey="value" stroke="currentColor" className="text-primary-500" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </motion.li>
          ))}
        </motion.ul>
        <button
          onClick={scrollPrev}
          disabled={activeIndex === 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 card-glass text-gray-800 dark:text-white p-2 rounded-full disabled:opacity-30 z-10 hover:scale-110 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={scrollNext}
          disabled={activeIndex === allRecords.length - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 card-glass text-gray-800 dark:text-white p-2 rounded-full disabled:opacity-30 z-10 hover:scale-110 transition-transform"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};
