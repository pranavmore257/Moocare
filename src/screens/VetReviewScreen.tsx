import { useState } from 'react';
import type { ScreenProps } from '../types';
import { CATTLE, requestVetReviewInBackend } from '../data/cattle';
import StatusBadge from '../components/StatusBadge';

const ATTACHMENTS = [
  { emoji: '🎙️', label: 'Audio recording', sub: '5.8 seconds · WAV format' },
  { emoji: '📊', label: 'AI analysis report', sub: 'Confidence breakdown included' },
  { emoji: '🐄', label: 'Animal profile', sub: 'Full record and breed info' },
  { emoji: '📋', label: 'Previous scan history', sub: 'Last 4 health checks' },
];

export default function VetReviewScreen({ navigate, options }: ScreenProps) {
  const [message, setMessage] = useState('Please review this cattle vocalization and associated health record.');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cow = CATTLE.find(c => c.id === options.cattleId) || CATTLE[0];
  const status = options.analysisResult || 'concern';
  const confidence = options.confidence || 87;

  const handleSendToVet = async () => {
    setSubmitting(true);
    await requestVetReviewInBackend({
      cattleId: cow.id || cow.tagId,
      farmerMessage: message,
      priority: status === 'critical' ? 'urgent' : 'normal',
    });
    setSubmitting(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-warm flex flex-col items-center justify-center px-6 text-center gap-6">
        <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl"
          style={{ backgroundColor: '#E8F3ED' }}>✓</div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Request Sent</h2>
          <p className="text-gray-500 mt-2 leading-relaxed max-w-xs">
            A veterinarian has been notified and will review {cow.name}'s case within 24 hours.
          </p>
        </div>
        <button onClick={() => navigate('home')}
          className="w-full max-w-xs py-4 rounded-2xl text-white font-bold text-base"
          style={{ backgroundColor: '#2E7D5B' }}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F3F4F0' }}>
      <div className="px-8 py-6 flex items-center gap-4" style={{ backgroundColor: '#1F5A42' }}>
        <button onClick={() => navigate('result', options)}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#F1F3EE' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-xl font-bold text-white">Request Vet Review</h1>
      </div>

      <div className="px-8 py-6 flex flex-col gap-4">
        {/* Animal + result summary */}
        <div className="bg-white rounded-2xl p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Case Summary</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
              style={{ backgroundColor: cow.color }}>{cow.name[0]}</div>
            <div>
              <div className="font-bold text-gray-800">{cow.name}</div>
              <div className="text-sm text-gray-500">{cow.tagId} · {cow.breed} · {cow.age} yrs</div>
            </div>
          </div>
          <div className="h-px bg-gray-50 mb-4"/>
          <div className="flex flex-col gap-3">
            {[
              { label: 'AI Result', val: <StatusBadge status={status} size="sm"/> },
              { label: 'AI Confidence', val: <span className="text-sm font-bold text-gray-800">{confidence}%</span> },
              { label: 'Recorded', val: <span className="text-sm text-gray-600">Today · 10:42 AM</span> },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{label}</span>
                {val}
              </div>
            ))}
          </div>
        </div>

        {/* Attachments */}
        <div className="bg-white rounded-2xl p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Attachments</p>
          {ATTACHMENTS.map(({ emoji, label, sub }) => (
            <div key={label} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
              <span className="text-xl">{emoji}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-700">{label}</div>
                <div className="text-xs text-gray-400">{sub}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="#2E7D5B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ))}
        </div>

        {/* Message */}
        <div className="bg-white rounded-2xl p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Message to Veterinarian</p>
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            className="w-full text-sm text-gray-700 outline-none resize-none leading-relaxed"
            rows={4}/>
        </div>

        <button
          onClick={handleSendToVet}
          disabled={submitting}
          className="w-full py-5 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 active:scale-98 transition-transform disabled:opacity-70"
          style={{ backgroundColor: '#2E7D5B' }}>
          {submitting ? 'Submitting to MongoDB...' : 'Request Veterinary Review'}
        </button>
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          A veterinarian will be notified and review the case within 24 hours.
        </p>
      </div>
    </div>
  );
}
