import React from 'react';
import Card from './Card.tsx';
import Button from './Button';
import { H2, Label, P } from './Typography';

type PerformanceCardProps = {
  vitesse: string;
  sauts: number;
  onAnalyze: () => void;
};

const PerformanceCard: React.FC<PerformanceCardProps> = ({ vitesse, sauts, onAnalyze }) => {
  return (
    <Card className="w-full max-w-xs">
      <div className="flex flex-col space-y-4">
        <H2 as="h2" className="font-semibold">Performance</H2>
        
        <div className="space-y-2">
          <div>
            <Label>Vitesse</Label>
            <P className="font-bold text-h1">{vitesse}</P>
          </div>
          <div>
            <Label>Sauts</Label>
            <P className="font-bold text-h1">{sauts}</P>
          </div>
        </div>

        <Button onClick={onAnalyze} className="w-full mt-4 py-3">
          Analyser
        </Button>
      </div>
    </Card>
  );
};

export default PerformanceCard;