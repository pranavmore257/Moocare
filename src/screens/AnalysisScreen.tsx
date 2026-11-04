import { useState, useEffect } from 'react';
import type { ScreenProps, HealthStatus } from '../types';
import { CATTLE } from '../data/cattle';

const STAGES = [
  'Audio uploaded',
  'Preprocessing audio',
  'Extracting vocal features',
  'Classifying vocal pattern',
  'Generating result',
];

export default function AnalysisScreen({ navigate, options }: ScreenProps) {
  const [stage, setStage] = useState(0);
  const cow = CATTLE.find(c => c.id === options.cattleId) || CATTLE[0];

  useEffect(() => {
    const timings = [400, 1100, 1900, 2700, 3500];
    const timers = timings.map((ms, i) => setTimeout(() => setStage(i + 1), ms));
    const done = setTimeout(() => {
      const result: HealthStatus = options.analysisResult || 'healthy';
      const conf = options.confidence || (result === 'healthy' ? 96 : 99);
      navigate('result', {
        cattleId: cow.id,
        analysisResult: result,
        confidence: conf,
        audioFileName: options.audioFileName,
        audioUrl: options.audioUrl,
        duration: options.duration || 3.4,
        breakdown: options.breakdown,
        acousticFeatures: options.acousticFeatures,
        aiInsights: options.aiInsights,
      });
    }, 4000);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [navigate, cow.id, options]);

  const progress = Math.min((stage / STAGES.length) * 100, 100);
  const currentLabel = stage > 0 ? STAGES[stage - 1] : '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ backgroundColor: '#1F5A42' }}>

      {/* Animal badge */}
      <div className="flex items-center gap-3 mb-12 px-5 py-3 rounded-2xl"
        style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>{cow.name[0]}</div>
        <div>
          <div className="font-semibold text-white text-sm">{cow.name}</div>
          <div className="text-xs" style={{ color: '#B8D9C8' }}>{cow.tagId} · {cow.breed}</div>
        </div>
      </div>

      {/* Central visualization */}
      <div className="relative flex items-center justify-center mb-10">
        <div className="animate-slow-spin rounded-full border border-dashed absolute"
          style={{ width: 200, height: 200, borderColor: 'rgba(184,217,200,0.25)' }}/>
        <div className="animate-slow-spin rounded-full border absolute"
          style={{ width: 160, height: 160, borderColor: 'rgba(184,217,200,0.12)', animationDuration: '5s', animationDirection: 'reverse' }}/>
        <div className="w-36 h-36 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-[3px]">
            {[10, 20, 14, 32, 22, 40, 28, 40, 22, 32, 14, 20, 10].map((h, i) => (
              <div key={i} className="animate-wave-bar rounded-full"
                style={{
                  width: 4, height: h,
                  backgroundColor: '#E8F3ED',
                  transformOrigin: 'center',
                  animationDelay: `${i * 0.06}s`,
                }}/>
            ))}
          </div>
        </div>
      </div>

      {/* Labels */}
      <h2 className="text-xl font-bold text-white mb-2">Analyzing Vocalization</h2>
      <p className="text-sm mb-1.5 text-center" style={{ color: '#B8D9C8' }}>
        {currentLabel ? `${currentLabel}...` : 'Starting...'}
      </p>
      <p className="text-xs mb-8" style={{ color: 'rgba(184,217,200,0.5)' }}>Audio duration: 5.8 seconds</p>

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-7">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: '#E8F3ED' }}/>
        </div>
      </div>

      {/* Stage checklist */}
      <div className="w-full max-w-xs flex flex-col gap-3">
        {STAGES.map((s, i) => {
          const done = stage > i;
          const active = stage === i;
          return (
            <div key={s} className="flex items-center gap-3 transition-opacity"
              style={{ opacity: done || active ? 1 : 0.38 }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{ backgroundColor: done ? '#E8F3ED' : active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)' }}>
                {done ? (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="#2E7D5B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : active ? (
                  <div className="w-2 h-2 rounded-full bg-white animate-recording-dot"/>
                ) : (
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}/>
                )}
              </div>
              <span className="text-sm font-medium"
                style={{ color: done || active ? 'white' : 'rgba(255,255,255,0.4)' }}>
                {s}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-12 text-xs text-center max-w-xs leading-relaxed"
        style={{ color: 'rgba(184,217,200,0.4)' }}>
        AI results are screening indicators and should not replace professional veterinary diagnosis.
      </p>
    </div>
  );
}
