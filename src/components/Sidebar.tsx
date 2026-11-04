import type { NavTab, NavigateFn, UserRole } from '../types';
import { ALERTS, subscribe } from '../data/cattle';
import { useState, useEffect } from 'react';

interface SidebarProps {
  activeTab: NavTab;
  navigate: NavigateFn;
  role?: UserRole;
}

const ROLE_META = {
  farmer:  { label: 'Farmer',       emoji: '🌾', accent: '#2E7D5B', dark: '#1F5A42', darkest: '#0F3426' },
  vet:     { label: 'Veterinarian', emoji: '🩺', accent: '#2563EB', dark: '#1E40AF', darkest: '#1E3A8A' },
  manager: { label: 'Farm Manager', emoji: '📊', accent: '#7C3AED', dark: '#6D28D9', darkest: '#4C1D95' },
};

const ROLE_NAME = {
  farmer:  'Arjun Sharma',
  vet:     'Dr. A. Singh',
  manager: 'Rajesh Kumar',
};

export default function Sidebar({ activeTab, navigate, role = 'farmer' }: SidebarProps) {
  const [, forceRender] = useState(0);
  useEffect(() => {
    return subscribe(() => forceRender(n => n + 1));
  }, []);

  const alertCount = ALERTS.filter(a => !a.resolved).length;
  const meta = ROLE_META[role];

  // Nav items differ per role
  const commonItems = [
    {
      id: 'home' as NavTab,
      label: role === 'farmer' ? 'Dashboard' : role === 'vet' ? 'Case Review' : 'Analytics',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21V15C9 14.4477 9.44772 14 10 14H14C14.5523 14 15 14.4477 15 15V21M9 21H15"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'herd' as NavTab,
      label: 'Herd',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
          <circle cx="17" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M2 20C2 17.2386 5.13401 15 9 15C10.3744 15 11.6568 15.3237 12.75 15.8906" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M14 20C14 18.3431 15.3431 17 17 17C18.6569 17 20 18.3431 20 20H14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'alerts' as NavTab,
      label: 'Alerts',
      badge: alertCount,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 17H20L18.5858 15.5858C18.2107 15.2107 18 14.7024 18 14.1716V11C18 8.38757 16.3304 6.16509 14 5.34141V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34141C7.66962 6.16509 6 8.38757 6 11V14.1716C6 14.7024 5.78929 15.2107 5.41421 15.5858L4 17H9M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'profile' as NavTab,
      label: 'Settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3766 17.7642 20.3766 18.295C20.3766 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2966 18.375 20.2966C17.8442 20.2966 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4755 19.5791 14.0826 20.1724 14.08 20.83V21C14.08 22.1046 13.1846 23 12.08 23C10.9754 23 10.08 22.1046 10.08 21V20.91C10.0642 20.2327 9.63587 19.6339 9 19.4C8.38293 19.1277 7.66219 19.2583 7.18 19.73L7.12 19.79C6.74486 20.1656 6.23577 20.3766 5.705 20.3766C5.17423 20.3766 4.66514 20.1656 4.29 19.79C3.91436 19.4149 3.70336 18.9058 3.70336 18.375C3.70336 17.8442 3.91436 17.3351 4.29 16.96L4.35 16.9C4.82167 16.4178 4.95231 15.6971 4.68 15.08C4.42093 14.4755 3.82764 14.0826 3.17 14.08H3C1.89543 14.08 1 13.1846 1 12.08C1 10.9754 1.89543 10.08 3 10.08H3.09C3.76733 10.0642 4.36613 9.63587 4.6 9C4.87231 8.38293 4.74167 7.66219 4.27 7.18L4.21 7.12C3.83436 6.74486 3.62336 6.23577 3.62336 5.705C3.62336 5.17423 3.83436 4.66514 4.21 4.29C4.58514 3.91436 5.09423 3.70336 5.625 3.70336C6.15577 3.70336 6.66486 3.91436 7.04 4.29L7.1 4.35C7.58219 4.82167 8.30293 4.95231 8.92 4.68H9C9.60447 4.42093 9.99738 3.82764 10 3.17V3C10 1.89543 10.8954 1 12 1C13.1046 1 14 1.89543 14 3V3.09C14.0026 3.74764 14.3955 4.34093 15 4.6C15.6171 4.87231 16.3378 4.74167 16.82 4.27L16.88 4.21C17.2551 3.83436 17.7642 3.62336 18.295 3.62336C18.8258 3.62336 19.3349 3.83436 19.71 4.21C20.0856 4.58514 20.2966 5.09423 20.2966 5.625C20.2966 6.15577 20.0856 6.66486 19.71 7.04L19.65 7.1C19.1783 7.58219 19.0477 8.30293 19.32 8.92V9C19.5791 9.60447 20.1724 9.99738 20.83 10H21C22.1046 10 23 10.8954 23 12C23 13.1046 22.1046 14 21 14H20.91C20.2524 14.0026 19.6591 14.3955 19.4 15Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
    },
  ];

  const navScreenMap: Record<NavTab, 'home' | 'herd' | 'alerts' | 'profile'> = {
    home: 'home', record: 'home', herd: 'herd', alerts: 'alerts', profile: 'profile',
  };

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen sticky top-0"
      style={{ backgroundColor: meta.darkest, borderRight: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Logo */}
      <div className="px-6 pt-7 pb-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: meta.accent }}>
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
              <ellipse cx="12" cy="17" rx="6" ry="8" fill="white" opacity="0.9"/>
              <ellipse cx="27" cy="17" rx="6" ry="8" fill="white" opacity="0.9"/>
              <ellipse cx="19.5" cy="30" rx="16" ry="14" fill="white"/>
              <ellipse cx="19.5" cy="37" rx="7.5" ry="4" fill="rgba(0,0,0,0.15)"/>
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-none">MooCare</div>
            <div className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>AI Health Monitor</div>
          </div>
        </div>

        {/* Role badge */}
        <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <span className="text-base">{meta.emoji}</span>
          <div>
            <div className="text-xs font-bold text-white">{meta.label}</div>
            <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Signed in</div>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: meta.accent }}/>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 mb-4 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}/>

      {/* Nav Items */}
      <nav className="flex-1 px-3 flex flex-col gap-1">
        {commonItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(navScreenMap[item.id] || 'home')}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 w-full relative group"
              style={{
                backgroundColor: isActive ? meta.accent : 'transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.45)',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.07)'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
            >
              <span>{item.icon}</span>
              <span className="font-semibold text-sm">{item.label}</span>
              {(item as any).badge && (item as any).badge > 0 ? (
                <span className="ml-auto text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#C94C4C', color: 'white' }}>
                  {(item as any).badge}
                </span>
              ) : isActive ? (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white flex-shrink-0 opacity-60"/>
              ) : null}
            </button>
          );
        })}

        {/* Divider */}
        <div className="my-2 h-px mx-1" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}/>

        {/* Role-specific extra nav items */}
        {role === 'farmer' && (
          <button onClick={() => navigate('record')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-left w-full transition-all"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor"/>
              <path d="M5 10C5 13.866 8.134 17 12 17C15.866 17 19 13.866 19 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="font-semibold text-sm">New Recording</span>
          </button>
        )}

        {(role === 'vet' || role === 'farmer') && (
          <button
            onClick={() => navigate('expert-system', { cattleId: '1', analysisResult: 'critical', confidence: 99 })}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-left w-full transition-all"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}>
            <span className="text-base">🧠</span>
            <span className="font-semibold text-sm">AI Expert System</span>
            <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${meta.accent}30`, color: meta.accent }}>
              XAI
            </span>
          </button>
        )}

        {role === 'farmer' && (
          <button onClick={() => navigate('add-animal')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-left w-full transition-all"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="font-semibold text-sm">Add Animal</span>
          </button>
        )}
      </nav>

      {/* User Profile at Bottom */}
      <div className="px-3 pb-5 mt-auto">
        <div className="mx-1 mb-3 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}/>
        <button
          onClick={() => navigate('profile')}
          className="flex items-center gap-3 px-3 py-3 rounded-xl w-full transition-all text-left"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.07)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
            style={{ backgroundColor: meta.accent }}>
            {ROLE_NAME[role][0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{ROLE_NAME[role]}</div>
            <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{meta.label}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}
