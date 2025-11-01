import React, { useState, useEffect } from 'react'

export interface LoadingScreenProps {
  message?: string
}

const inspirationalQuotes = [
  {
    quote: "Le talent gagne des matchs, mais le travail d'équipe et l'intelligence gagnent des championnats.",
    author: "Michael Jordan"
  },
  {
    quote: "Il n'y a pas de raccourci vers un endroit qui vaut la peine d'aller.",
    author: "Beverly Sills"
  },
  {
    quote: "Le succès, c'est tomber sept fois et se relever huit.",
    author: "Proverbe japonais"
  },
  {
    quote: "Champions continue de jouer jusqu'à ce qu'ils réussissent.",
    author: "Billie Jean King"
  },
  {
    quote: "La différence entre l'impossible et le possible réside dans la détermination d'une personne.",
    author: "Tommy Lasorda"
  },
  {
    quote: "Vous manquez 100% des tirs que vous ne prenez pas.",
    author: "Wayne Gretzky"
  },
  {
    quote: "La douleur est temporaire. Abandonner dure pour toujours.",
    author: "Lance Armstrong"
  },
  {
    quote: "Il faut viser la lune, car même en cas d'échec, on atterrit dans les étoiles.",
    author: "Oscar Wilde"
  },
  {
    quote: "Le plus grand adversaire, c'est soi-même.",
    author: "Pelé"
  },
  {
    quote: "La victoire appartient au plus persévérant.",
    author: "Napoléon Bonaparte"
  },
  {
    quote: "Ce n'est pas la taille du chien dans le combat, c'est la taille du combat dans le chien.",
    author: "Mark Twain"
  },
  {
    quote: "L'excellence n'est pas un acte, mais une habitude.",
    author: "Aristote"
  },
  {
    quote: "Les champions sont faits de quelque chose qu'ils ont au fond d'eux - un désir, un rêve, une vision.",
    author: "Muhammad Ali"
  },
  {
    quote: "La seule façon de faire du bon travail est d'aimer ce que vous faites.",
    author: "Steve Jobs"
  },
  {
    quote: "Le courage n'est pas l'absence de peur, mais la maîtrise de la peur.",
    author: "Mark Twain"
  },
  {
    quote: "Croyez en vous-même et tout devient possible.",
    author: "Kobe Bryant"
  },
  {
    quote: "La persévérance est la clé de voûte de tous les triomphes.",
    author: "Proverbe"
  },
  {
    quote: "Il n'y a qu'une façon d'éviter les critiques : ne rien faire, ne rien dire et n'être rien.",
    author: "Aristote"
  },
  {
    quote: "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte.",
    author: "Winston Churchill"
  },
  {
    quote: "Vous ne pouvez pas mettre une limite sur quoi que ce soit. Plus vous rêvez, plus loin vous irez.",
    author: "Michael Phelps"
  }
]

export function LoadingScreen({
  message = 'Chargement de l\'application...' // Message par défaut plus générique
}: LoadingScreenProps) {
  const [currentQuote, setCurrentQuote] = useState(inspirationalQuotes[0])
  const [showContent, setShowContent] = useState(true)

  useEffect(() => {

    // Citation aléatoire immédiate
    const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length)
    setCurrentQuote(inspirationalQuotes[randomIndex])

    // Changer de citation toutes les 3 secondes
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length)
      setCurrentQuote(inspirationalQuotes[randomIndex])
    }, 3000)

    return () => {
      clearInterval(interval)
    }
  }, [])


  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center z-50">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Logo avec animation de pulsation */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 rounded-full bg-primary-200 dark:bg-primary-800 animate-ping opacity-20"></div>
          <div className="absolute inset-2 rounded-full bg-primary-100 dark:bg-primary-900 animate-ping opacity-30 animation-delay-75"></div>
          <img
            src="https://github.com/sprintflowanalyse-star/Sprintflow-logo/raw/a9fd36b0444dd0da71e7bc4eaf7aafb6631155c9/PhotoRoom-20250915_123950.png"
            alt="Sprintflow Logo"
            className="relative w-20 h-20 mx-auto object-contain animate-pulse"
          />
        </div>

        {/* Titre avec gradient */}
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          Sprintflow
        </h1>

        {/* Spinner de chargement */}
        <div className="relative mb-8">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-secondary-500 rounded-full animate-spin mx-auto animation-delay-150"></div>
        </div>

        {/* Message de chargement */}
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-8">
          {message}
        </p>

        {/* Citation inspirante */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md dark:backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <blockquote className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-3 italic">
            "{currentQuote.quote}"
          </blockquote>
          <cite className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
            — {currentQuote.author}
          </cite>
        </div>

        {/* Points de chargement animés */}
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce animation-delay-100"></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce animation-delay-200"></div>
        </div>
      </div>
    </div>
  )
}