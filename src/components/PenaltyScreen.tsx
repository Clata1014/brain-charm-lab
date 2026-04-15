import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface PenaltyScreenProps {
  onComplete: () => void;
  message?: string;
}

export default function PenaltyScreen({ onComplete, message }: PenaltyScreenProps) {
  const [remaining, setRemaining] = useState(60);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(id);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-penalty flex flex-col items-center justify-center p-6 text-center animate-shake">
      <img
        src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80"
        alt="Accidente logístico"
        className="w-48 h-32 object-cover rounded-xl mb-6 border-2 border-destructive/50"
      />
      <AlertTriangle className="text-destructive-foreground mb-4" size={100} />
      <h1 className="font-display text-2xl text-destructive-foreground mb-3">
        🚨 ERROR GERENCIAL GRAVE 🚨
      </h1>
      <p className="text-destructive-foreground/90 text-sm mb-6 max-w-sm">
        {message || 'Ignoraste el análisis del caso y generaste sobrecostos operativos. Asume la penalidad.'}
      </p>
      <div className="font-display text-7xl text-destructive-foreground glow-orange-intense">
        {remaining}s
      </div>
      <p className="text-destructive-foreground/60 mt-4 text-sm">Sistema bloqueado hasta llegar a cero</p>
      <button
        onClick={onComplete}
        className="fixed bottom-0 right-0 w-24 h-24 bg-transparent z-[9999] opacity-0 cursor-default focus:outline-none outline-none"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
