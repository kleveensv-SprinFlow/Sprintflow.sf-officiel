import React from 'react';
import Button from '../components/ui/Button';
import PerformanceCard from '../components/ui/PerformanceCard';
import { H1, H2, H3, P, Label, MicroText } from '../components/ui/Typography';

const Styleguide: React.FC = () => {
  return (
    <div className="bg-light-background dark:bg-dark-background min-h-screen">
      <div className="container mx-auto p-8 space-y-12">
        
        {/* Section Titres */}
        <section>
          <H1>Styleguide</H1>
          <P className="mt-2">Ce guide présente les composants de base de l'UI de SprintFlow.</P>
        </section>

        {/* Section Couleurs */}
        <section className="space-y-4">
          <H2>Couleurs</H2>
          <div className="flex flex-wrap gap-4">
            <div className="p-4 rounded-lg bg-accent text-white">Accent: #f59e0b / #fcd34d</div>
            <div className="p-4 rounded-lg bg-light-card border">Light Card</div>
            <div className="p-4 rounded-lg bg-dark-card border text-dark-text">Dark Card</div>
            <div className="p-4 rounded-lg bg-light-background border">Light BG</div>
            <div className="p-4 rounded-lg bg-dark-background text-dark-text">Dark BG</div>
          </div>
        </section>

        {/* Section Typographie */}
        <section className="space-y-2">
          <H2>Typographie</H2>
          <H1>Titre H1 (Manrope Bold)</H1>
          <H2>Titre H2 (Manrope Semi-Bold)</H2>
          <H3>Titre H3 (Manrope Medium)</H3>
          <P>Paragraphe (Manrope Regular). Lorem ipsum dolor sit amet, consectetur adipiscing elit.</P>
          <Label>Label (Manrope Medium/Light)</Label>
          <br />
          <MicroText>Micro texte (Manrope Light)</MicroText>
        </section>

        {/* Section Boutons */}
        <section className="space-y-4">
          <H2>Boutons</H2>
          <div className="flex gap-4">
            <Button onClick={() => alert('Click Primary')}>Bouton Primaire</Button>
            <Button variant="secondary" onClick={() => alert('Click Secondary')}>Bouton Secondaire</Button>
          </div>
        </section>

        {/* Section Cartes */}
        <section className="space-y-4">
          <H2>Cartes</H2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Dark Mode Preview */}
            <div className="dark p-8 rounded-lg bg-dark-background">
              <H3 className="text-dark-title mb-4">Aperçu en mode sombre</H3>
              <PerformanceCard vitesse="9.58" sauts={12} onAnalyze={() => {}} />
            </div>

            {/* Light Mode Preview */}
            <div className="p-8 rounded-lg bg-light-background">
              <H3 className="mb-4">Aperçu en mode clair</H3>
              <PerformanceCard vitesse="9.58" sauts={12} onAnalyze={() => {}} />
            </div>

          </div>
        </section>
      </div>
    </div>
  );
};

export default Styleguide;
