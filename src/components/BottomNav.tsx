import type { NavTab, NavigateFn } from '../types';

interface BottomNavProps {
  activeTab: NavTab;
  navigate: NavigateFn;
  alertCount?: number;
}

export default function BottomNav({ activeTab, navigate, alertCount }: BottomNavProps) {
  const active = '#2E7D5B';
  const inactive = '#9CA3AF';

  return (
    <nav className="flex-shrink-0 bg-white border-t border-gray-100 relative z-10">
      <div className="flex items-end h-[68px]">
        {/* Home */}
        <button
          onClick={() => navigate('home')}
          className="flex-1 flex flex-col items-center justify-center gap-1 h-full"
          style={{ color: activeTab === 'home' ? active : inactive }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21V15C9 14.4477 9.44772 14 10 14H14C14.5523 14 15 14.4477 15 15V21M9 21H15"
              stroke="currentColor" strokeWidth={activeTab === 'home' ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[10px] font-medium">Home</span>
        </button>

        {/* Herd */}
        <button
          onClick={() => navigate('herd')}
          className="flex-1 flex flex-col items-center justify-center gap-1 h-full"
          style={{ color: activeTab === 'herd' ? active : inactive }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="8" r="4" stroke="currentColor" strokeWidth={activeTab === 'herd' ? 2.5 : 2}/>
            <circle cx="17" cy="10" r="3" stroke="currentColor" strokeWidth={activeTab === 'herd' ? 2.5 : 2}/>
            <path d="M2 20C2 17.2386 5.13401 15 9 15C10.3744 15 11.6568 15.3237 12.75 15.8906" stroke="currentColor" strokeWidth={activeTab === 'herd' ? 2.5 : 2} strokeLinecap="round"/>
            <path d="M14 20C14 18.3431 15.3431 17 17 17C18.6569 17 20 18.3431 20 20H14Z" stroke="currentColor" strokeWidth={activeTab === 'herd' ? 2.5 : 2} strokeLinejoin="round"/>
          </svg>
          <span className="text-[10px] font-medium">Herd</span>
        </button>

        {/* Record — center elevated FAB */}
        <div className="flex-1 flex flex-col items-center justify-end pb-1 relative">
          <button
            onClick={() => navigate('record')}
            className="absolute -top-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            style={{ backgroundColor: '#2E7D5B' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="12" rx="3" fill="white"/>
              <path d="M5 10C5 13.866 8.13401 17 12 17C15.866 17 19 13.866 19 10" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <line x1="12" y1="17" x2="12" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8" y1="21" x2="16" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <span className="text-[10px] font-medium mt-8" style={{ color: activeTab === 'record' ? active : inactive }}>Record</span>
        </div>

        {/* Alerts */}
        <button
          onClick={() => navigate('alerts')}
          className="flex-1 flex flex-col items-center justify-center gap-1 h-full relative"
          style={{ color: activeTab === 'alerts' ? active : inactive }}
        >
          <div className="relative">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 17H20L18.5858 15.5858C18.2107 15.2107 18 14.7024 18 14.1716V11C18 8.38757 16.3304 6.16509 14 5.34141V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34141C7.66962 6.16509 6 8.38757 6 11V14.1716C6 14.7024 5.78929 15.2107 5.41421 15.5858L4 17H9M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9"
                stroke="currentColor" strokeWidth={activeTab === 'alerts' ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {alertCount !== undefined && alertCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-danger text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
                {alertCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Alerts</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => navigate('profile')}
          className="flex-1 flex flex-col items-center justify-center gap-1 h-full"
          style={{ color: activeTab === 'profile' ? active : inactive }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={activeTab === 'profile' ? 2.5 : 2}/>
            <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke="currentColor" strokeWidth={activeTab === 'profile' ? 2.5 : 2} strokeLinecap="round"/>
          </svg>
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
}
