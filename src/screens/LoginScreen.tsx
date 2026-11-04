import { useState } from 'react';
import type { ScreenProps, UserRole } from '../types';

type Role = UserRole;
type AuthMethod = 'otp' | 'email';

const ROLES: { id: Role; label: string; desc: string; emoji: string; accentColor: string; bg: string }[] = [
  { id: 'farmer',  label: 'Farmer',         desc: 'Monitor animals and record health checks',          emoji: '🌾', accentColor: '#2E7D5B', bg: '#E8F3ED' },
  { id: 'vet',     label: 'Veterinarian',   desc: 'Review flagged animals and consultations',           emoji: '🩺', accentColor: '#3B82F6', bg: '#EFF6FF' },
  { id: 'manager', label: 'Farm Manager',   desc: 'Herd analytics, reports & team oversight',           emoji: '📊', accentColor: '#8B5CF6', bg: '#F5F3FF' },
];

interface LoginScreenProps extends ScreenProps {
  onLogin: (role: UserRole) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [role, setRole] = useState<Role>('farmer');
  const [method, setMethod] = useState<AuthMethod>('otp');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const selected = ROLES.find(r => r.id === role)!;

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden"
      style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.4)' }}>

      <div className="flex">
        {/* Left panel — brand */}
        <div className="w-72 flex-shrink-0 p-8 flex flex-col justify-between"
          style={{ background: 'linear-gradient(160deg, #0F3426, #1F5A42)' }}>
          <div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
                <ellipse cx="12" cy="17" rx="6" ry="8" fill="white" opacity="0.9"/>
                <ellipse cx="27" cy="17" rx="6" ry="8" fill="white" opacity="0.9"/>
                <ellipse cx="19.5" cy="30" rx="16" ry="14" fill="white"/>
                <ellipse cx="19.5" cy="37" rx="7.5" ry="4" fill="rgba(31,90,66,0.3)"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white leading-tight">MooCare AI</h1>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: 'rgba(184,217,200,0.85)' }}>
              Intelligent cattle health monitoring powered by bioacoustic AI
            </p>

            <div className="mt-8 flex flex-col gap-4">
              {ROLES.map(r => (
                <button key={r.id} onClick={() => setRole(r.id)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all border"
                  style={{
                    borderColor: role === r.id ? 'rgba(255,255,255,0.3)' : 'transparent',
                    backgroundColor: role === r.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  }}>
                  <span className="text-2xl flex-shrink-0">{r.emoji}</span>
                  <div>
                    <div className="font-semibold text-white text-sm">{r.label}</div>
                    <div className="text-xs leading-relaxed" style={{ color: 'rgba(184,217,200,0.65)' }}>{r.desc}</div>
                  </div>
                  {role === r.id && (
                    <svg className="ml-auto flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            {['🎤 Vocalization Analysis', '🧠 AI Expert System', '📡 Real-time Monitoring', '🩺 Vet Integration'].map(f => (
              <div key={f} className="text-xs font-medium" style={{ color: 'rgba(184,217,200,0.7)' }}>{f}</div>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 p-8 flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">{selected.emoji}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Sign in as {selected.label}</h2>
                <p className="text-sm text-gray-500">{selected.desc}</p>
              </div>
            </div>

            {/* Role pill */}
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: selected.bg, color: selected.accentColor }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selected.accentColor }}/>
              {selected.label} Access
            </div>
          </div>

          {/* Auth method toggle */}
          <div className="mb-5">
            <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ backgroundColor: '#F1F3EE' }}>
              {(['otp', 'email'] as const).map(m => (
                <button key={m} onClick={() => setMethod(m)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: method === m ? 'white' : 'transparent',
                    color: method === m ? selected.accentColor : '#9CA3AF',
                    boxShadow: method === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}>
                  {m === 'otp' ? '📱 Mobile OTP' : '✉️ Email'}
                </button>
              ))}
            </div>

            {method === 'otp' ? (
              <div className="flex gap-2">
                <div className="flex items-center justify-center px-3 rounded-xl border text-sm font-medium bg-white"
                  style={{ borderColor: '#E5E7EB', color: '#374151', minWidth: 56, height: 50 }}>
                  +91
                </div>
                <input type="tel" placeholder="Mobile number" value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="flex-1 px-4 py-3.5 rounded-xl border text-sm font-medium outline-none bg-white"
                  style={{ borderColor: '#E5E7EB', color: '#374151' }}/>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <input type="email" placeholder="Email address" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border text-sm font-medium outline-none bg-white"
                  style={{ borderColor: '#E5E7EB', color: '#374151' }}/>
                <input type="password" placeholder="Password"
                  className="w-full px-4 py-3.5 rounded-xl border text-sm font-medium outline-none bg-white"
                  style={{ borderColor: '#E5E7EB', color: '#374151' }}/>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 mt-auto">
            <button onClick={() => onLogin(role)}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 shadow-lg"
              style={{ backgroundColor: selected.accentColor }}>
              {method === 'otp' ? 'Continue with OTP' : 'Sign In'} as {selected.label}
            </button>
            <button onClick={() => onLogin(role)}
              className="w-full py-3.5 rounded-xl font-semibold text-sm border-2 transition-all hover:bg-gray-50"
              style={{ borderColor: selected.accentColor, color: selected.accentColor }}>
              Create Account
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 leading-relaxed mt-4">
            By continuing, you agree to our{' '}
            <span className="underline cursor-pointer" style={{ color: selected.accentColor }}>Terms of Service</span>
            {' '}and{' '}
            <span className="underline cursor-pointer" style={{ color: selected.accentColor }}>Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
