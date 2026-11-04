import { useState, useEffect } from 'react';
import type { ScreenProps } from '../types';
import { CATTLE, SCANS, ALERTS, getBackendConnectionState, syncAllFromBackend, subscribe } from '../data/cattle';

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className="relative w-12 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ backgroundColor: value ? '#2E7D5B' : '#D1D5DB' }}>
      <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
        style={{ left: value ? '26px' : '2px' }}/>
    </button>
  );
}

export default function ProfileScreen({ navigate }: ScreenProps) {
  const [healthAlerts, setHealthAlerts] = useState(true);
  const [repeatAlerts, setRepeatAlerts] = useState(true);
  const [lowConf, setLowConf] = useState(false);
  const [vetUpdates, setVetUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [threshold, setThreshold] = useState('80');
  const [, forceRender] = useState(0);

  useEffect(() => {
    const unsub = subscribe(() => forceRender(n => n + 1));
    return unsub;
  }, []);

  const backendState = getBackendConnectionState();
  const isConnected = backendState.connected;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F3F4F0' }}>
      {/* Header */}
      <div className="px-8 py-6" style={{ backgroundColor: '#1F5A42' }}>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            A
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Arjun Sharma</h1>
            <p className="text-sm mt-0.5" style={{ color: '#B8D9C8' }}>Sharma Dairy Farm · Farmer</p>
          </div>
          <div>
            {/* Connectivity Badge */}
            <button
              onClick={() => syncAllFromBackend()}
              className="flex items-center gap-3 px-5 py-3 rounded-xl cursor-pointer transition-all"
              style={{ backgroundColor: isConnected ? 'rgba(255,255,255,0.12)' : 'rgba(201,76,76,0.3)' }}>
              <span className="text-lg">{isConnected ? '🟢' : '🟠'}</span>
              <div>
                <div className="text-white font-semibold text-sm">
                  {isConnected ? `MongoDB: ${backendState.dbName}` : 'Offline / Local Cache'}
                </div>
                <div className="text-xs" style={{ color: 'rgba(184,217,200,0.8)' }}>
                  {isConnected ? 'Node.js Backend on :5000 · Click to re-sync' : 'Click to retry connection'}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Column 1 */}
          <div className="flex flex-col gap-5">
            {/* Account Info */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account</span>
              </div>
              {[
                { label: 'Full Name', value: 'Arjun Sharma' },
                { label: 'Mobile', value: '+91 98765 43210' },
                { label: 'Email', value: 'arjun@sharmafarm.in' },
                { label: 'Role', value: 'Farmer' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-semibold text-gray-800">{value}</span>
                </div>
              ))}
            </div>

            {/* Farm Details */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Farm Details</span>
              </div>
              {[
                { label: 'Farm Name', value: 'Sharma Dairy Farm' },
                { label: 'Location', value: 'Anand, Gujarat' },
                { label: 'Herd Size', value: `${CATTLE.length} animals` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-semibold text-gray-800">{value}</span>
                </div>
              ))}
            </div>

            {/* Sign Out */}
            <button onClick={() => navigate('login')}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm border-2 transition-all hover:bg-red-50"
              style={{ borderColor: '#FDEAEA', color: '#C94C4C' }}>
              Sign Out
            </button>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-5">
            {/* Database & Backend */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Database & Backend</span>
              </div>
              {[
                { label: 'Backend API', value: isConnected ? 'Express :5000 (Healthy)' : 'Disconnected' },
                { label: 'MongoDB Database', value: backendState.dbName || 'moocare_db' },
                { label: 'Cattle in DB', value: `${CATTLE.length} records` },
                { label: 'Scan Logs in DB', value: `${SCANS.length} records` },
                { label: 'Active Alerts', value: `${ALERTS.filter(a => !a.resolved).length} pending` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-semibold text-gray-800">{value}</span>
                </div>
              ))}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                <div className="text-3xl font-bold" style={{ color: '#2E7D5B' }}>{CATTLE.length}</div>
                <div className="text-xs text-gray-500 mt-1">Total Animals</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                <div className="text-3xl font-bold" style={{ color: '#D99A2B' }}>{SCANS.length}</div>
                <div className="text-xs text-gray-500 mt-1">Total Scans</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                <div className="text-3xl font-bold" style={{ color: '#C94C4C' }}>{ALERTS.filter(a => !a.resolved).length}</div>
                <div className="text-xs text-gray-500 mt-1">Active Alerts</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                <div className="text-3xl font-bold" style={{ color: '#2E7D5B' }}>{CATTLE.filter(c => c.status === 'healthy').length}</div>
                <div className="text-xs text-gray-500 mt-1">Healthy</div>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-5">
            {/* Alert Preferences */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alert Preferences</span>
              </div>
              {[
                { label: 'Health alerts', sub: 'Notify when issues detected', value: healthAlerts, onChange: setHealthAlerts },
                { label: 'Repeated abnormal vocalizations', sub: 'Alert on recurring patterns', value: repeatAlerts, onChange: setRepeatAlerts },
                { label: 'Low confidence results', sub: 'Notify on uncertain classifications', value: lowConf, onChange: setLowConf },
                { label: 'Vet review updates', sub: 'Status updates from veterinarians', value: vetUpdates, onChange: setVetUpdates },
              ].map(({ label, sub, value, onChange }) => (
                <div key={label} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
                  <div className="flex-1">
                    <div className="text-sm text-gray-700 font-medium">{label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
                  </div>
                  <Toggle value={value} onChange={onChange}/>
                </div>
              ))}
              <div className="px-5 py-4">
                <div className="text-sm text-gray-700 font-medium mb-3">Confidence threshold</div>
                <div className="flex gap-4">
                  {['70', '80', '90'].map(t => (
                    <button key={t} onClick={() => setThreshold(t)}
                      className="flex items-center gap-2 text-sm font-semibold"
                      style={{ color: threshold === t ? '#2E7D5B' : '#9CA3AF' }}>
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                        style={{ borderColor: threshold === t ? '#2E7D5B' : '#D1D5DB' }}>
                        {threshold === t && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2E7D5B' }}/>}
                      </div>
                      {t}%+
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preferences</span>
              </div>
              <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
                <div className="flex-1 text-sm text-gray-700 font-medium">Dark Mode</div>
                <Toggle value={darkMode} onChange={setDarkMode}/>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-sm text-gray-700 font-medium">Language</span>
                <span className="text-sm font-semibold text-gray-800">English</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
