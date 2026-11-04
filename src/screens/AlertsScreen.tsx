import { useState, useEffect } from 'react';
import type { ScreenProps } from '../types';
import { ALERTS, CATTLE, resolveAlertInBackend, fetchAlertsFromBackend, subscribe } from '../data/cattle';

type Tab = 'All' | 'Review' | 'Critical' | 'Resolved';

export default function AlertsScreen({ navigate }: ScreenProps) {
  const [tab, setTab] = useState<Tab>('All');
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [, forceRender] = useState(0);

  useEffect(() => {
    const unsub = subscribe(() => forceRender(n => n + 1));
    fetchAlertsFromBackend();
    return unsub;
  }, []);

  const handleResolveAlert = (alertId: string) => {
    setDismissed(d => [...d, alertId]);
    resolveAlertInBackend(alertId);
  };

  const visible = ALERTS.filter(a => {
    if (dismissed.includes(a.id)) return false;
    if (tab === 'All') return true;
    if (tab === 'Resolved') return a.resolved;
    if (tab === 'Review') return !a.resolved && a.type === 'review';
    if (tab === 'Critical') return !a.resolved && a.type === 'critical';
    return true;
  });

  const unresolved = ALERTS.filter(a => !a.resolved && !dismissed.includes(a.id)).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F3F4F0' }}>
      {/* Header */}
      <div className="px-8 py-6" style={{ backgroundColor: '#1F5A42' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Health Alerts</h1>
            <p className="text-sm mt-0.5" style={{ color: '#B8D9C8' }}>
              {unresolved > 0 ? `${unresolved} unresolved alerts require attention` : 'All animals are clear — no active alerts'}
            </p>
          </div>
          {unresolved > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: '#C94C4C' }}>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"/>
              <span className="text-sm font-bold text-white">{unresolved} Unresolved</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-5">
          {(['All', 'Review', 'Critical', 'Resolved'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                backgroundColor: tab === t ? 'white' : 'rgba(255,255,255,0.12)',
                color: tab === t ? '#1F5A42' : 'rgba(255,255,255,0.75)',
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6">
        {visible.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-semibold text-gray-700 text-xl">You're all caught up</h3>
            <p className="text-sm text-gray-400 mt-1">No active health alerts at this time</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {visible.map(alert => {
              const isCrit = alert.type === 'critical';
              return (
                <div key={alert.id} className="bg-white rounded-2xl shadow-sm overflow-hidden"
                  style={{ borderTop: `3px solid ${isCrit ? '#C94C4C' : '#D99A2B'}` }}>
                  <div className="p-5">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ backgroundColor: isCrit ? '#FDEAEA' : '#FFF4D6' }}>
                        {isCrit ? '🔴' : '⚠️'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <span className="font-bold text-gray-800 text-base">{alert.cattleName}</span>
                          <span className="text-sm text-gray-400">{alert.cattleTagId}</span>
                          {!alert.resolved && (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase"
                              style={{
                                backgroundColor: isCrit ? '#FDEAEA' : '#FFF4D6',
                                color: isCrit ? '#C94C4C' : '#D99A2B',
                              }}>
                              {isCrit ? 'Critical' : 'Review'}
                            </span>
                          )}
                          {alert.resolved && (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                              style={{ backgroundColor: '#E8F3ED', color: '#2E7D5B' }}>
                              Resolved
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{alert.message}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>{alert.timestamp}</span>
                      <span>·</span>
                      <span>AI Confidence: <strong className="text-gray-600">{alert.confidence}%</strong></span>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => navigate('cattle-profile', { cattleId: alert.cattleId })}
                        className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                        style={{ backgroundColor: isCrit ? '#C94C4C' : '#2E7D5B' }}>
                        Review Animal
                      </button>
                      {!alert.resolved && (
                        <button onClick={() => handleResolveAlert(alert.id)}
                          className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-gray-50"
                          style={{ borderColor: '#E5E7EB', color: '#9CA3AF' }}>
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
