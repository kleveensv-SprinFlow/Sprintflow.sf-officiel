import React, { useState } from 'react'
import { Handshake, Gift, Eye, X, Copy, Check } from 'lucide-react'
import { usePartnerships } from '../hooks/usePartnerships'
import { LoadingScreen } from './LoadingScreen'

export const PartnershipsList: React.FC = () => {
  const { partnerships, loading } = usePartnerships()
  const [selectedPartnership, setSelectedPartnership] = useState<any>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    
    const successDiv = document.createElement('div')
    successDiv.innerHTML = `📋 Code "${code}" copié!`
    successDiv.style.cssText = `
      position: fixed; top: 20px; right: 20px; background: #10B981; color: white;
      padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    `
    document.body.appendChild(successDiv)
    setTimeout(() => {
      successDiv.remove()
      setCopiedCode(null)
    }, 2000)
  }

  if (loading) {
    return <LoadingScreen message="Chargement des partenariats..." />
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Partenariats</h1>
        <p className="text-gray-600 dark:text-gray-400">Découvrez nos partenaires et leurs offres exclusives</p>
      </div>

      {partnerships.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-lg border border-gray-200 dark:border-gray-700 card-3d">
          <Handshake className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucun partenariat</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Les partenariats seront bientôt disponibles. Revenez plus tard !
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partnerships.map((partnership) => (
            <div key={partnership.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden card-3d-deep">
              {/* Image du partenaire */}
              <div className="relative">
                <button
                  onClick={() => setSelectedPartnership(partnership)}
                  className="w-full h-48 overflow-hidden group"
                >
                  {partnership.photo_url ? (
                    <img 
                      src={partnership.photo_url} 
                      alt={partnership.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900 flex items-center justify-center">
                      <Handshake className="h-16 w-16 text-primary-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
                      <Eye className="h-6 w-6 text-primary-500" />
                    </div>
                  </div>
                </button>
                
                {/* Badge partenaire */}
                <div className="absolute top-3 left-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  🤝 Partenaire
                </div>
              </div>

              {/* Contenu */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {partnership.name}
                </h3>
                
                {partnership.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {partnership.description}
                  </p>
                )}

                {/* Code promo */}
                {partnership.promo_code && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                          🎁 Code promo exclusif
                        </div>
                        <div className="font-mono text-lg font-bold text-green-700 dark:text-green-300">
                          {partnership.promo_code}
                        </div>
                      </div>
                      <button
                        onClick={() => copyPromoCode(partnership.promo_code!)}
                        className="p-2 bg-green-500 hover:bg-green-600 rounded-lg text-white transition-colors shadow-lg button-3d"
                        title="Copier le code"
                      >
                        {copiedCode === partnership.promo_code ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Bouton voir détails */}
                <button
                  onClick={() => setSelectedPartnership(partnership)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg text-white transition-all duration-200 shadow-lg button-3d"
                >
                  <Eye className="h-5 w-5" />
                  <span>Voir les détails</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal détails partenariat */}
      {selectedPartnership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedPartnership.name}
              </h3>
              <button
                onClick={() => setSelectedPartnership(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors button-3d"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Image grande */}
              {selectedPartnership.photo_url && (
                <div className="mb-6">
                  <img 
                    src={selectedPartnership.photo_url} 
                    alt={selectedPartnership.name}
                    className="w-full h-64 object-cover rounded-lg shadow-lg"
                  />
                </div>
              )}

              {/* Description complète */}
              {selectedPartnership.description && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    À propos de ce partenaire
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 card-3d">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {selectedPartnership.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Code promo mis en avant */}
              {selectedPartnership.promo_code && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6 text-center card-3d-deep">
                  <div className="text-green-600 dark:text-green-400 font-medium mb-2 flex items-center justify-center space-x-2">
                    <Gift className="h-5 w-5" />
                    <span>Offre exclusive Sprintflow</span>
                  </div>
                  <div className="font-mono text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                    {selectedPartnership.promo_code}
                  </div>
                  <button
                    onClick={() => copyPromoCode(selectedPartnership.promo_code!)}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition-all duration-200 shadow-lg mx-auto button-3d"
                  >
                    {copiedCode === selectedPartnership.promo_code ? (
                      <>
                        <Check className="h-5 w-5" />
                        <span>Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-5 w-5" />
                        <span>Copier le code</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}