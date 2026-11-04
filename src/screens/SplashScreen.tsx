import { useEffect } from 'react';
import type { ScreenProps } from '../types';

export default function SplashScreen({ navigate }: ScreenProps) {
  useEffect(() => {
    const t = setTimeout(() => navigate('onboarding'), 2800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#1F5A42' }}>

      {/* Pulsing rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="animate-pulse-ring rounded-full absolute"
          style={{ width: 260, height: 260, border: '1.5px solid rgba(184,217,200,0.35)' }} />
        <div className="animate-pulse-ring rounded-full absolute"
          style={{ width: 360, height: 360, border: '1px solid rgba(184,217,200,0.2)', animationDelay: '0.8s' }} />
        <div className="animate-pulse-ring rounded-full absolute"
          style={{ width: 460, height: 460, border: '1px solid rgba(184,217,200,0.12)', animationDelay: '1.6s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-7 animate-fade-up">
        {/* Logo mark */}
        <div className="w-28 h-28 rounded-3xl flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <svg width="70" height="70" viewBox="0 0 48 48" fill="none">
            <ellipse cx="12" cy="17" rx="6" ry="8" fill="white" opacity="0.92"/>
            <ellipse cx="27" cy="17" rx="6" ry="8" fill="white" opacity="0.92"/>
            <ellipse cx="19.5" cy="30" rx="16" ry="14" fill="white"/>
            <ellipse cx="19.5" cy="37" rx="7.5" ry="4" fill="rgba(31,90,66,0.25)"/>
            <path d="M 37 24 Q 41 28.5 37 33" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M 40 19 Q 46.5 28.5 40 38" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
            <path d="M 43 15 Q 52 28.5 43 42" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"/>
          </svg>
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">MooCare AI</h1>
          <p className="mt-3 text-lg font-medium tracking-widest uppercase text-xs"
            style={{ color: '#B8D9C8', letterSpacing: '0.18em' }}>
            Listen · Analyze · Care
          </p>
          <p className="mt-2 text-sm" style={{ color: 'rgba(184,217,200,0.6)' }}>
            AI-powered cattle health monitoring
          </p>
        </div>

        {/* Waveform bars */}
        <div className="flex items-center gap-1.5">
          {[6, 10, 18, 28, 20, 36, 26, 36, 20, 28, 18, 10, 6].map((h, i) => (
            <div key={i}
              className="animate-wave-bar rounded-full"
              style={{
                width: 4, height: h,
                backgroundColor: 'rgba(184,217,200,0.6)',
                transformOrigin: 'center',
                animationDelay: `${i * 0.07}s`,
              }}
            />
          ))}
        </div>
      </div>

      <p className="absolute bottom-10 text-xs" style={{ color: 'rgba(184,217,200,0.35)' }}>
        Powered by AI · Built for farmers
      </p>
    </div>
  );
}
