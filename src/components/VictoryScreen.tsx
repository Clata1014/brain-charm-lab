import { useEffect } from 'react';
import { Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { speak } from '@/lib/speech';

interface VictoryScreenProps {
  teamName: string;
  elapsedSeconds: number;
}

export default function VictoryScreen({ teamName, elapsedSeconds }: VictoryScreenProps) {
  const mins = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const secs = String(elapsedSeconds % 60).padStart(2, '0');

  useEffect(() => {
    speak('Operación logística maestra completada con éxito. Son verdaderos gerentes de operaciones. Felicidades firma consultora ' + teamName);
    const end = Date.now() + 4000;
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [teamName]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <Trophy className="text-yellow-400 mb-4" size={150} />
      <h1 className="font-display text-2xl text-gradient-orange mb-2">OPERACIÓN LOGÍSTICA MAESTRA</h1>
      <p className="text-foreground text-lg mb-6">Los 3 casos resueltos con éxito</p>
      <div className="bg-card border border-border rounded-xl p-6 mb-4">
        <p className="text-muted-foreground text-sm mb-1">Firma Consultora</p>
        <p className="font-display text-xl text-foreground">{teamName}</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-muted-foreground text-sm mb-1">Tiempo Total</p>
        <p className="font-display text-4xl text-orange">{mins}:{secs}</p>
      </div>
    </div>
  );
}
