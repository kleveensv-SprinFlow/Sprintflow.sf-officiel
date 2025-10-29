// src/components/dashboard/StrengthRecordsCarousel.tsx
import React, { useMemo, useState, useRef } from 'react';
import { useRecords } from '../../hooks/useRecords';
import { useBodycomp } from '../../hooks/useBodycomp';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Record } from '../../types';
import { Loader, ChevronLeft, ChevronRight, Repeat } from 'lucide-react';

const FALLBACK_WIDTH = 250;

export const StrengthRecordsCarousel: React.FC = () => {
  const { records, loading: recordsLoading } = useRecords();
  const { lastWeight, loading: weightLoading } = useBodycomp();
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLUListElement>(null);
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);

  const offsetX = useMotionValue(0);
  const animatedX = useSpring(offsetX, { damping: 20, stiffness: 150 });

  const strengthRecords = useMemo(() => {
    if (!records || !lastWeight) return [];
    const exerciseRecords = records.filter(r => r.type === 'exercise');
    const grouped: { [key:string]: Record[] } = {};
    exerciseRecords.forEach(record => {
      if (!grouped[record.name]) {
        grouped[record.name] = [];
      }
      grouped[record.name].push(record);
    });
    return Object.values(grouped).map(group => {
      group.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const bestRecord = group.reduce((best, current) => current.value > best.value ? current : best, group[0]);
      return {
        name: group[0].name,
        best: bestRecord.value,
        ratio: (bestRecord.value / lastWeight.weight).toFixed(2),
        history: group.map((r, index) => ({ date: index, value: r.value })),
      };
    });
  }, [records, lastWeight]);

  const scrollPrev = () => {
    if (activeIndex > 0) {
      const newIndex = activeIndex - 1;
      const newOffset = (itemsRef.current.slice(0, newIndex).reduce((acc, item) => acc + (item?.offsetWidth || 0), 0)) * -1;
      offsetX.set(newOffset);
      setActiveIndex(newIndex);
    }
  };

  const scrollNext = () => {
    if (activeIndex < strengthRecords.length - 1) {
      const newIndex = activeIndex + 1;
      const newOffset = (itemsRef.current.slice(0, newIndex).reduce((acc, item) => acc + (item?.offsetWidth || 0), 0)) * -1;
      offsetX.set(newOffset);
      setActiveIndex(newIndex);
    }
  };

  if (recordsLoading || weightLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-secondary-500" size={32} />
      </div>
    );
  }

  if (strengthRecords.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          Mes Records de Force
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center">Aucun record de force trouvé.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
        Mes Records de Force
      </h2>
      <div className="relative h-64 w-full overflow-hidden">
        <motion.ul
            ref={containerRef}
            className="flex items-center h-full"
            style={{ x: animatedX }}
        >
          {strengthRecords.map((record, index) => {
            const active = index === activeIndex;
            return (
              <motion.li
                layout
                key={record.name}
                ref={(el) => (itemsRef.current[index] = el)}
                className="group relative shrink-0 select-none px-2 h-full"
                animate={{ scale: active ? 1 : 0.8, opacity: active ? 1 : 0.5 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ flexBasis: '50%', perspective: '1000px' }}
              >
                <motion.div 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 h-full flex flex-col justify-between"
                  whileHover={{ scale: 1.05 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div>
                    <h3 className="text-md font-semibold text-center truncate">{record.name}</h3>
                    <p className="text-2xl font-bold text-secondary-500 text-center my-1">
                      {record.best}kg
                    </p>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                      <Repeat size={14} className="inline-block mr-1" />
                      {record.ratio}x PdC
                    </p>
                  </div>
                  <div className="h-24 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={record.history}>
                        <Tooltip
                          formatter={(value: number) => [`${value}kg`, "Poids"]}
                          labelFormatter={() => ''}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#f97316"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </motion.li>
            )
          })}
        </motion.ul>
      </div>
      <button
        onClick={scrollPrev}
        disabled={activeIndex === 0}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full disabled:opacity-30 z-10"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={scrollNext}
        disabled={activeIndex === strengthRecords.length - 1}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full disabled:opacity-30 z-10"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};