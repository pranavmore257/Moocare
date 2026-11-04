import { useState } from 'react';
import type { ScreenProps } from '../types';
import { addCattle } from '../data/cattle';

const BREEDS = ['Holstein Friesian', 'Jersey', 'Gir', 'Sahiwal', 'Crossbreed', 'Other'];
const TYPES = ['Dairy', 'Beef', 'Breeding'] as const;

export default function AddAnimalScreen({ navigate }: ScreenProps) {
  const [name, setName] = useState('');
  const [tagId, setTagId] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [type, setType] = useState<'Dairy' | 'Beef' | 'Breeding'>('Dairy');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const canSubmit = name.trim() && tagId.trim();

  const handleSubmit = () => {
    if (!canSubmit || saved) return;

    addCattle({
      name: name.trim(),
      tagId: tagId.startsWith('#') ? tagId.trim() : `#${tagId.trim()}`,
      breed: breed || 'Crossbreed',
      age: parseInt(age) || 3,
      type: type,
      sex: 'Female',
    });

    setSaved(true);
    setTimeout(() => navigate('herd'), 600);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F3F4F0' }}>
      <div className="px-8 py-6 flex items-center gap-4" style={{ backgroundColor: '#1F5A42' }}>
        <button onClick={() => navigate('herd')}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#F1F3EE' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-xl font-bold text-white">Add Animal</h1>
      </div>

      <div className="px-8 py-6 flex flex-col gap-4">
        {/* Photo */}
        <button className="w-full py-7 rounded-2xl border-2 border-dashed flex flex-col items-center gap-3"
          style={{ borderColor: '#C3DFCE', backgroundColor: '#F1F3EE' }}>
          <div className="w-16 h-16 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#E8F3ED' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="15" rx="2" stroke="#2E7D5B" strokeWidth="2"/>
              <circle cx="12" cy="12" r="3" stroke="#2E7D5B" strokeWidth="2"/>
              <path d="M9 5L10.5 3H13.5L15 5" stroke="#2E7D5B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold" style={{ color: '#2E7D5B' }}>Tap to add photo</span>
          <span className="text-xs text-gray-400">Optional</span>
        </button>

        {/* Name + Tag */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-4 py-3.5 border-b border-gray-50">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Animal Name *
            </label>
            <input type="text" placeholder="e.g. Gauri" value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-base font-semibold text-gray-800 outline-none placeholder-gray-300"/>
          </div>
          <div className="px-4 py-3.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Tag ID *
            </label>
            <input type="text" placeholder="e.g. #246" value={tagId}
              onChange={e => setTagId(e.target.value)}
              className="w-full text-base font-semibold text-gray-800 outline-none placeholder-gray-300"/>
          </div>
        </div>

        {/* Breed */}
        <div className="bg-white rounded-2xl p-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">Breed</label>
          <div className="flex flex-wrap gap-2">
            {BREEDS.map(b => (
              <button key={b} onClick={() => setBreed(b)}
                className="px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all"
                style={{
                  borderColor: breed === b ? '#2E7D5B' : '#E5E7EB',
                  backgroundColor: breed === b ? '#E8F3ED' : 'white',
                  color: breed === b ? '#2E7D5B' : '#6B7280',
                }}>
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Age + Type */}
        <div className="flex gap-3">
          <div className="flex-1 bg-white rounded-2xl p-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Age (years)</label>
            <input type="number" placeholder="e.g. 4" value={age}
              onChange={e => setAge(e.target.value)}
              className="w-full text-base font-semibold text-gray-800 outline-none placeholder-gray-300"/>
          </div>
          <div className="flex-1 bg-white rounded-2xl p-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">Type</label>
            <div className="flex flex-col gap-2">
              {TYPES.map(t => (
                <button key={t} onClick={() => setType(t)}
                  className="flex items-center gap-2 text-sm font-semibold text-left"
                  style={{ color: type === t ? '#2E7D5B' : '#9CA3AF' }}>
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: type === t ? '#2E7D5B' : '#D1D5DB' }}>
                    {type === t && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2E7D5B' }}/>}
                  </div>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl p-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Notes</label>
          <textarea placeholder="Any observations about this animal..." value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full text-sm text-gray-700 outline-none placeholder-gray-300 resize-none leading-relaxed"
            rows={3}/>
        </div>

        <button onClick={handleSubmit}
          className="w-full py-4 rounded-2xl text-white font-bold text-base transition-colors"
          style={{ backgroundColor: saved ? '#2E7D5B' : canSubmit ? '#2E7D5B' : '#C3DFCE' }}>
          {saved ? '✓ Animal Added Successfully!' : 'Add Animal'}
        </button>
      </div>
    </div>
  );
}


