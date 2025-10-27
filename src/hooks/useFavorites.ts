import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Camera, ZapOff, Zap, Star } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useFavorites } from '../../hooks/useFavorites';
import { FoodItem, UnitOption } from '../../types';

// --- Constantes & Thème ---
const UNIT_KEYWORDS: { [key: string]: { label: string; grams: number } } = { 'œuf': { label: 'œuf', grams: 55 }, 'oeuf': { label: 'œuf', grams: 55 }, 'yaourt': { label: 'yaourt', grams: 125 }, 'biscuit': { label: 'biscuit', grams: 15 }, 'tranche': { label: 'tranche', grams: 25 }, 'sablé': { label: 'sablé', grams: 20 }, 'cookie': { label: 'cookie', grams: 20 }, 'galette': { label: 'galette', grams: 30 }, 'cracotte': { label: 'cracotte', grams: 8 }, 'carré': { label: 'carré', grams: 10 }, 'banane': { label: 'banane', grams: 120 }, 'pomme': { label: 'pomme', grams: 150 }, 'clémentine': { label: 'clémentine', grams: 50 }, 'nectarine': { label: 'nectarine', grams: 130 } };
const LIQUID_KEYWORDS = ['lait', 'jus', 'eau', 'soda', 'boisson', 'nectar', 'soupe', 'milk', 'drink', 'juice'];
const THEME = { bg: 'bg-white dark:bg-gray-800', text: 'text-gray-900 dark:text-gray-100', textMuted: 'text-gray-500 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700', inputBg: 'bg-gray-100 dark:bg-gray-700', cardBg: 'bg-white dark:bg-gray-700', cardHover: 'hover:bg-gray-50 dark:hover:bg-gray-600/50', primaryButton: 'bg-blue-600 hover:bg-blue-700 text-white', secondaryButton: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600' };

interface FoodSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectFood: (food: FoodItem, quantite_g: number, tag_moment?: string) => void;
}

// --- Composant Principal ---
export function FoodSearchModal({ isOpen, onClose, onSelectFood }: FoodSearchModalProps) {
    // --- États & Hooks ---
    const [activeTab, setActiveTab] = useState<'favorites' | 'search'>('favorites');
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [quantity, setQuantity] = useState(1.0);
    const [tagMoment, setTagMoment] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scannerError, setScannerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [isFlashOn, setIsFlashOn] = useState(false);
    const [availableUnits, setAvailableUnits] = useState<UnitOption[]>([]);
    const [selectedUnit, setSelectedUnit] = useState<UnitOption>({ label: 'g', grams: 1 });
    const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerElementId = 'barcode-scanner';

    // ... (le reste du code est identique à la version finale précédente) ...
}