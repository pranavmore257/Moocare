import { useState, useEffect } from 'react';
import type { ScreenProps } from '../types';
import {
  CATTLE,
  SCANS,
  ALERTS,
  subscribe,
  syncAllFromBackend,
  getBackendConnectionState,
} from '../data/cattle';
import StatusBadge from '../components/StatusBadge';

type Filter = 'All' | 'Healthy' | 'Needs Review' | 'Critical';

export default function HomeScreen({ navigate }: ScreenProps) {
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');
  const [, forceRender] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsub = subscribe(() => forceRender(n => n + 1));
    syncAllFromBackend();
    return unsub;
  }, []);

  const backendInfo = getBackendConnectionState();

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncAllFromBackend();
    setTimeout(() => setIsSyncing(false), 500);
  };

  const totalCattle = CATTLE.length;
  const healthyCount = CATTLE.filter(c => c.status === 'healthy').length;
  const reviewCount = CATTLE.filter(c => c.status === 'review').length;
  const concernCount = CATTLE.filter(c => c.status === 'concern' || c.status === 'critical').length;
  const unresolvedAlerts = ALERTS.filter(a => !a.resolved).length;

  const recentScans = SCANS.slice(0, 6);

  const filteredCattle = CATTLE.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.tagId.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' ||
      (filter === 'Healthy' && c.status === 'healthy') ||
      (filter === 'Needs Review' && c.status === 'review') ||
      (filter === 'Critical' && (c.status === 'concern' || c.status === 'critical'));
    return matchSearch && matchFilter;
  });

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F3F4F0' }}>
      {/* Top Header Bar */}
      <div className="px-8 py-6" style={{ backgroundColor: '#1F5A42' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: '#B8D9C8' }}>{greeting}, Arjun 👋</p>
            <h1 className="text-2xl font-bold text-white mt-0.5">Dashboard Overview</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(184,217,200,0.7)' }}>
              Sharma Dairy Farm · Anand, Gujarat · {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Backend status pill */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <span className={`w-2 h-2 rounded-full ${backendInfo.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}/>
              <span className="text-xs font-semibold text-white/90">
                {backendInfo.connected ? `MongoDB: ${backendInfo.dbName}` : 'Offline'}
              </span>
              <span className="text-[10px] text-white/50 font-mono">:5000</span>
            </div>
            <button
              onClick={handleManualSync}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                <path d="M21 21v-5h-5"/>
              </svg>
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
            <button onClick={() => navigate('alerts')} className="relative w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 17H20L18.5858 15.5858C18.2107 15.2107 18 14.7024 18 14.1716V11C18 8.38757 16.3304 6.16509 14 5.34141V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34141C7.66962 6.16509 6 8.38757 6 11V14.1716C6 14.7024 5.78929 15.2107 5.41421 15.5858L4 17H9M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9"
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {unresolvedAlerts > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-brand-dark"
                  style={{ backgroundColor: '#C94C4C' }}/>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 flex flex-col gap-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-4 gap-4">
          {/* Total Herd */}
          <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#E8F3ED' }}>
              <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
                <ellipse cx="12" cy="17" rx="6" ry="8" fill="#2E7D5B" opacity="0.7"/>
                <ellipse cx="27" cy="17" rx="6" ry="8" fill="#2E7D5B" opacity="0.7"/>
                <ellipse cx="19.5" cy="30" rx="16" ry="14" fill="#2E7D5B"/>
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">{totalCattle}</div>
              <div className="text-sm text-gray-500 font-medium">Total Cattle</div>
            </div>
          </div>

          {/* Healthy */}
          <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFilter('Healthy')}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#E8F3ED' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#2E7D5B" strokeWidth="2" strokeLinecap="round"/>
                <path d="M22 4L12 14.01l-3-3" stroke="#2E7D5B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ color: '#2E7D5B' }}>{healthyCount}</div>
              <div className="text-sm font-medium" style={{ color: '#5B9A7A' }}>Healthy</div>
            </div>
          </div>

          {/* Review */}
          <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFilter('Needs Review')}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#FFF4D6' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#D99A2B" strokeWidth="2" strokeLinejoin="round"/>
                <line x1="12" y1="9" x2="12" y2="13" stroke="#D99A2B" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="17" x2="12.01" y2="17" stroke="#D99A2B" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ color: '#D99A2B' }}>{reviewCount}</div>
              <div className="text-sm font-medium" style={{ color: '#B88020' }}>Needs Review</div>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('alerts')}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#FDEAEA' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#C94C4C" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="#C94C4C" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="#C94C4C" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ color: '#C94C4C' }}>{unresolvedAlerts}</div>
              <div className="text-sm font-medium" style={{ color: '#A03A3A' }}>Active Alerts</div>
            </div>
          </div>
        </div>

        {/* Main Content: Two columns */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Cattle List (2/3 width) */}
          <div className="col-span-2 flex flex-col gap-5">
            {/* Search + Filter Bar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="#9CA3AF" strokeWidth="2"/>
                  <path d="M21 21L16.65 16.65" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input type="text" placeholder="Search by name or tag ID…" value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-sm outline-none shadow-sm"
                  style={{ color: '#374151', border: '1px solid #E5E7EB' }}/>
              </div>
              <div className="flex gap-2">
                {(['All', 'Healthy', 'Needs Review', 'Critical'] as Filter[]).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
                    style={{
                      backgroundColor: filter === f ? '#2E7D5B' : 'white',
                      color: filter === f ? 'white' : '#6B7280',
                      border: filter === f ? 'none' : '1px solid #E5E7EB',
                    }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Cattle Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50">
                <h2 className="font-bold text-gray-800">Herd Overview</h2>
                <button onClick={() => navigate('herd')}
                  className="text-sm font-semibold flex items-center gap-1.5"
                  style={{ color: '#2E7D5B' }}>
                  View Full Herd
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Table Header */}
              <div className="grid px-6 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-50"
                style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr' }}>
                <span>Animal</span>
                <span>Breed</span>
                <span>Age</span>
                <span>Status</span>
                <span>Last Check</span>
              </div>

              {/* Table Rows */}
              {filteredCattle.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="text-4xl mb-2">🐄</div>
                  <div className="text-sm text-gray-400 font-medium">No animals match your filter</div>
                </div>
              ) : (
                filteredCattle.map((cow, i) => (
                  <button key={cow.id} onClick={() => navigate('cattle-profile', { cattleId: cow.id })}
                    className="w-full grid px-6 py-4 text-left transition-colors hover:bg-gray-50 border-b border-gray-50 last:border-0"
                    style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: cow.color }}>
                        {cow.name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">{cow.name}</div>
                        <div className="text-xs text-gray-400">{cow.tagId}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">{cow.breed}</div>
                    <div className="flex items-center text-sm text-gray-600">{cow.age} yr</div>
                    <div className="flex items-center">
                      <StatusBadge status={cow.status} size="sm"/>
                    </div>
                    <div className="flex items-center text-xs text-gray-400">{cow.lastChecked}</div>
                  </button>
                ))
              )}
            </div>

            {/* Quick Actions Row */}
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => navigate('record')}
                className="p-5 rounded-2xl flex items-center gap-4 text-white transition-all hover:scale-[1.02] shadow-lg"
                style={{ background: 'linear-gradient(135deg, #2E7D5B, #1F5A42)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="9" y="2" width="6" height="12" rx="3" fill="white"/>
                    <path d="M5 10C5 13.866 8.134 17 12 17C15.866 17 19 13.866 19 10" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    <line x1="12" y1="17" x2="12" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="8" y1="21" x2="16" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-base">New Recording</div>
                  <div className="text-xs text-white/70 mt-0.5">Analyze vocalization & detect health issues</div>
                </div>
              </button>

              <button onClick={() => navigate('add-animal')}
                className="p-5 rounded-2xl flex items-center gap-4 bg-white transition-all hover:shadow-md shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#E8F3ED' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M5 12H19" stroke="#2E7D5B" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-base text-gray-800">Add Animal</div>
                  <div className="text-xs text-gray-500 mt-0.5">Register a new animal to the herd</div>
                </div>
              </button>
            </div>
          </div>

          {/* Right Sidebar: Recent Activity (1/3 width) */}
          <div className="flex flex-col gap-5">
            {/* Recent Scans */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 text-sm">Recent Scans</h3>
                <span className="text-xs text-gray-400">{recentScans.length} results</span>
              </div>
              <div className="divide-y divide-gray-50">
                {recentScans.length === 0 ? (
                  <div className="py-10 text-center text-sm text-gray-400">No scans yet</div>
                ) : (
                  recentScans.map(scan => {
                    const cow = CATTLE.find(c => c.id === scan.cattleId);
                    if (!cow) return null;
                    return (
                      <button key={scan.id}
                        onClick={() => navigate('cattle-profile', { cattleId: cow.id })}
                        className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                          style={{ backgroundColor: cow.color }}>
                          {cow.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-800 truncate">{cow.name}</div>
                          <div className="text-xs text-gray-400 truncate">{scan.timestamp} · {scan.confidence}%</div>
                        </div>
                        <StatusBadge status={scan.status} size="sm"/>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Active Alerts Panel */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 text-sm">Active Alerts</h3>
                {unresolvedAlerts > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#FDEAEA', color: '#C94C4C' }}>
                    {unresolvedAlerts} pending
                  </span>
                )}
              </div>
              <div className="divide-y divide-gray-50">
                {ALERTS.filter(a => !a.resolved).slice(0, 4).length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="text-2xl mb-1">✅</div>
                    <div className="text-sm text-gray-400">All clear!</div>
                  </div>
                ) : (
                  ALERTS.filter(a => !a.resolved).slice(0, 4).map(alert => (
                    <button key={alert.id}
                      onClick={() => navigate('cattle-profile', { cattleId: alert.cattleId })}
                      className="w-full flex items-start gap-3 px-5 py-3.5 text-left hover:bg-gray-50 transition-colors">
                      <span className="text-base mt-0.5">{alert.type === 'critical' ? '🔴' : '⚠️'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">{alert.cattleName}</div>
                        <div className="text-xs text-gray-500 truncate leading-relaxed">{alert.message}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{alert.timestamp}</div>
                      </div>
                    </button>
                  ))
                )}
                {unresolvedAlerts > 0 && (
                  <div className="px-5 py-3">
                    <button onClick={() => navigate('alerts')}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ backgroundColor: '#C94C4C' }}>
                      View All Alerts
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* AI Expert System Card */}
            <button
              onClick={() => navigate('expert-system', { cattleId: '1', analysisResult: 'critical', confidence: 99 })}
              className="p-5 rounded-2xl text-left transition-all hover:shadow-md shadow-sm border"
              style={{ backgroundColor: '#F0F9F4', borderColor: '#C3DFCE' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: '#E8F3ED' }}>🧠</div>
                <div>
                  <div className="font-bold text-gray-800 text-sm">AI Expert System</div>
                  <div className="text-xs font-mono" style={{ color: '#2E7D5B' }}>CB3203A · XAI</div>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Explainable AI · Knowledge Graphs · Inference Rules · PEAS Framework
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
