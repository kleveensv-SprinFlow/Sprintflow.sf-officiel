import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Globe, Check } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, isLoading } = useLanguage();

  const languages = [
    { code: 'fr' as const, label: 'Français', flag: '🇫🇷' },
    { code: 'en' as const, label: 'English', flag: '🇬🇧' },
    { code: 'es' as const, label: 'Español', flag: '🇪🇸' }
  ];

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Globe className="w-4 h-4" />
        Langue / Language / Idioma
      </label>
      <div className="grid grid-cols-3 gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            disabled={isLoading}
            className={`
              flex items-center justify-center gap-2 px-3 py-2 rounded-lg
              border-2 transition-all text-sm font-medium
              ${language === lang.code
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }
              hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.label}</span>
            {language === lang.code && <Check className="w-4 h-4" />}
          </button>
        ))}
      </div>
    </div>
  );
};