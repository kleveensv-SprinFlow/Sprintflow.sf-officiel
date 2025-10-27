import React, { useState, useEffect } from 'react'
import { X, CheckCircle, AlertTriangle, AlertCircle, Info, Bell } from 'lucide-react'

interface NotificationData {
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder'
  action_url?: string
  action_label?: string
}

export const NotificationDisplay: React.FC = () => {
  const [notifications, setNotifications] = useState<(NotificationData & { id: string })[]>([])

  useEffect(() => {
    const handleGlobalNotification = (event: any) => {
      const notificationData = event.detail
      const id = `notification_${Date.now()}`
      
      setNotifications(prev => [...prev, { ...notificationData, id }])
      
      // Auto-remove après 8 secondes
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }, 8000)
    }

    window.addEventListener('global-notification', handleGlobalNotification)
    
    return () => {
      window.removeEventListener('global-notification', handleGlobalNotification)
    }
  }, [])

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'warning': return <AlertTriangle className="h-6 w-6 text-yellow-500" />
      case 'error': return <AlertCircle className="h-6 w-6 text-red-500" />
      case 'reminder': return <Bell className="h-6 w-6 text-blue-500" />
      default: return <Info className="h-6 w-6 text-blue-500" />
    }
  }

  const getNotificationColors = (type: string) => {
    switch (type) {
      case 'success': return 'from-green-500 to-emerald-500 border-green-200'
      case 'warning': return 'from-yellow-500 to-orange-500 border-yellow-200'
      case 'error': return 'from-red-500 to-pink-500 border-red-200'
      case 'reminder': return 'from-blue-500 to-indigo-500 border-blue-200'
      default: return 'from-primary-500 to-secondary-500 border-primary-200'
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 space-y-3 z-50 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-gradient-to-r ${getNotificationColors(notification.type)} text-white rounded-xl shadow-2xl border-2 p-4 transform transition-all duration-300 animate-slide-in`}
          style={{
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 bg-white/20 rounded-full p-2">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white mb-1">
                {notification.title}
              </h4>
              <p className="text-white/90 text-sm leading-relaxed">
                {notification.message}
              </p>
              
              {notification.action_url && notification.action_label && (
                <a
                  href={notification.action_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  {notification.action_label}
                </a>
              )}
            </div>
            
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-white/70 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Barre de progression */}
          <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/40 rounded-full animate-progress"
              style={{
                animation: 'progress 8s linear forwards'
              }}
            />
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-progress {
          animation: progress 8s linear forwards;
        }
      `}</style>
    </div>
  )
}