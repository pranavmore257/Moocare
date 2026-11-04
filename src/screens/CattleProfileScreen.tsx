import { useState } from 'react';
import type { ScreenProps } from '../types';
import { CATTLE, SCANS, getCattleById } from '../data/cattle';
import StatusBadge from '../components/StatusBadge';

const HISTORY = [
  { date: 'Sep 30', status: 'healthy' as const, confidence: 94 },
  { date: 'Sep 28', status: 'review' as const, confidence: 78 },
  { date: 'Sep 24', status: 'healthy' as const, confidence: 91 },
  { date: 'Sep 20', status: 'healthy' as const, confidence: 88 },
];

const TREND = [70, 78, 85, 91, 80, 88, 94];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function TrendChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 300, H = 64, px = 16, py = 8;
  const pts = data.map((v, i) => ({
    x: px + (i / (data.length - 1)) * (W - px * 2),
    y: py + ((max - v) / range) * (H - py * 2),
  }));
  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
  const fill = `${pts.map(p => `${p.x},${p.y}`).join(' ')} ${pts[pts.length-1].x},${H} ${pts[0].x},${H}`;

  return (
    <div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2E7D5B" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#2E7D5B" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon points={fill} fill="url(#tg)"/>
        <polyline points={polyline} fill="none" stroke="#2E7D5B" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="4.5" fill="#2E7D5B"/>
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="8" fill="#2E7D5B" opacity="0.18"/>
      </svg>
      <div className="flex justify-between px-4 mt-1">
        {DAYS.map((d, i) => <span key={i} className="text-[10px] text-gray-400">{d}</span>)}
      </div>
    </div>
  );
}

export default function CattleProfileScreen({ navigate, options }: ScreenProps) {
  const [range, setRange] = useState('7d');
  const cow = getCattleById(options.cattleId || '1') || CATTLE[0];
  const scan = SCANS.find(s => s.cattleId === cow.id);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F3F4F0' }}>
      {/* Header */}
      <div className="px-8 py-6" style={{ backgroundColor: '#1F5A42' }}>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('herd')}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-lg font-bold text-white flex-1">{cow.name}</h1>
          <button className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M12 20H21M16.5 3.5C16.8978 3.10218 17.4374 2.87868 18 2.87868C18.5626 2.87868 19.1022 3.10218 19.5 3.5C19.8978 3.89782 20.1213 4.43739 20.1213 5C20.1213 5.56261 19.8978 6.10218 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl flex-shrink-0"
            style={{ backgroundColor: cow.color }}>{cow.name[0]}</div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {[
              ['Tag ID', cow.tagId],
              ['Breed', cow.breed],
              ['Age', `${cow.age} years`],
              ['Type', cow.type],
              ['Sex', cow.sex],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-[10px] font-medium" style={{ color: 'rgba(184,217,200,0.65)' }}>{label}</div>
                <div className="text-sm font-semibold text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-4">
        {/* Status */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 font-medium mb-1.5">Current Status</div>
              <StatusBadge status={cow.status} size="lg"/>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 font-medium mb-1">Last Checked</div>
              <div className="text-sm font-semibold text-gray-700">{cow.lastChecked}</div>
              {scan && <div className="text-xs text-gray-400 mt-0.5">AI: {scan.confidence}% confident</div>}
            </div>
          </div>
        </div>

        {/* Trend */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Confidence Trend</h3>
            <div className="flex gap-1">
              {['7d', '30d', '90d'].map(r => (
                <button key={r} onClick={() => setRange(r)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: range === r ? '#E8F3ED' : 'transparent',
                    color: range === r ? '#2E7D5B' : '#9CA3AF',
                  }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <TrendChart data={TREND}/>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Health History</h3>
            <button className="text-sm font-semibold" style={{ color: '#2E7D5B' }}>See all</button>
          </div>
          <div className="relative flex flex-col">
            {HISTORY.map((h, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                <div className="flex flex-col items-center gap-0 flex-shrink-0 self-stretch">
                  <div className="w-3 h-3 rounded-full border-2 mt-1 flex-shrink-0"
                    style={{
                      borderColor: h.status === 'healthy' ? '#2E7D5B' : h.status === 'review' ? '#D99A2B' : '#C94C4C',
                      backgroundColor: 'white',
                    }}/>
                  {i < HISTORY.length - 1 && (
                    <div className="w-px flex-1 min-h-[20px] mt-1" style={{ backgroundColor: '#E5E7EB' }}/>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">{h.date}</div>
                  <StatusBadge status={h.status} size="sm"/>
                </div>
                <div className="text-sm font-semibold text-gray-500">{h.confidence}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button onClick={() => navigate('record', { cattleId: cow.id })}
            className="w-full py-4 rounded-2xl text-white font-bold text-base"
            style={{ backgroundColor: '#2E7D5B' }}>
            Record New Check
          </button>
          <div className="flex gap-3">
            <button className="flex-1 py-4 rounded-2xl font-semibold text-sm border-2"
              style={{ borderColor: '#E5E7EB', color: '#374151' }}>
              View Full History
            </button>
            <button onClick={() => navigate('vet-review', { cattleId: cow.id })}
              className="flex-1 py-4 rounded-2xl font-semibold text-sm border-2"
              style={{ borderColor: '#E5E7EB', color: '#374151' }}>
              Request Vet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
