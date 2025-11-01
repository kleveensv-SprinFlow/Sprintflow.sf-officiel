import React from 'react';
import { X, Target, TrendingUp, Info, Dumbbell, Activity } from 'lucide-react';

interface PoidsPuissanceDetailProps {
  data: {
    indice: number;
    scoreCompo: number;
    scoreForce: number;
    categorieScores: Record<string, number>;
    details: {
      poids: number;
      taille: number;
      masseGrasse?: number;
    };
  };
  onClose: () => void;
}

export const PoidsPuissanceDetail: React.FC<PoidsPuissanceDetailProps> = ({ data, onClose }) => {
  const getScoreEvaluation = (score: number) => {
    if (score >= 85) return {
      label: 'Excellent',
      color: 'emerald',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-300 dark:border-emerald-700'
    };
    if (score >= 75) return {
      label: 'Très bon',
      color: 'green',
      textColor: 'text-green-700 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-300 dark:border-green-700'
    };
    if (score >= 65) return {
      label: 'Bon',
      color: 'lime',
      textColor: 'text-lime-700 dark:text-lime-400',
      bgColor: 'bg-lime-50 dark:bg-lime-900/20',
      borderColor: 'border-lime-300 dark:border-lime-700'
    };
    if (score >= 55) return {
      label: 'Moyen',
      color: 'yellow',
      textColor: 'text-yellow-700 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-300 dark:border-yellow-700'
    };
    if (score >= 45) return {
      label: 'À améliorer',
      color: 'orange',
      textColor: 'text-orange-700 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-300 dark:border-orange-700'
    };
    return {
      label: 'Faible',
      color: 'red',
      textColor: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-300 dark:border-red-700'
    };
  };

  const getMasseGrasseAdvice = () => {
    const mg = data.details.masseGrasse;
    if (!mg) {
      const imc = data.details.poids / Math.pow(data.details.taille / 100, 2);
      return {
        title: 'IMC utilisé',
        message: `Votre IMC est de ${imc.toFixed(1)}. Pour une évaluation plus précise, ajoutez vos données de composition corporelle.`,
        advice: 'Utilisez une balance impédancemètre ou faites mesurer vos plis cutanés.',
        textColor: 'text-blue-700 dark:text-blue-300',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-300 dark:border-blue-700',
        iconColor: 'text-blue-600 dark:text-blue-400',
        adviceBg: 'bg-blue-100 dark:bg-blue-900/40',
        adviceText: 'text-blue-900 dark:text-blue-200',
      };
    }

    if (mg <= 10) {
      return {
        title: 'Masse grasse optimale',
        message: `Excellent ! Votre masse grasse de ${mg}% est idéale pour la performance.`,
        advice: 'Maintenez ce niveau. Attention à ne pas descendre trop bas.',
        textColor: 'text-emerald-700 dark:text-emerald-300',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderColor: 'border-emerald-300 dark:border-emerald-700',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        adviceBg: 'bg-emerald-100 dark:bg-emerald-900/40',
        adviceText: 'text-emerald-900 dark:text-emerald-200',
      };
    }

    if (mg <= 14) {
      return {
        title: 'Masse grasse très bonne',
        message: `Très bien ! Votre masse grasse de ${mg}% est excellente.`,
        advice: 'Continuez ainsi. Pour optimiser : visez 10-12% avec déficit léger (200-300 kcal/j).',
        textColor: 'text-green-700 dark:text-green-300',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-300 dark:border-green-700',
        iconColor: 'text-green-600 dark:text-green-400',
        adviceBg: 'bg-green-100 dark:bg-green-900/40',
        adviceText: 'text-green-900 dark:text-green-200',
      };
    }

    if (mg <= 18) {
      return {
        title: 'Masse grasse correcte',
        message: `Votre masse grasse de ${mg}% est acceptable mais optimisable.`,
        advice: 'Objectif 12-14%. Déficit modéré (300-400 kcal/j), protéines élevées (2g/kg).',
        textColor: 'text-lime-700 dark:text-lime-300',
        bgColor: 'bg-lime-50 dark:bg-lime-900/20',
        borderColor: 'border-lime-300 dark:border-lime-700',
        iconColor: 'text-lime-600 dark:text-lime-400',
        adviceBg: 'bg-lime-100 dark:bg-lime-900/40',
        adviceText: 'text-lime-900 dark:text-lime-200',
      };
    }

    if (mg <= 22) {
      return {
        title: 'Masse grasse à optimiser',
        message: `Votre masse grasse de ${mg}% impacte vos performances.`,
        advice: 'Objectif 14-16%. Déficit 400-500 kcal/j, cardio 2-3x/sem, protéines 2-2.2g/kg.',
        textColor: 'text-yellow-700 dark:text-yellow-300',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-300 dark:border-yellow-700',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        adviceBg: 'bg-yellow-100 dark:bg-yellow-900/40',
        adviceText: 'text-yellow-900 dark:text-yellow-200',
      };
    }

    return {
      title: 'Masse grasse élevée',
      message: `Votre masse grasse de ${mg}% affecte significativement vos performances.`,
      advice: 'Objectif -0.5 à 1%/mois. Déficit 500-600 kcal/j, protéines 2.2g/kg, renfo + cardio.',
      textColor: 'text-orange-700 dark:text-orange-300',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-300 dark:border-orange-700',
      iconColor: 'text-orange-600 dark:text-orange-400',
      adviceBg: 'bg-orange-100 dark:bg-orange-900/40',
      adviceText: 'text-orange-900 dark:text-orange-200',
    };
  };

  const getCategorieObjectives = (categorie: string, currentScore: number) => {
    const objetcifs: Record<string, any> = {
      halterophilie: {
        nom: 'Haltérophilie',
        exercices: [
          { nom: 'Épaulé', inter: '1.0x', avance: '1.3x', elite: '1.6x' },
          { nom: 'Arraché', inter: '0.8x', avance: '1.05x', elite: '1.35x' },
        ],
        conseil: currentScore < 60
          ? 'Focus technique avant charge. 3-4 séances/semaine avec coach.'
          : currentScore < 75
          ? 'Augmentez +2.5kg/semaine. Travaillez variantes (hang, blocks).'
          : 'Excellent ! Maintenez 2-3 séances/semaine, perfectionnez technique.',
      },
      muscu_bas: {
        nom: 'Muscu Bas',
        exercices: [
          { nom: 'Squat', inter: '1.5x', avance: '1.85x', elite: '2.25x' },
          { nom: 'SDT', inter: '1.75x', avance: '2.15x', elite: '2.6x' },
        ],
        conseil: currentScore < 60
          ? 'Fondations 2x/sem, volume 4x8-10 avec technique parfaite.'
          : currentScore < 75
          ? 'Combinez force (4x4-6) et hypertrophie (3x8-12). Ajoutez unilatéral.'
          : 'Force impressionnante ! Variez cycles (force, puissance, hypertrophie).',
      },
      muscu_haut: {
        nom: 'Muscu Haut',
        exercices: [
          { nom: 'Dév. Couché', inter: '1.0x', avance: '1.3x', elite: '1.65x' },
          { nom: 'Traction', inter: '1.0x', avance: '1.25x', elite: '1.5x' },
        ],
        conseil: currentScore < 60
          ? 'Base musculaire 2x/sem avec composés (DC, tractions, développé).'
          : currentScore < 75
          ? 'Intensifiez 5x5 + exercices assistance.'
          : 'Excellent haut du corps ! Maintenez et travaillez déséquilibres.',
      },
      unilateral: {
        nom: 'Unilatéral',
        exercices: [
          { nom: 'Fente Bulgare', inter: '0.85x', avance: '1.15x', elite: '1.45x' },
          { nom: 'Pistol Squat', inter: '0.6x', avance: '0.85x', elite: '1.1x' },
        ],
        conseil: currentScore < 60
          ? 'Équilibre et stabilité 2x/sem, charges modérées, contrôle parfait.'
          : currentScore < 75
          ? 'Augmentez charges progressivement. Excellents pour déséquilibres.'
          : 'Très bon contrôle ! Continuez pour stabilité et prévention blessures.',
      },
    };

    return objetcifs[categorie] || null;
  };

  const globalAdvice = () => {
    const { indice, scoreCompo, scoreForce } = data;

    if (scoreCompo < 50 && scoreForce < 50) {
      return 'Priorité double : composition corporelle ET force. Commencez par nutrition + programme 3x/sem.';
    }

    if (scoreCompo < 50) {
      return 'Force bonne, mais composition limite le ratio. Focus nutrition pour perdre gras en maintenant force.';
    }

    if (scoreForce < 50) {
      return 'Excellente composition ! Développez force avec programme 3-4x/sem (squat, épaulé, SDT...).';
    }

    if (indice >= 75) {
      return 'Excellent rapport ! Maintenez et travaillez puissance spécifique (sprints, pliométrie).';
    }

    return 'Bon équilibre. Continuez à progresser sur catégories faibles pour améliorer score global.';
  };

  const masseGrasseInfo = getMasseGrasseAdvice();
  const globalEval = getScoreEvaluation(data.indice);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md dark:backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analyse Poids/Puissance</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Conseils et objectifs personnalisés</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className={`${globalEval.bgColor} border-2 ${globalEval.borderColor} rounded-lg p-6`}>
            <div className="flex items-center justify-between mb-4 gap-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Score Global</h3>
              <span className={`text-3xl font-bold ${globalEval.textColor}`}>{data.indice}/100</span>
            </div>
            <p className={`text-lg font-semibold ${globalEval.textColor} mb-2`}>{globalEval.label}</p>
            <p className="text-gray-700 dark:text-gray-300">{globalAdvice()}</p>
          </div>

          <div className={`${masseGrasseInfo.bgColor} border-2 ${masseGrasseInfo.borderColor} rounded-lg p-6`}>
            <div className="flex items-start gap-3 mb-4">
              <Info className={`w-6 h-6 ${masseGrasseInfo.iconColor} flex-shrink-0 mt-1`} />
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-bold ${masseGrasseInfo.textColor} mb-2`}>
                  {masseGrasseInfo.title}
                </h3>
                <p className={`${masseGrasseInfo.textColor} mb-3`}>
                  {masseGrasseInfo.message}
                </p>
                <div className={`${masseGrasseInfo.adviceBg} rounded-lg p-4`}>
                  <p className={`text-sm font-medium ${masseGrasseInfo.adviceText}`}>
                    💡 Conseil : {masseGrasseInfo.advice}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Poids</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{data.details.poids} kg</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Taille</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{data.details.taille} cm</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Masse Grasse</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {data.details.masseGrasse ? `${data.details.masseGrasse}%` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Objectifs par Catégorie
            </h3>

            {Object.entries(data.categorieScores).map(([cat, score]) => {
              const obj = getCategorieObjectives(cat, score);
              if (!obj) return null;

              const evaluation = getScoreEvaluation(score);

              return (
                <div key={cat} className={`${evaluation.bgColor} border-2 ${evaluation.borderColor} rounded-lg p-6`}>
                  <div className="flex items-center justify-between mb-4 gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Dumbbell className={`w-6 h-6 ${evaluation.textColor} flex-shrink-0`} />
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">{obj.nom}</h4>
                    </div>
                    <span className={`text-3xl font-bold ${evaluation.textColor} flex-shrink-0`}>{Math.round(score)}/100</span>
                  </div>

                  <div className="mb-4">
                    <p className={`font-semibold ${evaluation.textColor} mb-2`}>{evaluation.label}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{obj.conseil}</p>
                  </div>

                  <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Objectifs (ratio charge/poids) :
                    </p>
                    <div className="space-y-2">
                      {obj.exercices.map((ex: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between gap-2 text-sm flex-wrap sm:flex-nowrap">
                          <span className="text-gray-700 dark:text-gray-300 font-medium truncate min-w-[100px]">{ex.nom}</span>
                          <div className="flex gap-2 sm:gap-3 text-xs flex-shrink-0">
                            <span className="text-yellow-600 dark:text-yellow-400 whitespace-nowrap">Int: {ex.inter}</span>
                            <span className="text-green-600 dark:text-green-400 whitespace-nowrap">Avc: {ex.avance}</span>
                            <span className="text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Élt: {ex.elite}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {Object.keys(data.categorieScores).length === 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-6 text-center">
              <Dumbbell className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <p className="text-blue-900 dark:text-blue-200 font-medium mb-2">Aucune catégorie évaluée</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Ajoutez des records de musculation pour voir vos objectifs personnalisés !
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
