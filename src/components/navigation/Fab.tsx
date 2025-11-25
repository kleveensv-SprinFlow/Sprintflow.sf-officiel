// src/components/navigation/Fab.tsx
import { Plus } from 'lucide-react';

const Fab = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(50%+10px)] w-20 h-20 bg-sprint-primary rounded-full shadow-lg flex items-center justify-center text-white animate-pulse-slow border-4 border-sprint-dark-background"
            aria-label="Ajouter une nouvelle entrée"
        >
            <Plus size={36} />
        </button>
    )
}

export default Fab;
