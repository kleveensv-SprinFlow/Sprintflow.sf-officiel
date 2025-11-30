import React from 'react';
import { ExerciseSelector } from '../common/ExerciseSelector';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExerciseLibraryProps {
    onBack: () => void;
}

export function ExerciseLibrary({ onBack }: ExerciseLibraryProps) {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <ArrowLeft className="text-gray-900 dark:text-white" />
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Bibliothèque d'exercices</h1>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden p-4">
                <ExerciseSelector
                    onSelect={(ex) => {
                        // In library mode, clicking could maybe open details or edit?
                        // For now, it does nothing or just highlights.
                        console.log("Selected in library:", ex);
                    }}
                />
            </div>
        </div>
    );
}
