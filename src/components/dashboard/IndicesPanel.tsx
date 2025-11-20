import React from 'react';
import { motion } from 'framer-motion';

interface GaugeProps {
  value: number;
  label: string;
  /**
   * Couleur forcée du gauge (sinon calcul auto en fonction de la valeur).
   */
  color?: string;
  /**
   * Texte explicatif sous le gauge.
   */
  description?: string;
  /**
   * Unité affichée à côté de la valeur (ex: "%").
   */
  unit?: string;
  /**
   * Variation par rapport à la dernière mesure (ex: +3, -2).
   * Si non fourni, l'indicateur de tendance n'est pas affiché.
   */
  trend?: number;
}

const clampValue = (value: number) => Math.max(0, Math.min(100, value));

const getAutoColor = (value: number) => {
  if (value < 40) return '#EF4444'; // rouge
  if (value < 70) return '#F97316'; // orange
  return '#22C55E'; // vert
};

const getStatusLabel = (value: number) => {
  if (value < 40) return 'À travailler';
  if (value < 70) return 'Correct';
  return 'Très bon';
};

const Gauge: React.FC<GaugeProps> = ({
  value,
  label,
  color,
  description,
  unit = '%',
  trend,
}) => {
  const normalized = clampValue(value);
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - normalized / 100);
  const currentColor = color ?? getAutoColor(normalized);
  const statusLabel = getStatusLabel(normalized);

  const hasTrend = typeof trend === 'number' && !Number.isNaN(trend);
  const trendPositive = (trend ?? 0) > 0;
  const trendNeutral = (trend ?? 0) === 0;

  return (
    <div className="flex-1 bg-sprint-light-card dark:bg-sprint-dark-card p-4 rounded-2xl shadow-md flex flex-col">
      {/* Titre + tendance */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-sprint-light-text-primary dark:text-sprint-dark-text-primary">
          {label}
        </h3>

        {hasTrend && (
          <div
            className={[
              'flex items-center gap-1 text-xs font-medium',
              trendNeutral
                ? 'text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary'
                : trendPositive
                ? 'text-emerald-500'
                : 'text-rose-500',
            ].join(' ')}
          >
            <span>
              {trendPositive ? '↑' : trendNeutral ? '→' : '↓'}
            </span>
            <span>
              {trend > 0 ? `+${trend}` : trend}
              {unit}
            </span>
          </div>
        )}
      </div>

      {/* Gauge circulaire */}
      <div
        className="relative w-full flex justify-center items-center py-3"
        role="img"
        aria-label={`${label}: ${Math.round(normalized)}${unit} (${statusLabel})`}
      >
        <svg width={120} height={120} className="transform -rotate-90">
          {/* Cercle de fond */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="10"
            fill="transparent"
          />

          {/* Progression animée */}
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            stroke={currentColor}
            strokeWidth="10"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        </svg>

        {/* Valeur centrale + statut */}
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-extrabold text-sprint-light-text-primary dark:text-sprint-dark-text-primary leading-tight">
            {Math.round(normalized)}
            {unit && (
              <span className="ml-0.5 text-sm font-semibold align-top">
                {unit}
              </span>
            )}
          </span>
          <span className="text-[11px] font-medium text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary mt-1">
            {statusLabel}
          </span>
        </div>

        {/* Repères 0 / 100 */}
        <span className="absolute left-4 bottom-0 text-[10px] text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary">
          0
        </span>
        <span className="absolute right-4 bottom-0 text-[10px] text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary">
          100
        </span>
      </div>

      {/* Description de l'indice */}
      {description && (
        <p className="mt-2 text-xs text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary leading-snug">
          {description}
        </p>
      )}
    </div>
  );
};

interface IndicesPanelProps {
  formIndex?: number;
  weightPowerRatio?: number;
  /**
   * Variation de l'indice de forme (en points %).
   */
  formTrend?: number;
  /**
   * Variation du rapport poids/puissance (en points %).
   */
  weightPowerTrend?: number;
}

/**
 * Panneau qui affiche les deux indices côte à côte.
 */
const IndicesPanel: React.FC<IndicesPanelProps> = ({
  formIndex = 0,
  weightPowerRatio = 0,
  formTrend,
  weightPowerTrend,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Gauge
        value={formIndex}
        label="Indice de forme"
        unit="%"
        trend={formTrend}
        description="Synthèse de ton état de forme actuel selon tes dernières séances et ta charge globale."
      />

      <Gauge
        value={weightPowerRatio}
        label="Rapport poids/puissance"
        unit="%"
        trend={weightPowerTrend}
        description="Indique comment ton poids actuel impacte ta capacité à produire de la puissance."
      />
    </div>
  );
};

export default IndicesPanel;
