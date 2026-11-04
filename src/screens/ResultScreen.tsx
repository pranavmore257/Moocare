import { useState } from 'react';
import type { ScreenProps, HealthStatus } from '../types';
import { CATTLE, SCANS, saveScanToBackend, updateCattleStatus } from '../data/cattle';
import StatusBadge from '../components/StatusBadge';

const CFG = {
  healthy: {
    headline: 'Healthy',
    sub: 'No significant abnormal vocal pattern detected.',
    icon: '✓',
    headerBg: '#2E7D5B',
    cardBg: '#E8F3ED',
    cardColor: '#2E7D5B',
    action: 'Continue routine monitoring. Next check recommended in 7 days.',
    actionBg: '#E8F3ED',
    actionColor: '#2E7D5B',
  },
  review: {
    headline: 'Needs Review',
    sub: 'The vocalization could not be classified with high confidence.',
    icon: '⚠',
    headerBg: '#1F5A42',
    cardBg: '#FFF4D6',
    cardColor: '#D99A2B',
    action: 'Record another sample and observe the animal for unusual behavior or reduced feed intake.',
    actionBg: '#FFF4D6',
    actionColor: '#D99A2B',
  },
  concern: {
    headline: 'Health Concern',
    sub: 'Abnormal vocal patterns were detected in this recording.',
    icon: '⚠',
    headerBg: '#1F5A42',
    cardBg: '#FDEAEA',
    cardColor: '#C94C4C',
    action: 'Check the animal for additional signs. Consider contacting a veterinarian if concerns persist.',
    actionBg: '#FDEAEA',
    actionColor: '#C94C4C',
  },
  critical: {
    headline: 'Critical Alert',
    sub: 'Significant abnormal vocalizations detected. Immediate attention recommended.',
    icon: '🔴',
    headerBg: '#C94C4C',
    cardBg: '#C94C4C',
    cardColor: '#FFFFFF',
    action: 'Request veterinary review immediately.',
    actionBg: '#FDEAEA',
    actionColor: '#C94C4C',
  },
};

function ConfidenceMeter({ value, color }: { value: number; color: string }) {
  const r = 45;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg width="112" height="112" viewBox="0 0 112 112" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="56" cy="56" r={r} stroke="#F1F3EE" strokeWidth="9" fill="none"/>
        <circle cx="56" cy="56" r={r} stroke={color} strokeWidth="9" fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="animate-confidence"/>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold" style={{ color }}>{value}%</span>
        <span className="text-[11px] text-gray-400 font-medium">confidence</span>
      </div>
    </div>
  );
}

export default function ResultScreen({ navigate, options }: ScreenProps) {
  const [saved, setSaved] = useState(false);
  const cow = CATTLE.find(c => c.id === options.cattleId) || CATTLE[0];
  const status: HealthStatus = options.analysisResult || 'healthy';
  const confidence = options.confidence || 94;
  const cfg = CFG[status];
  const scan = SCANS.find(s => s.cattleId === cow.id);
  const breakdown = scan?.breakdown || { normal: 72, stress: 20, distress: 8 };

  const handleSaveToRecord = async () => {
    setSaved(true);
    updateCattleStatus(cow.id, status);
    await saveScanToBackend({
      cattleId: cow.id || cow.tagId,
      manualStatus: status,
      manualConfidence: confidence,
      duration: options.duration || 5.8,
    });
    setTimeout(() => navigate('cattle-profile', { cattleId: cow.id }), 600);
  };

  return (
    <div className="bg-warm min-h-full pb-8">
      {/* Header */}
      <div className="px-5 pt-12 pb-6" style={{ backgroundColor: cfg.headerBg }}>
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('home')}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-lg font-bold text-white">Health Check Result</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>{cow.name[0]}</div>
          <div>
            <div className="font-bold text-white text-lg">{cow.name}</div>
            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {cow.tagId} · Checked today at 10:42 AM
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-4">
        {/* Status card */}
        <div className="rounded-2xl p-5 flex flex-col items-center gap-4 animate-fade-up"
          style={{ backgroundColor: cfg.cardBg }}>
          <div className="text-5xl animate-check-appear">{cfg.icon}</div>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-1.5" style={{ color: cfg.cardColor }}>{cfg.headline}</h2>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: status === 'critical' ? 'rgba(255,255,255,0.8)' : '#6B7280' }}>
              {cfg.sub}
            </p>
          </div>
          <ConfidenceMeter value={confidence} color={cfg.cardColor}/>
        </div>

        {/* Breakdown */}
        <div className="bg-white rounded-2xl p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Vocal Pattern Analysis</h3>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Normal / Calm', value: breakdown.normal, color: '#2E7D5B' },
              { label: 'Stress-related', value: breakdown.stress, color: '#D99A2B' },
              { label: 'Abnormal / Distress', value: breakdown.distress, color: '#C94C4C' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="text-sm font-bold text-gray-800">{item.value}%</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F1F3EE' }}>
                  <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }}/>
                </div>
              </div>
            ))}
          </div>

          <details className="mt-4">
            <summary className="text-sm font-semibold cursor-pointer select-none" style={{ color: '#2E7D5B' }}>
              View Analysis Details
            </summary>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              {[
                ['Audio duration', `${scan?.duration || 5.8} seconds`],
                ['Signal quality', 'Good'],
                ['Model confidence', `${confidence}%`],
                ['Vocal category', status === 'healthy' ? 'Normal' : 'Abnormal'],
                ['Timestamp', 'Sep 30 · 10:42 AM'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-400">{k}</span>
                  <span className="text-gray-700 font-medium">{v}</span>
                </div>
              ))}
            </div>
          </details>
        </div>

        {/* Recommendation */}
        <div className="rounded-2xl p-4 flex gap-3" style={{ backgroundColor: cfg.actionBg, borderLeft: `4px solid ${cfg.actionColor}` }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
            <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke={cfg.actionColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <div className="font-semibold text-sm mb-1" style={{ color: cfg.actionColor }}>Recommended Action</div>
            <p className="text-sm text-gray-600 leading-relaxed">{cfg.action}</p>
          </div>
        </div>

        {/* Explainable AI (XAI) & Knowledge Graph CTA */}
        <button
          onClick={() => navigate('expert-system', {
            cattleId: cow.id,
            analysisResult: status,
            confidence,
            ...options
          })}
          className="bg-brand-dark text-white rounded-2xl p-4 flex items-center justify-between shadow-md active:scale-98 transition-transform border border-brand-mid/40">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0">
              🧠
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Explore AI Reasoning (XAI)</span>
                <span className="text-[10px] font-mono bg-brand px-1.5 py-0.5 rounded text-white">CB3203A</span>
              </div>
              <p className="text-xs text-brand-light/80 mt-0.5">
                Inspect SHAP feature weights, Knowledge Graph & inference rules
              </p>
            </div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <p className="text-xs text-gray-400 text-center px-2 leading-relaxed">
          AI results are screening indicators and should not replace professional veterinary diagnosis.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSaveToRecord}
            className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-colors"
            style={{ backgroundColor: saved ? '#C3DFCE' : '#2E7D5B' }}>
            {saved ? `✓ Saved to ${cow.name}'s Record` : `Save to ${cow.name}'s Record`}
          </button>
          <div className="flex gap-3">
            <button onClick={() => navigate('record')}
              className="flex-1 py-4 rounded-2xl font-semibold text-sm border-2"
              style={{ borderColor: '#C3DFCE', color: '#2E7D5B' }}>
              Record Again
            </button>
            <button onClick={() => navigate('vet-review', { cattleId: cow.id, analysisResult: status, confidence })}
              className="flex-1 py-4 rounded-2xl font-semibold text-sm border-2"
              style={{ borderColor: '#E5E7EB', color: '#374151' }}>
              Share with Vet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
