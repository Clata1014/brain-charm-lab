import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { initSpeech, speak } from '@/lib/speech';
import Timer from './Timer';
import PenaltyScreen from './PenaltyScreen';
import VictoryScreen from './VictoryScreen';
import StartScreen from './StartScreen';
import ChannelQuestion from './ChannelQuestion';
import ChannelBuilder from './ChannelBuilder';
import PinEntry from './PinEntry';

type Phase =
  | 'start'
  | 'c1_channel'
  | 'c1_pins'
  | 'c2_channel'
  | 'c2_pins'
  | 'c3_channel'
  | 'c3_pins'
  | 'c4_builder'
  | 'victory';

export default function SimuladorApp() {
  const [teamName, setTeamName] = useState('');
  const [phase, setPhase] = useState<Phase>('start');
  const [startTime, setStartTime] = useState(0);
  const [showPenalty, setShowPenalty] = useState(false);
  const [penaltyVoice, setPenaltyVoice] = useState('');
  const [returnPhase, setReturnPhase] = useState<Phase>('start');

  const handleStart = () => {
    if (!teamName.trim()) return;
    initSpeech();
    setStartTime(Date.now());
    setPhase('c1_channel');
    setTimeout(() => {
      speak('Bienvenidos, firma consultora ' + teamName + '. El cronómetro ha iniciado. Analicen cada caso como verdaderos gerentes antes de actuar.');
    }, 200);
  };

  const triggerPenalty = useCallback((voice: string, returnTo: Phase) => {
    setPenaltyVoice(voice);
    setReturnPhase(returnTo);
    speak(voice);
    setShowPenalty(true);
  }, []);

  const handlePenaltyComplete = useCallback(() => {
    setShowPenalty(false);
    setPhase(returnPhase);
  }, [returnPhase]);

  if (showPenalty) {
    return <PenaltyScreen onComplete={handlePenaltyComplete} message={penaltyVoice} />;
  }

  if (phase === 'victory') {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return <VictoryScreen teamName={teamName} elapsedSeconds={elapsed} />;
  }

  if (phase === 'start') {
    return (
      <StartScreen
        teamName={teamName}
        onTeamNameChange={setTeamName}
        onStart={handleStart}
      />
    );
  }

  const phaseOrder: Phase[] = ['start', 'c1_channel', 'c1_pins', 'c2_channel', 'c2_pins', 'c3_channel', 'c3_pins', 'c4_builder', 'victory'];
  const phaseConfig: Record<string, number> = {
    c1_channel: 1, c1_pins: 2,
    c2_channel: 3, c2_pins: 4,
    c3_channel: 5, c3_pins: 6,
    c4_builder: 7,
  };
  const progress = ((phaseConfig[phase] || 0) / 7) * 100;

  const goBack = () => {
    const idx = phaseOrder.indexOf(phase);
    if (idx > 1) setPhase(phaseOrder[idx - 1]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={goBack} className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={18} />
          </button>
          <span className="text-xs text-muted-foreground font-medium truncate max-w-[120px]">{teamName}</span>
        </div>
        <Timer startTime={startTime} />
      </header>

      <div className="h-1 bg-secondary">
        <div className="h-full bg-orange transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <main className="flex-1 flex flex-col p-4 max-w-lg mx-auto w-full">
        {phase === 'c1_channel' && (
          <ChannelQuestion
            icon="truck"
            nativeVideoUrl="/videos/Canal_Logistico_con_Intermediario.mp4"
            title="📦 CASO 1: CONSUMO MASIVO — POSTOBÓN"
            description="Las tractomulas de Postobón salen de la fábrica con millones de gaseosas. El objetivo es llegar a miles de tienditas de barrio, pero las tractomulas gigantes NO CABEN por esas calles estrechas."
            question="Para evitar un caos urbano, la fábrica está OBLIGADA a entregarle la mercancía a una bodega inmensa (el Mayorista). Allí dividen la carga en furgones pequeños que sí entran a los barrios. Al existir este gran intermediario (el Mayorista) en la mitad de la cadena para fraccionar el volumen, ¿qué tipo de canal logístico estamos usando?"
            correctAnswer="Canal Largo"
            options={['Canal Directo', 'Canal Corto', 'Canal Largo']}
            successVoice="¡Excelente análisis gerencial! Al obligarnos a usar un Mayorista para fraccionar la carga, es un Canal Largo. Levántate y valida tu ruta."
            errorVoice="¡Error logístico garrafal! Si usas el canal directo o corto, intentarías meter una tractomula gigante al barrio. Acabas de destruir los cables de la luz por no usar a un mayorista. Operación detenida por penalidad."
            onSuccess={() => setPhase('c1_pins')}
            onError={() => triggerPenalty('¡Error logístico garrafal! Si usas el canal directo o corto, intentarías meter una tractomula gigante al barrio. Acabas de destruir los cables de la luz por no usar a un mayorista. Operación detenida por penalidad.', 'c1_channel')}
          />
        )}

        {phase === 'c1_pins' && (
          <PinEntry
            title="📦 CASO 1: POSTOBÓN"
            subtitle="Ruta Física — Canal Largo"
            pinSequence={[
              { pin: '10', voice: 'Fábrica despachada. Tractomulas cargadas y en la vía. Avanza al siguiente punto.' },
              { pin: '20', voice: 'Mayorista alcanzado. Carga dividida y estibada correctamente en furgones pequeños. Avanza.' },
              { pin: '30', voice: 'Tienda de barrio abastecida usando la logística Tienda a Tienda. Avanza.' },
              { pin: '60', voice: '¡Canal Largo completado con éxito! Excelente gestión gerencial.' },
            ]}
            errorVoice="¡Error lógico! Te saltaste un eslabón de la cadena. En el Canal Largo, la carga debe pasar por el Mayorista antes de llegar a la tienda. Sistema bloqueado."
            onComplete={() => setPhase('c2_channel')}
            onError={(voice) => triggerPenalty(voice, 'c1_pins')}
          />
        )}

        {phase === 'c2_channel' && (
          <ChannelQuestion
            icon="store"
            nativeVideoUrl="/videos/Optimizacion_Logistica_Hard_Discount.mp4"
            title="🛒 CASO 2: HARD DISCOUNT — D1 / ARA"
            description="Para competir con precios bajos, debemos optimizar la cadena. Decidimos vender los productos directamente desde su caja de cartón corrugado y eliminar comisiones de terceros."
            question="Al eliminar al distribuidor mayorista y conectar la fábrica directo con el supermercado, ¿qué modelo logístico estamos aplicando?"
            correctAnswer="Canal Corto"
            options={['Canal Directo', 'Canal Corto', 'Canal Largo']}
            successVoice="Correcto. Canal Corto. Eliminan al mayorista para reducir costos y transferir el ahorro al consumidor. Ve a los carteles y demuestra la ruta."
            errorVoice="¡Error Gerencial! D1 no vende directo a las casas desde la fábrica (Directo), ni usa mayoristas (Largo). Usa un Canal Corto porque el supermercado minorista es el único intermediario."
            onSuccess={() => setPhase('c2_pins')}
            onError={() => triggerPenalty('¡Error Gerencial! D1 no vende directo a las casas desde la fábrica (Directo), ni usa mayoristas (Largo). Usa un Canal Corto porque el supermercado minorista es el único intermediario.', 'c2_channel')}
          />
        )}

        {phase === 'c2_pins' && (
          <PinEntry
            title="🛒 CASO 2: HARD DISCOUNT"
            subtitle="Ruta Física — Canal Corto"
            pinSequence={[
              { pin: '10', hint: '📍 Misión 1: Inicia en manufactura (FÁBRICA)', voice: 'Fábrica despachada. Carga directa sin intermediarios. Avanza.' },
              { pin: '40', hint: '📍 Misión 2: Ve directo al supermercado minorista (HARD DISCOUNT D1/ARA)', voice: 'Supermercado D1 abastecido. Producto en estantería desde la caja corrugada. Avanza.' },
              { pin: '60', hint: '📍 Misión 3: Entrega final (CLIENTE)', voice: '¡Canal Corto completado con éxito! Máxima eficiencia en costos.' },
            ]}
            errorVoice="¡Error! Agregaste un intermediario innecesario. El Hard Discount conecta fábrica directo con supermercado. No usan mayoristas ni tiendas TAT. Sistema bloqueado."
            onComplete={() => setPhase('c3_channel')}
            onError={(voice) => triggerPenalty(voice, 'c2_pins')}
          />
        )}

        {phase === 'c3_channel' && (
          <ChannelQuestion
            icon="bike"
            nativeVideoUrl="/videos/Video_De_Entrega_De_Moto.mp4"
            title="🛵 CASO 3: ENTREGAS EN 15 MIN — RAPPI TURBO"
            description="El cliente exige inmediatez. El reto es el alto costo urbano: el trayecto final desde la bodega hasta la puerta del cliente consume hasta el 53% del costo total logístico."
            question="Este modelo de hiper-proximidad que despacha desde Dark Stores cerradas al público se conoce como:"
            correctAnswer="Quick Commerce"
            options={['Canal Corto', 'Canal Largo', 'Quick Commerce']}
            successVoice="Correcto. Quick Commerce. Las Dark Stores son bodegas urbanas cerradas al público que permiten despachar en minutos. Ve a los carteles y demuestra la ruta."
            errorVoice="¡Error! Este modelo de hiper-proximidad con Dark Stores es Quick Commerce, no un canal tradicional."
            onSuccess={() => setPhase('c3_pins')}
            onError={() => triggerPenalty('¡Error gerencial grave! Ignoraste el análisis del caso y generaste sobrecostos operativos. Asume la penalidad.', 'c3_channel')}
          />
        )}

        {phase === 'c3_pins' && (
          <PinEntry
            title="🛵 CASO 3: RAPPI TURBO"
            subtitle="Ruta Física — Quick Commerce"
            pinSequence={[
              { pin: '50', voice: 'Dark Store activada. Inventario listo para despacho inmediato. Avanza.' },
              { pin: '60', voice: '¡Quick Commerce completado con éxito! Entrega en la última milla dominada.' },
            ]}
            errorVoice="¡Error! El Quick Commerce despacha desde Dark Stores, no desde fábricas ni mayoristas. Solo necesitas la Dark Store y el cliente. Sistema bloqueado."
            onComplete={() => setPhase('c4_builder')}
            onError={(voice) => triggerPenalty(voice, 'c3_pins')}
          />
        )}

        {phase === 'c4_builder' && (
          <ChannelBuilder onVictory={() => setPhase('victory')} onError={(voice) => triggerPenalty(voice, 'c4_builder')} />
        )}
      </main>
    </div>
  );
}
