import { useState } from 'react';
import type { ScreenProps } from '../types';

const SLIDES = [
  {
    title: 'Capture the Sound',
    description: 'Record a short cattle vocalization directly from your phone. No special equipment needed.',
    color: '#2E7D5B',
    illustration: (
      <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
        {/* Phone outline */}
        <rect x="42" y="18" width="56" height="96" rx="10" fill="#E8F3ED" stroke="#2E7D5B" strokeWidth="2.5"/>
        <rect x="53" y="25" width="34" height="4" rx="2" fill="#C3DFCE"/>
        {/* Record button */}
        <circle cx="70" cy="76" r="22" fill="#2E7D5B"/>
        <circle cx="70" cy="76" r="16" fill="rgba(255,255,255,0.15)"/>
        {/* Mic icon */}
        <rect x="64" y="64" width="12" height="18" rx="6" fill="white"/>
        <path d="M60 76c0 5.5 4.5 10 10 10s10-4.5 10-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <line x1="70" y1="86" x2="70" y2="91" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="65" y1="91" x2="75" y2="91" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Sound waves */}
        <path d="M98 68 Q104 76 98 84" stroke="#2E7D5B" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7"/>
        <path d="M104 62 Q113 76 104 90" stroke="#2E7D5B" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.45"/>
        <path d="M111 56 Q122 76 111 96" stroke="#2E7D5B" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.25"/>
        {/* Cow silhouette left */}
        <ellipse cx="26" cy="76" rx="14" ry="11" fill="#C3DFCE" opacity="0.8"/>
        <ellipse cx="17" cy="68" rx="5" ry="6.5" fill="#C3DFCE" opacity="0.8"/>
        <ellipse cx="33" cy="68" rx="5" ry="6.5" fill="#C3DFCE" opacity="0.8"/>
      </svg>
    ),
  },
  {
    title: 'Let AI Analyze It',
    description: 'MooCare AI analyzes vocal patterns and acoustic features to identify unusual signals — in seconds.',
    color: '#1F5A42',
    illustration: (
      <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
        {/* Waveform bars */}
        {[10, 18, 28, 20, 36, 24, 32, 16].map((h, i) => (
          <rect key={i} x={8 + i * 9} y={70 - h / 2} width="7" height={h} rx="3.5" fill="#C3DFCE"/>
        ))}
        {/* Arrow */}
        <path d="M82 70 L93 70" stroke="#2E7D5B" strokeWidth="3" strokeLinecap="round"/>
        <path d="M90 65 L95 70 L90 75" stroke="#2E7D5B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* AI Processing box */}
        <rect x="98" y="53" width="34" height="34" rx="8" fill="#2E7D5B"/>
        <text x="115" y="75" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="Poppins, sans-serif">AI</text>
        {/* Neural dots */}
        {[[108,61],[122,61],[115,70],[108,79],[122,79]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill="rgba(255,255,255,0.45)"/>
        ))}
        {/* Result glow */}
        <circle cx="70" cy="110" r="18" fill="#E8F3ED" stroke="#2E7D5B" strokeWidth="2"/>
        <text x="70" y="116" textAnchor="middle" fill="#2E7D5B" fontSize="20">✓</text>
        {/* Connector */}
        <path d="M44 85 Q70 95 96 85" stroke="#C3DFCE" strokeWidth="2" strokeDasharray="4 3" fill="none"/>
      </svg>
    ),
  },
  {
    title: 'Monitor Your Herd',
    description: 'Track individual animals, review health history, and identify potential health concerns early.',
    color: '#2E7D5B',
    illustration: (
      <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
        {/* Card */}
        <rect x="12" y="22" width="116" height="96" rx="12" fill="#F1F3EE"/>
        {/* Header */}
        <rect x="12" y="22" width="116" height="30" rx="12" fill="#1F5A42"/>
        <rect x="12" y="40" width="116" height="12" fill="#1F5A42"/>
        <text x="70" y="41" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="Poppins, sans-serif">Herd Health · Sep 30</text>
        {/* Stat chips */}
        <rect x="18" y="60" width="30" height="20" rx="5" fill="#E8F3ED"/>
        <text x="33" y="74" textAnchor="middle" fill="#2E7D5B" fontSize="9" fontWeight="600" fontFamily="Poppins, sans-serif">4 Healthy</text>
        <rect x="54" y="60" width="34" height="20" rx="5" fill="#FFF4D6"/>
        <text x="71" y="74" textAnchor="middle" fill="#D99A2B" fontSize="9" fontWeight="600" fontFamily="Poppins, sans-serif">⚠ 2 Review</text>
        <rect x="94" y="60" width="32" height="20" rx="5" fill="#FDEAEA"/>
        <text x="110" y="74" textAnchor="middle" fill="#C94C4C" fontSize="9" fontWeight="600" fontFamily="Poppins, sans-serif">🔴 1 Alert</text>
        {/* Mini chart */}
        {[14, 22, 18, 28, 24, 32, 38].map((h, i) => (
          <rect key={i} x={20 + i * 15} y={110 - h} width="11" height={h} rx="3" fill="#C3DFCE" opacity="0.9"/>
        ))}
      </svg>
    ),
  },
];

export default function OnboardingScreen({ navigate }: ScreenProps) {
  const [slide, setSlide] = useState(0);
  const isLast = slide === SLIDES.length - 1;
  const s = SLIDES[slide];

  return (
    <div className="min-h-screen bg-warm flex flex-col">
      <div className="flex justify-between items-center px-5 pt-12 pb-4">
        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className="rounded-full transition-all duration-300"
              style={{ width: i === slide ? 24 : 8, height: 8, backgroundColor: i === slide ? '#2E7D5B' : '#C3DFCE' }}
            />
          ))}
        </div>
        <button onClick={() => navigate('login')} className="text-sm font-medium text-gray-400 py-2 px-3">
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
        <div key={slide} className="animate-fade-up flex flex-col items-center gap-8">
          <div className="w-56 h-56 rounded-3xl flex items-center justify-center"
            style={{ backgroundColor: '#F1F3EE' }}>
            {s.illustration}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">{s.title}</h2>
            <p className="mt-3 text-base text-gray-500 leading-relaxed max-w-xs mx-auto">{s.description}</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-12 flex flex-col gap-3">
        <button onClick={() => isLast ? navigate('login') : setSlide(s => s + 1)}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base active:opacity-90"
          style={{ backgroundColor: '#2E7D5B' }}>
          {isLast ? 'Get Started' : 'Next'}
        </button>
        {slide > 0 && (
          <button onClick={() => setSlide(s => s - 1)}
            className="w-full py-3 text-sm font-medium" style={{ color: '#2E7D5B' }}>
            Back
          </button>
        )}
      </div>
    </div>
  );
}
