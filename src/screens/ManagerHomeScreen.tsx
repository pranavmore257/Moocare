import { useState, useEffect } from 'react';
import type { ScreenProps } from '../types';
import { CATTLE, SCANS, ALERTS, subscribe, syncAllFromBackend, getBackendConnectionState } from '../data/cattle';

export default function ManagerHomeScreen({ navigate }: ScreenProps) {
  const [, forceRender] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsub = subscribe(() => forceRender(n => n + 1));
    syncAllFromBackend();
    return unsub;
  }, []);

  const backendInfo = getBackendConnectionState();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Analytics data
  const totalCattle = CATTLE.length;
  const healthyCount = CATTLE.filter(c => c.status === 'healthy').length;
  const reviewCount = CATTLE.filter(c => c.status === 'review').length;
  const criticalCount = CATTLE.filter(c => c.status === 'concern' || c.status === 'critical').length;
  const healthRate = totalCattle > 0 ? Math.round((healthyCount / totalCattle) * 100) : 0;
  const unresolvedAlerts = ALERTS.filter(a => !a.resolved).length;
  const totalScans = SCANS.length;
  const avgConfidence = SCANS.length > 0 ? Math.round(SCANS.reduce((sum, s) => sum + s.confidence, 0) / SCANS.length) : 0;

  // Herd breakdown by type
  const dairyCount = CATTLE.filter(c => c.type === 'Dairy').length;
  const beefCount = CATTLE.filter(c => c.type === 'Beef').length;
  const breedingCount = CATTLE.filter(c => c.type === 'Breeding').length;

  // Breed distribution
  const breedMap: Record<string, number> = {};
  CATTLE.forEach(c => { breedMap[c.breed] = (breedMap[c.breed] || 0) + 1; });
  const breeds = Object.entries(breedMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F3FF' }}>
      {/* Manager Header — purple theme */}
      <div className="px-8 py-6" style={{ background: 'linear-gradient(135deg, #4C1D95, #7C3AED)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: '#DDD6FE' }}>{greeting}, Rajesh 👋</p>
            <h1 className="text-2xl font-bold text-white mt-0.5">Farm Analytics Dashboard</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(221,214,254,0.7)' }}>
              Sharma Dairy Farm · Management Overview · {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
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
              Sync Data
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 flex flex-col gap-6">
        {/* KPI Row */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Total Herd', value: totalCattle, icon: '🐄', color: '#7C3AED', bg: '#F5F3FF', sub: 'animals registered' },
            { label: 'Health Rate', value: `${healthRate}%`, icon: '💚', color: '#2E7D5B', bg: '#E8F3ED', sub: `${healthyCount} healthy` },
            { label: 'Needs Attention', value: reviewCount + criticalCount, icon: '⚠️', color: '#D99A2B', bg: '#FFF4D6', sub: `${criticalCount} critical` },
            { label: 'Total Scans', value: totalScans, icon: '🎤', color: '#2563EB', bg: '#EFF6FF', sub: 'AI analyses done' },
            { label: 'Avg AI Confidence', value: `${avgConfidence}%`, icon: '🧠', color: '#7C3AED', bg: '#F5F3FF', sub: 'across all scans' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{kpi.icon}</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: kpi.bg, color: kpi.color }}>{kpi.sub}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
              <div className="text-xs text-gray-500 font-medium">{kpi.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Herd Health Breakdown — charts */}
          <div className="col-span-2 grid grid-rows-2 gap-5">
            {/* Health Status Overview */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-5">Herd Health Status</h2>
              <div className="flex items-end gap-6 h-32">
                {[
                  { label: 'Healthy', count: healthyCount, color: '#2E7D5B', bg: '#E8F3ED' },
                  { label: 'Under Review', count: reviewCount, color: '#D99A2B', bg: '#FFF4D6' },
                  { label: 'Critical', count: criticalCount, color: '#C94C4C', bg: '#FDEAEA' },
                  { label: 'Total Dairy', count: dairyCount, color: '#2563EB', bg: '#EFF6FF' },
                  { label: 'Breeding', count: breedingCount, color: '#7C3AED', bg: '#F5F3FF' },
                ].map(bar => {
                  const height = totalCattle > 0 ? Math.max(12, (bar.count / totalCattle) * 100) : 12;
                  return (
                    <div key={bar.label} className="flex flex-col items-center gap-2 flex-1">
                      <div className="text-sm font-bold" style={{ color: bar.color }}>{bar.count}</div>
                      <div className="w-full rounded-t-lg transition-all" style={{ height, backgroundColor: bar.color, opacity: 0.85 }}/>
                      <div className="text-xs text-gray-500 text-center leading-tight">{bar.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Health bar */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">Overall Herd Health</span>
                  <span className="text-sm font-bold" style={{ color: '#2E7D5B' }}>{healthRate}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F1F3EE' }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${healthRate}%`, backgroundColor: healthRate > 70 ? '#2E7D5B' : healthRate > 40 ? '#D99A2B' : '#C94C4C' }}/>
                </div>
              </div>
            </div>

            {/* Breed Distribution + AI Performance */}
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="font-bold text-gray-800 text-sm mb-4">Breed Distribution</h3>
                <div className="flex flex-col gap-2.5">
                  {breeds.map(([breed, count]) => {
                    const pct = totalCattle > 0 ? (count / totalCattle) * 100 : 0;
                    return (
                      <div key={breed}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-600 truncate">{breed}</span>
                          <span className="text-xs font-bold text-gray-700 ml-2">{count}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: '#F1F3EE' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: '#7C3AED' }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="font-bold text-gray-800 text-sm mb-4">AI Scan Performance</h3>
                <div className="flex flex-col gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold" style={{ color: '#7C3AED' }}>{avgConfidence}%</div>
                    <div className="text-xs text-gray-500 mt-1">Avg. AI Confidence</div>
                  </div>
                  <div className="h-px bg-gray-100"/>
                  <div className="flex justify-between text-sm">
                    <div className="text-center">
                      <div className="font-bold text-gray-800">{totalScans}</div>
                      <div className="text-xs text-gray-400">Total Scans</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold" style={{ color: '#C94C4C' }}>{unresolvedAlerts}</div>
                      <div className="text-xs text-gray-400">Open Alerts</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold" style={{ color: '#2E7D5B' }}>{ALERTS.filter(a => a.resolved).length}</div>
                      <div className="text-xs text-gray-400">Resolved</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick nav */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h3 className="font-bold text-gray-800 text-sm">Management Actions</h3>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {[
                  { label: 'Full Herd List', sub: 'View all animals & records', icon: '🐄', action: () => navigate('herd'), color: '#7C3AED', bg: '#F5F3FF' },
                  { label: 'Health Alerts', sub: `${unresolvedAlerts} pending review`, icon: '🔔', action: () => navigate('alerts'), color: '#C94C4C', bg: '#FDEAEA' },
                  { label: 'New Recording', sub: 'Run vocalization analysis', icon: '🎤', action: () => navigate('record'), color: '#2563EB', bg: '#EFF6FF' },
                  { label: 'AI Expert System', sub: 'XAI · Knowledge graphs', icon: '🧠', action: () => navigate('expert-system', { cattleId: '1', analysisResult: 'critical', confidence: 99 }), color: '#2E7D5B', bg: '#E8F3ED' },
                  { label: 'Add Animal', sub: 'Register new herd member', icon: '➕', action: () => navigate('add-animal'), color: '#6B7280', bg: '#F9FAFB' },
                ].map(item => (
                  <button key={item.label} onClick={item.action}
                    className="flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:scale-[1.01] hover:shadow-sm"
                    style={{ backgroundColor: item.bg }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: 'white' }}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.sub}</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: item.color, flexShrink: 0 }}>
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-800 text-sm mb-4">System Status</h3>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: 'MongoDB Database', status: backendInfo.connected, value: backendInfo.dbName || 'moocare_db' },
                  { label: 'Express API', status: backendInfo.connected, value: ':5000' },
                  { label: 'AI Model', status: true, value: 'Active' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.status ? 'bg-green-400' : 'bg-red-400'}`}/>
                      <span className="text-xs text-gray-600">{item.label}</span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: item.status ? '#2E7D5B' : '#C94C4C' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
