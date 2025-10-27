import React, { useState, useRef, useEffect } from 'react'
import { Bot, User, Send } from 'lucide-react'
import useAuth from '../../hooks/useAuth.ts'
import { useProfile } from '../../hooks/useProfile.ts'
import { useChatMessages } from '../../hooks/useChatMessages.ts'
import { useBodyComposition } from '../../hooks/useBodyComposition.ts'
import { useRecords } from '../../hooks/useRecords.ts'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface AthleteChatBotProps {
  onUpgradeClick: () => void
}

export const AthleteChatBot: React.FC<AthleteChatBotProps> = ({ onUpgradeClick }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingDots, setTypingDots] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { profile } = useAuth()
  const { profile: userProfile } = useProfile()
  const { chatMessages, saveChatMessage } = useChatMessages()
  const { bodyComps } = useBodyComposition()
  const { records } = useRecords()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Charger l'historique des conversations depuis Supabase
  useEffect(() => {
    if (chatMessages.length > 0 && messages.length <= 1) {
      console.log('📚 Chargement historique conversation:', chatMessages.length, 'messages')
      
      const historicalMessages: Message[] = []
      
      chatMessages
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .slice(-10) // Garder les 10 derniers échanges
        .forEach(chat => {
          historicalMessages.push({
            id: `user_${chat.id}`,
            type: 'user',
            content: chat.message,
            timestamp: new Date(chat.created_at)
          })
          historicalMessages.push({
            id: `ai_${chat.id}`,
            type: 'ai',
            content: chat.response,
            timestamp: new Date(chat.created_at)
          })
        })
      
      if (historicalMessages.length > 0) {
        setMessages(prev => {
          // Garder le message de bienvenue et ajouter l'historique
          const welcomeMessage = prev[0]
          return [welcomeMessage, ...historicalMessages]
        })
      }
    }
  }, [chatMessages, messages.length])

  // Animation des points de frappe
  useEffect(() => {
    if (isTyping) {
      const interval = setInterval(() => {
        setTypingDots(prev => {
          if (prev === '') return '.'
          if (prev === '.') return '..'
          if (prev === '..') return '...'
          return ''
        })
      }, 500)
      
      return () => clearInterval(interval)
    } else {
      setTypingDots('')
    }
  }, [isTyping])

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'ai',
        content: `Salut ${userProfile?.first_name || 'Champion'} ! 👋 

Je suis Coach Bolt, votre coach personnel IA ! 

Je peux analyser vos données et vous conseiller sur l'entraînement, la nutrition, la récupération et vos performances.

Posez-moi vos questions ! 💪`,
        timestamp: new Date()
      }])
    }
  }, [userProfile?.first_name, messages.length])

  // Méthode pour générer une réponse coach en cas d'échec de l'API
  const generateCoachResponse = (question: string, userData: string) => {
    const lowerQuestion = question.toLowerCase()
    
    if (lowerQuestion.includes('vitesse') || lowerQuestion.includes('sprint') || lowerQuestion.includes('100m')) {
      return `🏃‍♂️ **Améliorer votre vitesse :**\n\n**Phase d'accélération (0-30m) :**\n- Corps incliné à 45°\n- Maximiser la force horizontale\n- Fréquence de pas élevée\n\n**Phase de vitesse maximale (30-60m) :**\n- Posture droite\n- Contact sol minimal\n- Forces verticales\n\n**Échauffement obligatoire :**\n1. Général (5-10min)\n2. Dynamique (5-10min)\n3. Gammes (5-10min)\n4. Accélérations progressives\n\n${userData ? '📊 Analysons vos données pour personnaliser davantage !' : ''}`
    }
    
    if (lowerQuestion.includes('musculation') || lowerQuestion.includes('force') || lowerQuestion.includes('squat')) {
      return `💪 **Programme musculation performance :**\n\n**Force Maximale :**\n- 85-100% 1RM\n- 1-5 répétitions\n- Repos 3-5 minutes\n\n**Puissance/Explosivité :**\n- 30-70% 1RM\n- 3-6 répétitions\n- Intention explosive maximale\n- Repos 2-5 minutes\n\n**Exercices prioritaires :**\n- Squat\n- Soulevé de terre\n- Développé couché\n\n${userData ? '📊 Vos données m\'aideront à ajuster les charges !' : ''}`
    }
    
    if (lowerQuestion.includes('nutrition') || lowerQuestion.includes('alimentation') || lowerQuestion.includes('protéine')) {
      return `🥗 **Nutrition sportive optimale :**\n\n**Macronutriments :**\n- Protéines : 1.2-2.2g/kg/jour\n- Glucides : 5-12g/kg selon intensité\n- Lipides : 20-30% apport calorique\n\n**Hydratation :**\n- 500-600ml 2-3h avant effort\n- 150-250ml toutes les 15-20min pendant\n\n**Supplémentation validée :**\n- Créatine : 3-5g/jour\n- Whey post-effort\n- Caféine : 3-6mg/kg 60min avant\n\n${userData ? '📊 Personnalisons selon votre composition corporelle !' : ''}`
    }
    
    return `👋 Salut ! En tant que Coach Bolt, je peux vous aider sur :\n\n🏃‍♂️ **Vitesse & Sprint**\n💪 **Musculation & Force**\n🥗 **Nutrition sportive**\n🔄 **Récupération**\n📊 **Analyse de performance**\n\nPosez-moi une question plus spécifique pour des conseils personnalisés !\n\n${userData ? '📊 J\'ai accès à vos données pour des conseils sur mesure.' : ''}`
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = input
    setInput('')
    setLoading(true)
    setIsTyping(true)

    try {
      // Construire le contexte de conversation avec l'historique
      const conversationHistory = messages
        .slice(-6) // Garder les 6 derniers messages pour le contexte
        .map(msg => `${msg.type === 'user' ? 'Athlète' : 'Coach Bolt'}: ${msg.content}`)
        .join('\n')

      // Préparer les données utilisateur pour l'IA
      let userData = ''
      if (bodyComps && bodyComps.length > 0) {
        const latest = bodyComps[0]
        userData += `\nDERNIÈRE COMPOSITION CORPORELLE (${latest.date}) :\n`
        userData += `- Poids: ${latest.weight.toFixed(1)}kg\n`
        userData += `- Masse grasse: ${latest.bodyFatPercentage.toFixed(1)}%\n`
        userData += `- Muscle squelettique: ${latest.skeletalMuscle.toFixed(1)}kg\n`
        
        if (bodyComps.length > 1) {
          const previous = bodyComps[1]
          const weightChange = latest.weight - previous.weight
          const fatChange = latest.bodyFatPercentage - previous.bodyFatPercentage
          userData += `- Évolution poids: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg\n`
          userData += `- Évolution masse grasse: ${fatChange > 0 ? '+' : ''}${fatChange.toFixed(1)}%\n`
        }
      }
      
      if (records && records.length > 0) {
        userData += `\nDERNIERS RECORDS :\n`
        records.slice(0, 3).forEach(record => {
          userData += `- ${record.name}: ${record.value} ${record.unit} (${record.date})\n`
        })
      }

      // Contexte expert basé sur le PDF
      let systemPrompt = `Tu es Coach Bolt, coach personnel IA spécialisé en performance athlétique. Tu donnes des conseils scientifiques précis et personnalisés.

PRINCIPES D'ENTRAÎNEMENT :
- Individualisation : Adapter selon les caractéristiques uniques
- Surcharge Progressive : Augmenter progressivement le stimulus
- Spécificité : Le corps s'adapte aux demandes spécifiques

ANALYSE COMPOSITION CORPORELLE :
- Hommes athlètes : 8-12% masse grasse optimal
- Femmes athlètes : 16-20% masse grasse optimal
- Ratio muscle/poids : >40% pour performance

VITESSE ET SPRINT :
- Accélération (0-30m) : Force horizontale, corps incliné 45°
- Vitesse Maximale (30-60m) : Force verticale, posture droite
- Échauffement obligatoire avant sprint

MUSCULATION PERFORMANCE :
- Force Max : 85-100% 1RM, 1-5 reps, repos 3-5min
- Puissance : 30-70% 1RM, 3-6 reps, intention explosive

NUTRITION OPTIMALE :
- Protéines : 1.2-2.2g/kg/jour
- Glucides : 5-12g/kg selon l'intensité
- Déficit calorique pour perte de graisse : -300 à -500 kcal/jour

Tu réponds de manière directe et pratique. ANALYSE TOUJOURS les données réelles de l'athlète.

DONNÉES ACTUELLES DE L'ATHLÈTE :${userData}

HISTORIQUE DE CONVERSATION :
${conversationHistory}`

      if (profile) {
        systemPrompt += `\n\nPROFIL ATHLÈTE :\n`
        if (profile.first_name) systemPrompt += `- Prénom: ${profile.first_name}\n`
        if (userProfile?.height) systemPrompt += `- Taille: ${userProfile.height}cm\n`
        if (userProfile?.weight) systemPrompt += `- Poids: ${userProfile.weight}kg\n`
        if (userProfile?.body_fat_percentage) systemPrompt += `- Masse grasse: ${userProfile.body_fat_percentage}%\n`
        if (userProfile?.training_frequency) systemPrompt += `- Fréquence: ${userProfile.training_frequency}\n`
        if (userProfile?.dietary_preferences?.length) systemPrompt += `- Spécialités: ${userProfile.dietary_preferences.join(', ')}\n`
        
        systemPrompt += "\nPersonnalise tes conseils avec ces données."
      }

      // Simuler le temps de frappe
      const estimatedResponseLength = userInput.length * 3
      const typingTime = Math.min(Math.max(estimatedResponseLength * 20, 1500), 4000)
      
      await new Promise(resolve => setTimeout(resolve, typingTime))
      setIsTyping(false)
      
      console.log('🤖 Appel API Google Gemini avec question:', userInput)

      // Appel à l'API Google Gemini
      const apiKey = 'AIzaSyBhPWq5plf5cn34-1WQHXkiMF9GNS_VXfc'
      const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`

      console.log('📡 Tentative appel API Google Gemini...')

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nQuestion de l'athlète : ${userInput}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      })

      console.log('📡 Réponse API status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erreur API Google Gemini:', response.status, errorText)
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Données reçues de l\'API:', data)

      let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!aiResponse) {
        console.warn('⚠️ Pas de réponse dans la structure attendue, utilisation du fallback')
        aiResponse = generateCoachResponse(userInput, userData)
      }

      // Nettoyer la réponse
      aiResponse = aiResponse.trim()
      
      console.log('✅ Réponse IA générée:', aiResponse.substring(0, 100) + '...')

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
      
      // Sauvegarder la conversation
      try {
        await saveChatMessage({
          message: userInput,
          response: aiResponse,
          plan_type: 'premium',
          used_personal_data: !!(userProfile?.first_name || userProfile?.weight || userProfile?.height || bodyComps?.length || records?.length)
        })
        console.log('💾 Conversation sauvegardée')
      } catch (saveError) {
        console.warn('⚠️ Erreur sauvegarde:', saveError)
      }
        
    } catch (error) {
      console.error('💥 Erreur API complète:', error)
      setIsTyping(false)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "⚠️ **Connexion temporairement limitée**\n\nDésolé, je rencontre un problème technique avec ma connexion principale.\n\n💡 **Réessayez dans quelques secondes** - ma connexion devrait être rétablie !\n\nEn attendant, vous pouvez consulter vos données dans les sections Records et Composition corporelle de l'app.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coach IA</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-[600px]">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bot className="h-8 w-8 text-primary-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Coach Bolt
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Votre coach personnel IA
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'ai' && (
                    <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary-500" />
                  )}
                  {message.type === 'user' && (
                    <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {(loading || isTyping) && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-primary-500" />
                  {isTyping ? (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span>Coach Bolt écrit</span>
                      <span className="font-mono">{typingDots}</span>
                    </div>
                  ) : (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ex: Salut Coach ! Comment améliorer mon 100m ? As-tu des conseils nutrition ?"
              className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={loading || isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={loading || isTyping || !input.trim()}
              className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 p-2 rounded-lg text-white transition-all duration-200 shadow-lg"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}