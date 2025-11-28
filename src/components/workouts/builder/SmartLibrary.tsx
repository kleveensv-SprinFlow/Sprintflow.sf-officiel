import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Bookmark, Navigation, Dumbbell, Clock, Play } from 'lucide-react';
import { WorkoutBlock, CourseBlock, MuscuBlock, RestBlock, TechniqueBlock } from '../../../types/workout';
import { useFavoriteBlocks } from '../../../hooks/useFavoriteBlocks';

interface SmartLibraryProps {
    isOpen: boolean;
    onClose: () => void;
    onAddBlock: (block: WorkoutBlock) => void;
}

export function SmartLibrary({ isOpen, onClose, onAddBlock }: SmartLibraryProps) {
    const { favorites, loading, deleteFavorite } = useFavoriteBlocks();
    const [searchTerm, setSearchTerm] = useState('');

    const createBaseBlock = (type: 'course' | 'musculation' | 'repos' | 'technique'): WorkoutBlock => {
        const baseId = `block_${Date.now()}`;
        switch (type) {
            case 'course':
                return {
                    id: baseId,
                    type: 'course',
                    series: 1,
                    reps: 1,
                    distance: 400,
                    restBetweenReps: "0'",
                    restBetweenSeries: "3'",
                    intensity_score: 5
                } as CourseBlock;
            case 'musculation':
                return {
                    id: baseId,
                    type: 'musculation',
                    exerciceId: '',
                    exerciceNom: '',
                    series: 3,
                    reps: 10,
                    poids: null,
                    restTime: "2'"
                } as MuscuBlock;
            case 'repos':
                return {
                    id: baseId,
                    type: 'repos',
                    rest_duration_seconds: 180,
                    activity_type: 'marche'
                } as RestBlock;
            case 'technique':
                return {
                    id: baseId,
                    type: 'technique',
                    title: '',
                    duration_estimated_seconds: 600,
                } as TechniqueBlock;
            default:
                throw new Error("Unknown type");
        }
    };

    const handleAddBase = (type: 'course' | 'musculation' | 'repos' | 'technique') => {
        onAddBlock(createBaseBlock(type));
        onClose(); // Optional: keep open for multi-add
    };

    const handleAddFavorite = (fav: { block_data: WorkoutBlock }) => {
        const newBlock = { ...fav.block_data, id: `block_${Date.now()}` };
        onAddBlock(newBlock);
        onClose();
    };

    const drawerVariants = {
        hidden: { x: "100%", opacity: 0 },
        visible: {
            x: "0%",
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 30 }
        },
        exit: {
            x: "100%",
            opacity: 0,
            transition: { duration: 0.2 }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-800"
                        variants={drawerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-lg font-bold">Bibliothèque</h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                                <Plus className="rotate-45 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                             <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Rechercher un bloc..."
                                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-gray-800 border-none shadow-sm text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                             </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Base Blocks */}
                            <section>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Briques de base</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => handleAddBase('course')} className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl flex flex-col items-center gap-2 hover:scale-105 transition-transform border border-blue-100 dark:border-blue-800">
                                        <Navigation size={24} />
                                        <span className="font-semibold text-sm">Course</span>
                                    </button>
                                    <button onClick={() => handleAddBase('musculation')} className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-xl flex flex-col items-center gap-2 hover:scale-105 transition-transform border border-purple-100 dark:border-purple-800">
                                        <Dumbbell size={24} />
                                        <span className="font-semibold text-sm">Muscu</span>
                                    </button>
                                    <button onClick={() => handleAddBase('repos')} className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-xl flex flex-col items-center gap-2 hover:scale-105 transition-transform border border-gray-200 dark:border-gray-700">
                                        <Clock size={24} />
                                        <span className="font-semibold text-sm">Repos</span>
                                    </button>
                                    <button onClick={() => handleAddBase('technique')} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-xl flex flex-col items-center gap-2 hover:scale-105 transition-transform border border-yellow-100 dark:border-yellow-800">
                                        <Play size={24} />
                                        <span className="font-semibold text-sm">Technique</span>
                                    </button>
                                </div>
                            </section>

                            {/* Favorites */}
                            <section>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Mes Favoris</h3>
                                {loading ? (
                                    <div className="text-center text-sm text-gray-400">Chargement...</div>
                                ) : favorites.length === 0 ? (
                                    <div className="text-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                                        <Bookmark className="mx-auto text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-400">Aucun favori enregistré</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {favorites.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map(fav => (
                                            <div key={fav.id} className="flex items-center gap-2 group">
                                                <button
                                                    onClick={() => handleAddFavorite(fav)}
                                                    className="flex-1 text-left p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-blue-500 transition-colors"
                                                >
                                                    <div className="font-medium text-sm">{fav.name}</div>
                                                    <div className="text-xs text-gray-400 mt-0.5 capitalize">{fav.block_data.type}</div>
                                                </button>
                                                <button
                                                    onClick={() => deleteFavorite(fav.id)}
                                                    className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
