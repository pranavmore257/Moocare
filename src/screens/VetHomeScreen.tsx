import { useState, useEffect } from 'react';
import type { ScreenProps } from '../types';
import { CATTLE, SCANS, ALERTS, subscribe, syncAllFromBackend, getBackendConnectionState } from '../data/cattle';
import StatusBadge from '../components/StatusBadge';

export default function VetHomeScreen({ navigate }: ScreenProps) {
  const [, forceRender] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsub = subscribe(() => forceRender(n => n + 1));
    syncAllFromBackend();
    return unsub;
  }, []);

  const backendInfo = getBackendConnectionState();
  const unresolvedAlerts = ALERTS.filter(a => !a.resolved);
  const criticalAlerts = ALERTS.filter(a => !a.resolved && a.type === 'critical');
  const reviewAlerts = ALERTS.filter(a => !a.resolved && a.type === 'review');
  const cattleNeedingReview = CATTLE.filter(c => c.status === 'review' || c.status === 'concern' || c.status === 'critical');
  const recentScans = SCANS.slice(0, 8);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0F4FF' }}>
      {/* Vet Header — blue theme */}
      <div className="px-8 py-6" style={{ background: 'linear-gradient(135deg, #1E3A8A, #2563EB)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: '#BFDBFE' }}>{greeting}, Dr. Singh 👋</p>
            <h1 className="text-2xl font-bold text-white mt-0.5">Veterinary Dashboard</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(191,219,254,0.7)' }}>
              Sharma Dairy Farm · Case Review Panel · {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <span className={`w-2 h-2 rounded-full ${backendInfo.connected ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`}/>
              <span className="text-xs font-semibold text-white/90">
                {backendInfo.connected ? `MongoDB: ${backendInfo.dbName}` : 'Offline'}
              </span>
            </div>
            <button onClick={async () => { setIsSyncing(true); await syncAllFromBackend(); setTimeout(() => setIsSyncing(false), 500); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                <path d="M21 21v-5h-5"/>
              </svg>
              Sync
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 flex flex-col gap-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm" style={{ borderTop: '3px solid #C94C4C' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: '#FDEAEA' }}>🔴</div>
            <div>
              <div className="text-3xl font-bold" style={{ color: '#C94C4C' }}>{criticalAlerts.length}</div>
              <div className="text-sm font-medium text-gray-500">Critical Cases</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm" style={{ borderTop: '3px solid #D99A2B' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: '#FFF4D6' }}>⚠️</div>
            <div>
              <div className="text-3xl font-bold" style={{ color: '#D99A2B' }}>{reviewAlerts.length}</div>
              <div className="text-sm font-medium text-gray-500">Under Review</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm" style={{ borderTop: '3px solid #2563EB' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: '#EFF6FF' }}>🩺</div>
            <div>
              <div className="text-3xl font-bold" style={{ color: '#2563EB' }}>{cattleNeedingReview.length}</div>
              <div className="text-sm font-medium text-gray-500">Awaiting Vet</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm" style={{ borderTop: '3px solid #2E7D5B' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: '#E8F3ED' }}>✅</div>
            <div>
              <div className="text-3xl font-bold" style={{ color: '#2E7D5B' }}>{CATTLE.filter(c => c.status === 'healthy').length}</div>
              <div className="text-sm font-medium text-gray-500">Cleared Today</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Priority Cases — 2/3 */}
          <div className="col-span-2 flex flex-col gap-5">
            {/* Critical + Review Cases */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50">
                <h2 className="font-bold text-gray-800">Priority Cases</h2>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: '#FDEAEA', color: '#C94C4C' }}>
                  {unresolvedAlerts.length} active
                </span>
              </div>

              {/* Table header */}
              <div className="grid px-6 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-gray-50"
                style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr' }}>
                <span>Animal</span>
                <span>Concern</span>
                <span>Severity</span>
                <span>AI Conf.</span>
                <span>Action</span>
              </div>

              {unresolvedAlerts.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-sm text-gray-400">No pending cases — all animals cleared</div>
                </div>
              ) : (
                unresolvedAlerts.map(alert => (
                  <div key={alert.id}
                    className="grid px-6 py-4 border-b border-gray-50 last:border-0 items-center"
                    style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: alert.type === 'critical' ? '#C94C4C' : '#D99A2B' }}>
                        {alert.cattleName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">{alert.cattleName}</div>
                        <div className="text-xs text-gray-400">{alert.cattleTagId}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 pr-4 leading-relaxed">{alert.message}</div>
                    <div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: alert.type === 'critical' ? '#FDEAEA' : '#FFF4D6',
                          color: alert.type === 'critical' ? '#C94C4C' : '#D99A2B',
                        }}>
                        {alert.type === 'critical' ? '🔴 Critical' : '⚠️ Review'}
                      </span>
                    </div>
                    <div className="text-sm font-semibold" style={{ color: alert.confidence > 90 ? '#C94C4C' : '#D99A2B' }}>
                      {alert.confidence}%
                    </div>
                    <button onClick={() => navigate('cattle-profile', { cattleId: alert.cattleId })}
                      className="px-3 py-2 rounded-xl text-white text-xs font-semibold"
                      style={{ backgroundColor: alert.type === 'critical' ? '#C94C4C' : '#2563EB' }}>
                      Review →
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Recent Scan Results */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <h2 className="font-bold text-gray-800">Recent AI Scan Results</h2>
              </div>
              <div className="grid px-6 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-gray-50"
                style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr' }}>
                <span>Animal</span>
                <span>Time</span>
                <span>Confidence</span>
                <span>Result</span>
                <span>Duration</span>
              </div>
              {recentScans.map(scan => {
                const cow = CATTLE.find(c => c.id === scan.cattleId);
                if (!cow) return null;
                return (
                  <button key={scan.id} onClick={() => navigate('cattle-profile', { cattleId: cow.id })}
                    className="w-full grid px-6 py-3.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                    style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                        style={{ backgroundColor: cow.color }}>{cow.name[0]}</div>
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">{cow.name}</div>
                        <div className="text-xs text-gray-400">{cow.tagId}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">{scan.timestamp}</div>
                    <div className="flex items-center text-sm font-semibold" style={{ color: scan.confidence > 90 ? '#2E7D5B' : '#D99A2B' }}>{scan.confidence}%</div>
                    <div className="flex items-center"><StatusBadge status={scan.status} size="sm"/></div>
                    <div className="flex items-center text-sm text-gray-500">{scan.duration}s</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Vet tools */}
          <div className="flex flex-col gap-5">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h3 className="font-bold text-gray-800 text-sm">Vet Actions</h3>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <button onClick={() => navigate('alerts')}
                  className="flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', color: 'white' }}>
                  <span className="text-xl">📋</span>
                  <div>
                    <div className="font-bold text-sm">Review All Alerts</div>
                    <div className="text-xs opacity-75">Triage pending cases</div>
                  </div>
                </button>
                <button onClick={() => navigate('herd')}
                  className="flex items-center gap-3 p-4 rounded-xl text-left transition-all bg-gray-50 hover:bg-gray-100">
                  <span className="text-xl">🐄</span>
                  <div>
                    <div className="font-bold text-sm text-gray-800">Browse Herd</div>
                    <div className="text-xs text-gray-500">Full animal records</div>
                  </div>
                </button>
                <button onClick={() => navigate('expert-system', { cattleId: '1', analysisResult: 'critical', confidence: 99 })}
                  className="flex items-center gap-3 p-4 rounded-xl text-left transition-all bg-gray-50 hover:bg-gray-100">
                  <span className="text-xl">🧠</span>
                  <div>
                    <div className="font-bold text-sm text-gray-800">AI Expert System</div>
                    <div className="text-xs text-gray-500">XAI · Inference engine</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Animals needing vet */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h3 className="font-bold text-gray-800 text-sm">Animals Needing Attention</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {cattleNeedingReview.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="text-2xl mb-1">✅</div>
                    <div className="text-sm text-gray-400">All clear</div>
                  </div>
                ) : (
                  cattleNeedingReview.map(cow => (
                    <button key={cow.id} onClick={() => navigate('cattle-profile', { cattleId: cow.id })}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-gray-50 transition-colors">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: cow.color }}>{cow.name[0]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-sm">{cow.name} <span className="text-gray-400 font-normal text-xs">{cow.tagId}</span></div>
                        <div className="text-xs text-gray-500 truncate">{cow.breed} · {cow.lastChecked}</div>
                      </div>
                      <StatusBadge status={cow.status} size="sm"/>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
