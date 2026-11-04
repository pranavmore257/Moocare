import { useState, useEffect } from 'react';
import type { ScreenProps } from '../types';
import { CATTLE, subscribe, syncAllFromBackend } from '../data/cattle';
import StatusBadge from '../components/StatusBadge';

type Filter = 'All' | 'Healthy' | 'Review' | 'Concern';

export default function HerdScreen({ navigate }: ScreenProps) {
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');
  const [, forceRender] = useState(0);

  useEffect(() => {
    const unsub = subscribe(() => forceRender(n => n + 1));
    syncAllFromBackend();
    return unsub;
  }, []);

  const counts = {
    All: CATTLE.length,
    Healthy: CATTLE.filter(c => c.status === 'healthy').length,
    Review: CATTLE.filter(c => c.status === 'review').length,
    Concern: CATTLE.filter(c => c.status === 'concern' || c.status === 'critical').length,
  };

  const filtered = CATTLE.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.tagId.includes(search);
    const matchFilter =
      filter === 'All' ||
      (filter === 'Healthy' && c.status === 'healthy') ||
      (filter === 'Review' && c.status === 'review') ||
      (filter === 'Concern' && (c.status === 'concern' || c.status === 'critical'));
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F3F4F0' }}>
      {/* Header */}
      <div className="px-8 py-6" style={{ backgroundColor: '#1F5A42' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Herd</h1>
            <p className="text-sm mt-0.5" style={{ color: '#B8D9C8' }}>
              {CATTLE.length} animals · Sharma Dairy Farm
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
                <path d="M21 21L16.65 16.65" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input type="text" placeholder="Search animals…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none w-64"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'white' }}/>
            </div>
            <button onClick={() => navigate('add-animal')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              Add Animal
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-5">
          {(['All', 'Healthy', 'Review', 'Concern'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                backgroundColor: filter === f ? 'white' : 'rgba(255,255,255,0.12)',
                color: filter === f ? '#1F5A42' : 'rgba(255,255,255,0.75)',
              }}>
              {f}
              <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{
                  backgroundColor: filter === f ? '#E8F3ED' : 'rgba(255,255,255,0.15)',
                  color: filter === f ? '#2E7D5B' : 'rgba(255,255,255,0.6)',
                }}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: '#F1F3EE' }}>
              <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                <ellipse cx="12" cy="17" rx="6" ry="8" fill="#C3DFCE"/>
                <ellipse cx="27" cy="17" rx="6" ry="8" fill="#C3DFCE"/>
                <ellipse cx="19.5" cy="30" rx="16" ry="14" fill="#C3DFCE"/>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-700 text-lg">No animals found</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">
              {search ? 'Try a different search term' : 'Add your first animal to start monitoring'}
            </p>
            {!search && (
              <button onClick={() => navigate('add-animal')}
                className="mt-6 px-6 py-3 rounded-xl text-white font-semibold text-sm"
                style={{ backgroundColor: '#2E7D5B' }}>
                Add Animal
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100"
              style={{ gridTemplateColumns: '2fr 1.5fr 0.8fr 1fr 1.2fr 0.8fr' }}>
              <span>Animal</span>
              <span>Breed</span>
              <span>Age</span>
              <span>Type</span>
              <span>Last Checked</span>
              <span>Status</span>
            </div>

            {/* Table Rows */}
            {filtered.map(cow => (
              <button key={cow.id} onClick={() => navigate('cattle-profile', { cattleId: cow.id })}
                className="w-full grid px-6 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                style={{ gridTemplateColumns: '2fr 1.5fr 0.8fr 1fr 1.2fr 0.8fr' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                    style={{ backgroundColor: cow.color }}>
                    {cow.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{cow.name}</div>
                    <div className="text-xs text-gray-400">{cow.tagId}</div>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">{cow.breed}</div>
                <div className="flex items-center text-sm text-gray-600">{cow.age} yr</div>
                <div className="flex items-center text-sm text-gray-600">{cow.type}</div>
                <div className="flex items-center text-xs text-gray-400">{cow.lastChecked}</div>
                <div className="flex items-center">
                  <StatusBadge status={cow.status} size="sm"/>
                </div>
              </button>
            ))}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-400">{filtered.length} animals shown</span>
              <button onClick={() => navigate('add-animal')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2"
                style={{ borderColor: '#C3DFCE', color: '#2E7D5B' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                Add New Animal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
