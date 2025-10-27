import React from 'react';
import { X, Target, TrendingUp, AlertCircle, CheckCircle, Zap, Activity } from 'lucide-react';

interface PerformanceIndexDetailProps {
  indicePerf: any;
  onClose: () => void;
}

export function PerformanceIndexDetail({ indicePerf, onClose }: PerformanceIndexDetailProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (score >= 50) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  const generateAdvice = () => {
    const advice: any[] = [];
    const composition = indicePerf.mini_scores?.composition || 0;
    const force = indicePerf.mini_scores?.force || 0;
    const compositionDetails = indicePerf.details?.composition;
    const forceDetails = indicePerf.details?.force;

    if (composition < 70 && compositionDetails?.masse_grasse_pct) {
      const mg = compositionDetails.masse_grasse_pct;
      if (mg > 16) {
        advice.push({
          type: 'warning',
          title: 'Composition Corporelle à Améliorer',
          message: `Votre masse grasse est à ${mg}%. L'objectif pour un sprinter est de 8-14%. Perdre 2-3% de masse grasse améliorerait significativement votre rapport poids/puissance.`,
          priority: 1,
          actions: [
            'Créer un léger déficit calorique (200-300 kcal/jour)',
            'Maintenir un apport protéique élevé (2g/kg)',
            'Privilégier les exercices de force',
            'Éviter les régimes trop restrictifs'
          ]
        });
      } else if (mg < 6) {
        advice.push({
          type: 'warning',
          title: 'Masse Grasse Trop Basse',
          message: `Votre masse grasse est à ${mg}%. C'est trop bas et peut affecter vos performances et votre santé. L'objectif est 8-14%.`,
          priority: 1,
          actions: [
            'Augmenter légèrement l\'apport calorique',
            'Consulter un nutritionniste sportif',
            'Surveiller votre récupération'
          ]
        });
      }
    } else if (composition >= 70 && composition < 85) {
      advice.push({
        type: 'success',
        title: 'Bonne Composition Corporelle',
        message: `Votre composition est dans la bonne zone. Une légère optimisation pourrait encore améliorer vos performances.`,
        priority: 3,
        actions: [
          'Maintenir votre masse musculaire actuelle',
          'Affiner progressivement si besoin (-1% par mois max)'
        ]
      });
    } else if (composition >= 85) {
      advice.push({
        type: 'success',
        title: 'Composition Corporelle Optimale',
        message: 'Votre composition corporelle est excellente pour un sprinteur. Maintenez cette qualité physique.',
        priority: 3,
        actions: [
          'Maintenir votre routine nutritionnelle',
          'Surveiller régulièrement votre composition'
        ]
      });
    }

    if (force < 60) {
      advice.push({
        type: 'error',
        title: 'Force à Développer en Priorité',
        message: 'Votre niveau de force est le principal facteur limitant. La force est la base de la vitesse en sprint.',
        priority: 1,
        actions: [
          'Augmenter la fréquence de musculation (3-4x/semaine)',
          'Focus sur Squat, SDT, Power Clean',
          'Charges lourdes (80-90% 1RM) en 3-5 reps',
          'Progression linéaire (+2.5kg par semaine)'
        ],
        objectives: generateForceObjectives(forceDetails)
      });
    } else if (force < 75) {
      advice.push({
        type: 'warning',
        title: 'Force Correcte, Marge de Progression',
        message: 'Votre niveau de force est correct mais peut encore progresser significativement.',
        priority: 2,
        actions: [
          'Continuer la progression sur les exercices de base',
          'Ajouter des exercices de puissance (sauts, pliométrie)',
          'Varier les méthodes (clusters, contraste)'
        ],
        objectives: generateForceObjectives(forceDetails)
      });
    } else if (force < 85) {
      advice.push({
        type: 'success',
        title: 'Bon Niveau de Force',
        message: 'Votre force est solide. Focus sur le maintien et la qualité d\'exécution.',
        priority: 3,
        actions: [
          'Maintenir le niveau actuel',
          'Optimiser la technique',
          'Travailler la puissance spécifique'
        ],
        objectives: generateForceObjectives(forceDetails)
      });
    } else {
      advice.push({
        type: 'success',
        title: 'Excellent Niveau de Force',
        message: 'Votre force est au niveau élite. Concentration sur le transfert en vitesse.',
        priority: 3,
        actions: [
          'Maintien (1-2 séances/semaine)',
          'Accent sur la pliométrie et la technique de sprint',
          'Travail de la vitesse gestuelle'
        ]
      });
    }

    if (indicePerf.age && indicePerf.age_modificateur) {
      if (indicePerf.age < 20) {
        advice.push({
          type: 'info',
          title: 'Âge et Développement',
          message: 'Vous êtes dans une période de développement optimal. Focus sur la technique et la construction de bases solides.',
          priority: 4,
          actions: [
            'Privilégier la qualité à la quantité',
            'Développer les fondamentaux',
            'Éviter la sur-spécialisation'
          ]
        });
      } else if (indicePerf.age > 30) {
        advice.push({
          type: 'info',
          title: 'Âge et Performance',
          message: 'L\'expérience compense la légère baisse physiologique. Focus sur la récupération et l\'efficience.',
          priority: 4,
          actions: [
            'Optimiser la récupération',
            'Qualité plutôt que volume',
            'Prévention des blessures'
          ]
        });
      }
    }

    return advice.sort((a, b) => a.priority - b.priority);
  };

  const generateForceObjectives = (forceDetails: any) => {
    if (!forceDetails?.evaluations || forceDetails.evaluations.length === 0) {
      return null;
    }

    const objectives: any[] = [];

    forceDetails.evaluations.forEach((evaluation: any) => {
      if (evaluation.score < 75) {
        const exerciceDB = {
          'Squat Complet': { bon: 1.7, tres_bon: 2.0, excellent: 2.5 },
          'Power Clean': { bon: 1.0, tres_bon: 1.3, excellent: 1.5 },
          'Soulevé de Terre': { bon: 2.0, tres_bon: 2.3, excellent: 2.8 },
          'Hip Thrust': { bon: 1.7, tres_bon: 2.0, excellent: 2.5 },
          'Front Squat': { bon: 1.4, tres_bon: 1.7, excellent: 2.0 },
        };

        const matchedExercice = Object.keys(exerciceDB).find(key =>
          evaluation.exercice.toLowerCase().includes(key.toLowerCase())
        );

        if (matchedExercice) {
          const refs = exerciceDB[matchedExercice as keyof typeof exerciceDB];
          const poidsActuel = evaluation.poids;
          const ratioActuel = evaluation.ratio;
          const poidsCorporel = poidsActuel / ratioActuel;

          const objectifTresBon = Math.round(refs.tres_bon * poidsCorporel);
          const objectifExcellent = Math.round(refs.excellent * poidsCorporel);

          objectives.push({
            exercice: evaluation.exercice,
            actuel: `${poidsActuel}kg (ratio ${ratioActuel})`,
            objectifCourt: `${objectifTresBon}kg (ratio ${refs.tres_bon})`,
            objectifLong: `${objectifExcellent}kg (ratio ${refs.excellent})`,
            progression: `+${objectifTresBon - poidsActuel}kg`,
            score: evaluation.score
          });
        }
      }
    });

    return objectives;
  };

  const adviceList = generateAdvice();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Indice de Performance</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Analyse détaillée et objectifs personnalisés</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className={`${getScoreBgColor(indicePerf.score)} rounded-lg p-6 border-2`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Score Global</h3>
              <div className={`text-5xl font-bold ${getScoreColor(indicePerf.score)}`}>
                {indicePerf.score}/100
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Composition (35%)</span>
                <div className="font-bold text-gray-900 dark:text-white">{indicePerf.mini_scores?.composition}/100</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Force (65%)</span>
                <div className="font-bold text-gray-900 dark:text-white">{indicePerf.mini_scores?.force}/100</div>
              </div>
              {indicePerf.age && (
                <>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Âge</span>
                    <div className="font-bold text-gray-900 dark:text-white">{indicePerf.age} ans</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Modificateur</span>
                    <div className="font-bold text-gray-900 dark:text-white">×{indicePerf.age_modificateur}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {indicePerf.details?.force?.evaluations && indicePerf.details.force.evaluations.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Détail des Exercices
              </h3>
              <div className="space-y-3">
                {indicePerf.details.force.evaluations.map((evaluation: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{evaluation.exercice}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{evaluation.categorie}</div>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(evaluation.score)}`}>
                        {evaluation.score}/100
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <div>Poids: <span className="font-medium text-gray-900 dark:text-white">{evaluation.poids}kg</span></div>
                      <div>Ratio: <span className="font-medium text-gray-900 dark:text-white">{evaluation.ratio}x</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5" />
              Conseils Personnalisés
            </h3>
            {adviceList.map((advice, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-5 border-2 ${
                  advice.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' :
                  advice.type === 'warning' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700' :
                  advice.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' :
                  'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  {advice.type === 'error' ? <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" /> :
                   advice.type === 'warning' ? <TrendingUp className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" /> :
                   advice.type === 'success' ? <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" /> :
                   <Target className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">{advice.title}</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{advice.message}</p>
                    <div className="space-y-2">
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">Actions recommandées :</div>
                      <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                        {advice.actions.map((action: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-gray-400 mt-1">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {advice.objectives && advice.objectives.length > 0 && (
                      <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                        <div className="font-semibold text-sm text-gray-900 dark:text-white mb-2">🎯 Objectifs chiffrés :</div>
                        <div className="space-y-2">
                          {advice.objectives.map((obj: any, i: number) => (
                            <div key={i} className="text-xs">
                              <div className="font-medium text-gray-900 dark:text-white">{obj.exercice}</div>
                              <div className="grid grid-cols-3 gap-2 mt-1 text-gray-600 dark:text-gray-400">
                                <div>Actuel: <span className="font-medium">{obj.actuel}</span></div>
                                <div>Court terme: <span className="font-medium text-blue-600">{obj.objectifCourt}</span></div>
                                <div>Long terme: <span className="font-medium text-green-600">{obj.objectifLong}</span></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
