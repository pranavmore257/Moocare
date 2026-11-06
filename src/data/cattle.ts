import type { Cattle, Scan, Alert } from '../types';
import { apiUrl } from '../lib/api';

// ============================================
// Reactive Store with MongoDB + LocalStorage Sync
// ============================================

const COLORS = ['#5B8E6E', '#B07D55', '#8B6F47', '#6B8E7A', '#9E7060', '#7A8B9B', '#6E7B8B', '#8E6E5B', '#5B7E8E', '#7B6E8E'];

const LOCAL_STORAGE_KEY = 'moocare_cattle_data';

const DEFAULT_CATTLE: Cattle[] = [
  { id: '1', name: 'Gauri', tagId: '#245', breed: 'Holstein Friesian', age: 4, type: 'Dairy', sex: 'Female', status: 'healthy', lastChecked: 'Today · 10:42 AM', color: '#5B8E6E' },
  { id: '2', name: 'Lakshmi', tagId: '#218', breed: 'Jersey', age: 3, type: 'Dairy', sex: 'Female', status: 'review', lastChecked: 'Today · 09:16 AM', color: '#B07D55' },
  { id: '3', name: 'Kamdhenu', tagId: '#302', breed: 'Gir', age: 5, type: 'Dairy', sex: 'Female', status: 'concern', lastChecked: 'Yesterday · 04:15 PM', color: '#8B6F47' },
  { id: '4', name: 'Radha', tagId: '#167', breed: 'Sahiwal', age: 6, type: 'Dairy', sex: 'Female', status: 'healthy', lastChecked: 'Sep 28 · 11:30 AM', color: '#6B8E7A' },
  { id: '5', name: 'Nandini', tagId: '#189', breed: 'Crossbreed', age: 2, type: 'Dairy', sex: 'Female', status: 'healthy', lastChecked: 'Sep 29 · 08:20 AM', color: '#9E7060' },
  { id: '6', name: 'Surabhi', tagId: '#334', breed: 'Holstein Friesian', age: 3, type: 'Dairy', sex: 'Female', status: 'review', lastChecked: 'Sep 29 · 03:00 PM', color: '#7A8B9B' },
];

function loadLocalCattle(): Cattle[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch {
    // ignore
  }
  return [...DEFAULT_CATTLE];
}

function persistLocalCattle(cattle: Cattle[]) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cattle));
    }
  } catch {
    // ignore
  }
}

let _cattle: Cattle[] = loadLocalCattle();

// ========= SCANS =========
const _scans: Scan[] = [
  { id: 's1', cattleId: '1', date: 'Sep 30', timestamp: 'Today · 10:42 AM', status: 'healthy', confidence: 94, duration: 5.8, breakdown: { normal: 72, stress: 20, distress: 8 } },
  { id: 's2', cattleId: '2', date: 'Sep 30', timestamp: 'Today · 09:16 AM', status: 'review', confidence: 82, duration: 6.2, breakdown: { normal: 45, stress: 38, distress: 17 } },
  { id: 's3', cattleId: '3', date: 'Sep 29', timestamp: 'Yesterday · 04:15 PM', status: 'concern', confidence: 87, duration: 5.4, breakdown: { normal: 18, stress: 42, distress: 40 } },
  { id: 's4', cattleId: '4', date: 'Sep 28', timestamp: 'Sep 28 · 11:30 AM', status: 'healthy', confidence: 91, duration: 6.0, breakdown: { normal: 78, stress: 16, distress: 6 } },
  { id: 's5', cattleId: '1', date: 'Sep 28', timestamp: 'Sep 28 · 09:00 AM', status: 'review', confidence: 78, duration: 5.2, breakdown: { normal: 55, stress: 30, distress: 15 } },
  { id: 's6', cattleId: '1', date: 'Sep 24', timestamp: 'Sep 24 · 02:30 PM', status: 'healthy', confidence: 91, duration: 6.0, breakdown: { normal: 78, stress: 16, distress: 6 } },
];

// ========= ALERTS =========
const _alerts: Alert[] = [
  { id: 'a1', cattleId: '3', cattleName: 'Kamdhenu', cattleTagId: '#302', type: 'critical', message: 'Repeated abnormal vocalizations detected', timestamp: 'Today · 09:14 AM', confidence: 87, resolved: false },
  { id: 'a2', cattleId: '2', cattleName: 'Lakshmi', cattleTagId: '#218', type: 'review', message: 'Potential abnormal vocal pattern detected', timestamp: '10 minutes ago', confidence: 82, resolved: false },
  { id: 'a3', cattleId: '1', cattleName: 'Gauri', cattleTagId: '#245', type: 'review', message: 'Low confidence result — re-check recommended', timestamp: 'Sep 28 · 09:00 AM', confidence: 78, resolved: true },
];

// ========= Listeners for reactive updates =========
type Listener = () => void;
const _listeners: Set<Listener> = new Set();

export function subscribe(listener: Listener) {
  _listeners.add(listener);
  return () => { _listeners.delete(listener); };
}

function notify() {
  _listeners.forEach(fn => {
    try { fn(); } catch (e) { console.error('[MooCare Store] Listener error:', e); }
  });
}

// ========= Public read-only accessors =========
export const CATTLE = _cattle;
export const SCANS = _scans;
export const ALERTS = _alerts;

export function getCattleById(id: string): Cattle | undefined {
  if (!id) return _cattle[0];
  const cleanId = String(id).trim();
  return _cattle.find(c => 
    c.id === cleanId || 
    c.tagId === cleanId || 
    c.tagId === `#${cleanId}` ||
    c.tagId.replace('#', '') === cleanId.replace('#', '') ||
    c.name.toLowerCase() === cleanId.toLowerCase()
  );
}

export function getScansForCattle(cattleId: string): Scan[] {
  return _scans.filter(s => s.cattleId === cattleId);
}

// ========= Mutation functions =========

export function addCattle(cow: Omit<Cattle, 'id' | 'color' | 'lastChecked' | 'status'>): Cattle {
  const now = new Date();
  const formattedTime = `Today · ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  
  // Format tag
  const formattedTag = cow.tagId.startsWith('#') ? cow.tagId.trim() : `#${cow.tagId.trim()}`;
  
  const newCow: Cattle = {
    id: `c_${Date.now()}`,
    color: COLORS[_cattle.length % COLORS.length],
    lastChecked: formattedTime,
    status: 'healthy',
    ...cow,
    tagId: formattedTag,
  };

  _cattle.push(newCow);
  persistLocalCattle(_cattle);
  notify();

  // Sync with MongoDB backend in background
  syncCattleToBackend(newCow).catch(err => {
    console.warn('[MooCare] Backend sync error:', err);
  });

  return newCow;
}

export function updateCattleStatus(id: string, status: Cattle['status']) {
  const cow = getCattleById(id);
  if (cow) {
    cow.status = status;
    const now = new Date();
    cow.lastChecked = `Today · ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    persistLocalCattle(_cattle);
    notify();
  }
}

export function addScan(scan: Omit<Scan, 'id'>): Scan {
  const newScan: Scan = { id: `s${Date.now()}`, ...scan };
  _scans.unshift(newScan);
  notify();
  return newScan;
}

export function addAlert(alert: Omit<Alert, 'id'>): Alert {
  const newAlert: Alert = { id: `a${Date.now()}`, ...alert };
  _alerts.unshift(newAlert);
  notify();
  return newAlert;
}

// ========= MongoDB Backend Sync =========

export interface BackendConnectionState {
  status: 'connected' | 'offline' | 'checking';
  connected: boolean;
  dbName: string;
  app: string;
  lastChecked: string;
}

let _backendState: BackendConnectionState = {
  status: 'checking',
  connected: false,
  dbName: 'moocare_db',
  app: 'MooCare AI Backend',
  lastChecked: '',
};

export function getBackendConnectionState(): BackendConnectionState {
  return _backendState;
}

export async function checkBackendHealth(): Promise<BackendConnectionState> {
  try {
    const res = await fetch(apiUrl('/api/health'), { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const json = await res.json();
      _backendState = {
        status: 'connected',
        connected: Boolean(json.database?.connected ?? true),
        dbName: json.database?.name || 'moocare_db',
        app: json.app || 'MooCare AI Backend',
        lastChecked: new Date().toLocaleTimeString(),
      };
    } else {
      _backendState = {
        ..._backendState,
        status: 'offline',
        connected: false,
        lastChecked: new Date().toLocaleTimeString(),
      };
    }
  } catch {
    _backendState = {
      ..._backendState,
      status: 'offline',
      connected: false,
      lastChecked: new Date().toLocaleTimeString(),
    };
  }
  notify();
  return _backendState;
}

export async function syncCattleToBackend(cow: Cattle) {
  try {
    const res = await fetch(apiUrl('/api/cattle'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: cow.name,
        tagId: cow.tagId,
        breed: cow.breed,
        age: cow.age,
        type: cow.type,
        sex: cow.sex,
        status: cow.status,
        color: cow.color,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data && (json.data.id || json.data._id)) {
        cow.id = json.data.id || json.data._id;
        persistLocalCattle(_cattle);
        notify();
      }
    }
  } catch (err) {
    console.warn('[MooCare] Backend sync failed (operating offline):', err);
  }
}

export async function fetchCattleFromBackend() {
  try {
    const res = await fetch(apiUrl('/api/cattle'));
    if (!res.ok) return;
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      let changed = false;
      const existingTags = new Map(_cattle.map(c => [c.tagId.toLowerCase(), c]));

      for (const item of json.data) {
        const tagLower = (item.tagId || '').toLowerCase();
        if (existingTags.has(tagLower)) {
          const existing = existingTags.get(tagLower)!;
          if (item.id || item._id) {
            existing.id = item.id || item._id;
          }
          if (item.status && item.status !== existing.status) {
            existing.status = item.status;
            changed = true;
          }
        } else {
          _cattle.push({
            id: item.id || item._id || `c_${Date.now()}_${Math.random()}`,
            name: item.name,
            tagId: item.tagId,
            breed: item.breed || 'Unknown',
            age: item.age || 3,
            type: item.type || 'Dairy',
            sex: item.sex || 'Female',
            status: item.status || 'healthy',
            lastChecked: item.lastChecked || 'Synced from MongoDB',
            color: item.color || COLORS[_cattle.length % COLORS.length],
          });
          existingTags.set(tagLower, _cattle[_cattle.length - 1]);
          changed = true;
        }
      }

      if (changed) {
        persistLocalCattle(_cattle);
        notify();
      }
    }
  } catch {
    console.warn('[MooCare] Could not fetch cattle from backend (operating offline)');
  }
}

export async function fetchScansFromBackend() {
  try {
    const res = await fetch(apiUrl('/api/scans?limit=50'));
    if (!res.ok) return;
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      const serverScans: Scan[] = json.data.map((item: any) => ({
        id: item.id || item._id,
        cattleId: typeof item.cattleId === 'object' && item.cattleId?._id 
          ? item.cattleId._id 
          : (item.cattleTagId || item.cattleId || '1'),
        date: item.date || 'Recent',
        timestamp: item.timestamp || item.date || 'Recent',
        status: item.status || 'healthy',
        confidence: item.confidence || 85,
        duration: item.duration || 5.8,
        breakdown: item.breakdown || { normal: 75, stress: 15, distress: 10 },
      }));

      const seenIds = new Set(_scans.map(s => s.id));
      let changed = false;
      for (const sc of serverScans) {
        if (!seenIds.has(sc.id)) {
          _scans.push(sc);
          seenIds.add(sc.id);
          changed = true;
        }
      }
      if (changed) {
        notify();
      }
    }
  } catch {
    // offline
  }
}

export async function fetchAlertsFromBackend() {
  try {
    const res = await fetch(apiUrl('/api/alerts'));
    if (!res.ok) return;
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      const serverAlerts: Alert[] = json.data.map((item: any) => ({
        id: item.id || item._id,
        cattleId: typeof item.cattleId === 'object' && item.cattleId?._id ? item.cattleId._id : item.cattleId,
        cattleName: item.cattleName || 'Cattle',
        cattleTagId: item.cattleTagId || '#000',
        type: item.type || 'review',
        message: item.message,
        timestamp: item.timestamp || 'Today',
        confidence: item.confidence || 85,
        resolved: item.resolved || false,
      }));

      const existingMap = new Map(_alerts.map(a => [a.id, a]));
      let changed = false;
      for (const al of serverAlerts) {
        if (existingMap.has(al.id)) {
          const ex = existingMap.get(al.id)!;
          if (ex.resolved !== al.resolved) {
            ex.resolved = al.resolved;
            changed = true;
          }
        } else {
          _alerts.unshift(al);
          existingMap.set(al.id, al);
          changed = true;
        }
      }
      if (changed) {
        notify();
      }
    }
  } catch {
    // offline
  }
}

export async function saveScanToBackend(scanInput: {
  cattleId: string;
  manualStatus?: Cattle['status'];
  manualConfidence?: number;
  duration?: number;
  features?: any;
}) {
  try {
    const res = await fetch(apiUrl('/api/scans'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scanInput),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data?.scan) {
        const sc = json.data.scan;
        const newScan: Scan = {
          id: sc.id || sc._id || `s_${Date.now()}`,
          cattleId: scanInput.cattleId,
          date: sc.date || 'Today',
          timestamp: sc.timestamp || 'Today',
          status: sc.status,
          confidence: sc.confidence,
          duration: sc.duration || 5.8,
          breakdown: sc.breakdown || { normal: 70, stress: 20, distress: 10 },
        };
        _scans.unshift(newScan);
        if (json.data.alert) {
          const al = json.data.alert;
          _alerts.unshift({
            id: al.id || al._id,
            cattleId: al.cattleId,
            cattleName: al.cattleName,
            cattleTagId: al.cattleTagId,
            type: al.type,
            message: al.message,
            timestamp: al.timestamp,
            confidence: al.confidence,
            resolved: al.resolved,
          });
        }
        notify();
        return newScan;
      }
    }
  } catch (err) {
    console.warn('[MooCare] Save scan to backend error:', err);
  }
  return null;
}

export async function resolveAlertInBackend(alertId: string) {
  const alert = _alerts.find(a => a.id === alertId);
  if (alert) {
    alert.resolved = true;
    notify();
  }

  try {
    const res = await fetch(apiUrl(`/api/alerts/${alertId}/resolve`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolvedBy: 'Farmer' }),
    });
    if (res.ok) {
      fetchAlertsFromBackend();
    }
  } catch (err) {
    console.warn('[MooCare] Could not resolve alert on backend:', err);
  }
}

export async function requestVetReviewInBackend(data: {
  cattleId: string;
  farmerMessage: string;
  scanId?: string;
  priority?: 'normal' | 'urgent';
}) {
  try {
    const res = await fetch(apiUrl('/api/vet-reviews'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function syncAllFromBackend() {
  await checkBackendHealth();
  if (_backendState.connected) {
    await Promise.allSettled([
      fetchCattleFromBackend(),
      fetchScansFromBackend(),
      fetchAlertsFromBackend(),
    ]);
  }
}

// Initial auto-sync trigger
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncAllFromBackend();
  }, 100);
}
