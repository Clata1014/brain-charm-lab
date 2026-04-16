import { useState, forwardRef, useImperativeHandle } from 'react';

const SWITCHES = [
  { id: 'aduanero', label: 'Agente Aduanero Internacional' },
  { id: 'mayorista', label: 'Megamayorista (Central de Abastos)' },
  { id: 'minorista', label: 'Minorista (Tienda de Barrio TAT)' },
  { id: 'web', label: 'Página Web / Venta Directa' },
];

export interface Crisis2Ref { validate: () => boolean; }

const Crisis2Console = forwardRef<Crisis2Ref>((_, ref) => {
  const [state, setState] = useState<Record<string, boolean>>({
    aduanero: false, mayorista: false, minorista: false, web: false,
  });

  useImperativeHandle(ref, () => ({
    validate: () => state.mayorista && state.minorista && !state.aduanero && !state.web,
  }));

  const toggle = (id: string) => setState(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-3">
      {SWITCHES.map(sw => (
        <button
          key={sw.id}
          onClick={() => toggle(sw.id)}
          className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
            state[sw.id]
              ? 'bg-green-500/10 border-green-500/50'
              : 'bg-slate-800 border-slate-700'
          }`}
        >
          <span className={`text-sm font-mono ${state[sw.id] ? 'text-green-300' : 'text-slate-400'}`}>
            {sw.label}
          </span>
          <div className={`w-12 h-6 rounded-full p-0.5 transition-colors ${state[sw.id] ? 'bg-green-500' : 'bg-slate-600'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${state[sw.id] ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
        </button>
      ))}
    </div>
  );
});

Crisis2Console.displayName = 'Crisis2Console';
export default Crisis2Console;
