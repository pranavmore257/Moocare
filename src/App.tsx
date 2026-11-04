import { useState } from 'react';
import type { Screen, NavTab, NavigateOptions, UserRole } from './types';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import VetHomeScreen from './screens/VetHomeScreen';
import ManagerHomeScreen from './screens/ManagerHomeScreen';
import RecordScreen from './screens/RecordScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import ResultScreen from './screens/ResultScreen';
import CattleProfileScreen from './screens/CattleProfileScreen';
import AddAnimalScreen from './screens/AddAnimalScreen';
import HerdScreen from './screens/HerdScreen';
import AlertsScreen from './screens/AlertsScreen';
import ProfileScreen from './screens/ProfileScreen';
import VetReviewScreen from './screens/VetReviewScreen';
import ExpertSystemScreen from './screens/ExpertSystemScreen';
import Sidebar from './components/Sidebar';

const PRE_LOGIN_SCREENS: Screen[] = ['splash', 'onboarding', 'login'];

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [opts, setOpts] = useState<NavigateOptions>({});
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [role, setRole] = useState<UserRole>('farmer');

  const navigate = (next: Screen, options: NavigateOptions = {}) => {
    setOpts(options);
    setScreen(next);
    const tabMap: Partial<Record<Screen, NavTab>> = {
      home: 'home', record: 'record', herd: 'herd', alerts: 'alerts', profile: 'profile',
    };
    if (tabMap[next]) setActiveTab(tabMap[next]!);
  };

  // Called by LoginScreen when user picks a role & signs in
  const handleLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    navigate('home');
  };

  const isPreLogin = PRE_LOGIN_SCREENS.includes(screen);
  const props = { navigate, options: opts, role };

  const renderHome = () => {
    if (role === 'vet') return <VetHomeScreen {...props} />;
    if (role === 'manager') return <ManagerHomeScreen {...props} />;
    return <HomeScreen {...props} />;
  };

  const renderScreen = () => {
    switch (screen) {
      case 'splash':         return <SplashScreen {...props}/>;
      case 'onboarding':     return <OnboardingScreen {...props}/>;
      case 'login':          return <LoginScreen {...props} onLogin={handleLogin}/>;
      case 'home':           return renderHome();
      case 'record':         return <RecordScreen {...props}/>;
      case 'analysis':       return <AnalysisScreen {...props}/>;
      case 'result':         return <ResultScreen {...props}/>;
      case 'cattle-profile': return <CattleProfileScreen {...props}/>;
      case 'add-animal':     return <AddAnimalScreen {...props}/>;
      case 'herd':           return <HerdScreen {...props}/>;
      case 'alerts':         return <AlertsScreen {...props}/>;
      case 'profile':        return <ProfileScreen {...props}/>;
      case 'vet-review':     return <VetReviewScreen {...props}/>;
      case 'expert-system':  return <ExpertSystemScreen {...props}/>;
      default:               return renderHome();
    }
  };

  // Pre-login: full screen centered — splash and onboarding take full screen naturally
  if (screen === 'splash' || screen === 'onboarding') {
    return <div className="min-h-screen" style={{ backgroundColor: '#0F3426' }}>{renderScreen()}</div>;
  }

  // Login screen: centered with properly sized card
  if (screen === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#0F3426' }}>
        <div className="w-full max-w-2xl animate-fade-up">
          <LoginScreen {...props} onLogin={handleLogin}/>
        </div>
      </div>
    );
  }

  // Main app: sidebar + content
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F3F4F0' }}>
      <Sidebar activeTab={activeTab} navigate={navigate} role={role} />
      <main className="flex-1 overflow-y-auto min-h-screen">
        {renderScreen()}
      </main>
    </div>
  );
}
