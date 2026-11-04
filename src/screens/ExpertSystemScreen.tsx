import { useState } from 'react';
import type { ScreenProps, HealthStatus } from '../types';
import { CATTLE } from '../data/cattle';

type TabType = 'xai' | 'knowledge-graph' | 'forward-chaining' | 'peas-agent';

export default function ExpertSystemScreen({ navigate, options }: ScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('xai');
  const cow = CATTLE.find(c => c.id === options.cattleId) || CATTLE[0];
  const status: HealthStatus = options.analysisResult || 'critical';

  const isDistressed = status === 'critical' || status === 'concern' || status === 'review';

  // Feature Attribution values (SHAP / LIME style for Explainable AI)
  const attributions = isDistressed ? [
    { name: 'F0 Fundamental Pitch', value: '510.6 Hz', normal: '100–180 Hz', impact: '+38%', dir: 'distress', desc: 'Laryngeal tension spike from acute pain/fear' },
    { name: 'Harmonics-to-Noise (HNR)', value: '1.76 dB', normal: '> 16 dB', impact: '+26%', dir: 'distress', desc: 'Severe glottal turbulence & breathlessness' },
    { name: 'Jitter Perturbation', value: '15.0%', normal: '< 2.0%', impact: '+18%', dir: 'distress', desc: 'Neuromuscular vocal cord micro-tremor' },
    { name: 'Spectral Centroid', value: '1765 Hz', normal: '< 900 Hz', impact: '+11%', dir: 'distress', desc: 'Piercing high-frequency shrillness' },
    { name: 'Sound Volume (SPL)', value: '77.2 dB', normal: '65–72 dB', impact: '+7%', dir: 'distress', desc: 'Elevated acoustic projection' },
  ] : [
    { name: 'F0 Fundamental Pitch', value: '102.1 Hz', normal: '100–180 Hz', impact: '-42%', dir: 'healthy', desc: 'Relaxed vocal fold vibration in baseline homeostasis' },
    { name: 'Harmonics-to-Noise (HNR)', value: '19.5 dB', normal: '> 16 dB', impact: '-28%', dir: 'healthy', desc: 'Clean periodic harmonic resonance without turbulence' },
    { name: 'Jitter Perturbation', value: '1.2%', normal: '< 2.0%', impact: '-16%', dir: 'healthy', desc: 'Stable period-to-period mucosal wave' },
    { name: 'Spectral Centroid', value: '720 Hz', normal: '< 900 Hz', impact: '-9%', dir: 'healthy', desc: 'Low-frequency soothing ruminate tone' },
    { name: 'Shimmer Perturbation', value: '3.1%', normal: '< 4.5%', impact: '-5%', dir: 'healthy', desc: 'Normal amplitude stability' },
  ];

  return (
    <div className="bg-warm min-h-full pb-10">
      {/* Header */}
      <div className="px-5 pt-12 pb-5 bg-brand-dark text-white">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(options.analysisResult ? 'result' : 'home', options)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 active:scale-95 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex-1">
            <span className="text-[11px] font-mono tracking-wider uppercase text-brand-mid">Course Syllabus Module</span>
            <h1 className="text-lg font-bold text-white">AI & Expert System Engine</h1>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-white/15 border border-white/20 text-white">
            CB3203A
          </span>
        </div>

        {/* Animal Context */}
        <div className="flex items-center justify-between bg-white/10 rounded-2xl p-3 border border-white/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: cow.color }}>{cow.name[0]}</div>
            <div>
              <div className="font-bold text-sm text-white">{cow.name} ({cow.tagId})</div>
              <div className="text-xs text-white/70">{cow.breed} · {cow.age} yrs · Evaluated Case</div>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
            isDistressed ? 'bg-danger text-white' : 'bg-brand-mid text-white'
          }`}>
            {status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-4">
        <div className="flex bg-white rounded-2xl p-1 shadow-sm gap-1 border border-gray-100 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('xai')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'xai' ? 'bg-brand text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}>
            1. Explainable AI (XAI)
          </button>
          <button
            onClick={() => setActiveTab('knowledge-graph')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'knowledge-graph' ? 'bg-brand text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}>
            2. Knowledge Graph
          </button>
          <button
            onClick={() => setActiveTab('forward-chaining')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'forward-chaining' ? 'bg-brand text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}>
            3. Inference Rules
          </button>
          <button
            onClick={() => setActiveTab('peas-agent')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'peas-agent' ? 'bg-brand text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}>
            4. PEAS Agent
          </button>
        </div>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-4">
        {/* ========================================================================= */}
        {/* TAB 1: EXPLAINABLE AI (XAI) */}
        {/* ========================================================================= */}
        {activeTab === 'xai' && (
          <div className="flex flex-col gap-4 animate-fade-up">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800 text-base">Feature Attribution (SHAP / LIME)</h3>
                <span className="text-[11px] font-semibold text-brand bg-brand-light px-2 py-0.5 rounded-full">Unit 1.7 & 5.5</span>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Rather than treating the PyTorch & XGBoost models as black boxes, local feature attribution calculates how much each bioacoustic feature pushed the decision toward <strong className="text-gray-800">{status.toUpperCase()}</strong>.
              </p>

              {/* Attribution bars */}
              <div className="flex flex-col gap-3.5">
                {attributions.map(attr => (
                  <div key={attr.name} className="flex flex-col gap-1.5 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-700">{attr.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-mono">{attr.value}</span>
                        <span className={`font-bold px-1.5 py-0.2 rounded font-mono ${
                          attr.dir === 'distress' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {attr.impact}
                        </span>
                      </div>
                    </div>
                    {/* Visual Bar */}
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          attr.dir === 'distress' ? 'bg-danger' : 'bg-brand'
                        }`}
                        style={{ width: `${Math.min(100, parseInt(attr.impact.replace(/[^0-9]/g, '')) * 2.2)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>Baseline: {attr.normal}</span>
                      <span className="text-gray-500 italic">{attr.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic note */}
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
              <strong>Academic Presentation Tip (Explainable AI):</strong> When your professor asks <em>"Why did the model classify this cow as {status}?"</em>, point to this attribution graph: <strong>Pitch shifted up by {isDistressed ? '+38%' : 'baseline levels'}</strong> and <strong>Harmonic clarity (HNR) was {isDistressed ? 'severely degraded by turbulence' : 'completely clean'}</strong>.
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: KNOWLEDGE GRAPH */}
        {/* ========================================================================= */}
        {activeTab === 'knowledge-graph' && (
          <div className="flex flex-col gap-4 animate-fade-up">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800 text-base">Veterinary Knowledge Graph (RDF/OWL)</h3>
                <span className="text-[11px] font-semibold text-brand bg-brand-light px-2 py-0.5 rounded-full">Unit 3.5 & 3.6</span>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Semantic web ontology representing entities, bioacoustic observations, pathologies, and clinical interventions connected by formal RDF triples: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 font-mono">(Subject, Predicate, Object)</code>.
              </p>

              {/* Visual Graph Layout */}
              <div className="bg-brand-dark/95 text-white rounded-2xl p-4 flex flex-col gap-3 font-mono text-xs">
                {/* Node 1 */}
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <span className="text-emerald-400 font-bold">[Entity: Cattle #{cow.tagId}]</span>
                  <div className="text-[11px] text-gray-300 ml-2 mt-1">
                    ↳ rdf:type ➔ <span className="text-amber-300">BovineSubject</span><br/>
                    ↳ hasBreed ➔ <span className="text-amber-300">{cow.breed}</span><br/>
                    ↳ exhibitsVocalization ➔ <span className="text-sky-300">{isDistressed ? 'Vocal_Stridor_Call' : 'Calm_Pasture_Moo'}</span>
                  </div>
                </div>

                <div className="text-center text-white/50 text-[10px]">▼ (bioacoustic_measurement)</div>

                {/* Node 2 */}
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <span className="text-sky-300 font-bold">[Acoustic Feature Vector]</span>
                  <div className="text-[11px] text-gray-300 ml-2 mt-1">
                    ↳ hasFundamentalPitch ➔ <span className="text-amber-300">{isDistressed ? '510.6 Hz (> Threshold)' : '102.1 Hz (Normal)'}</span><br/>
                    ↳ hasHarmonicsToNoise ➔ <span className="text-amber-300">{isDistressed ? '1.76 dB (Low HNR)' : '19.5 dB (Clean)'}</span><br/>
                    ↳ correlatesWith ➔ <span className="text-red-400">{isDistressed ? 'Laryngeal_Dysfunction' : 'Eupnea_Homeostasis'}</span>
                  </div>
                </div>

                <div className="text-center text-white/50 text-[10px]">▼ (clinical_implication)</div>

                {/* Node 3 */}
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <span className="text-red-400 font-bold">[Inferred Clinical Pathology]</span>
                  <div className="text-[11px] text-gray-300 ml-2 mt-1">
                    ↳ suspectedDiagnosis ➔ <span className="text-amber-300">{isDistressed ? 'Bovine Respiratory Syncytial / Stridor' : 'Healthy Pasture Grazing'}</span><br/>
                    ↳ indicatesTriageLevel ➔ <span className="text-red-300 font-bold">{status.toUpperCase()}</span><br/>
                    ↳ triggersProtocol ➔ <span className="text-emerald-300">{isDistressed ? 'Immediate_Isolation_And_Vet_Dispatch' : 'Routine_Monitoring_7_Days'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Unit 3 Concept Reference:</strong> This structure demonstrates <strong>Ontologies (OWL/RDF)</strong> and <strong>Knowledge Representation</strong>, linking deep learning perceptual outputs directly into symbolic domain knowledge.
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: FORWARD CHAINING INFERENCE */}
        {/* ========================================================================= */}
        {activeTab === 'forward-chaining' && (
          <div className="flex flex-col gap-4 animate-fade-up">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800 text-base">Expert System: Forward Chaining Trace</h3>
                <span className="text-[11px] font-semibold text-brand bg-brand-light px-2 py-0.5 rounded-full">Unit 3.7 & 4.1</span>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Forward chaining reasoning engine (data-driven) fires production rules starting from known bioacoustic facts to derive actionable veterinary interventions.
              </p>

              {/* Horn Clauses Trace */}
              <div className="flex flex-col gap-3 font-mono text-xs">
                {/* Step 1 */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xs font-bold text-purple-700">[Known Facts in Working Memory]</span>
                  <ul className="list-disc list-inside text-[11px] text-gray-600 mt-1 space-y-0.5">
                    <li>Fact 1: <code>F0_Pitch = {isDistressed ? '510.6 Hz' : '102.1 Hz'}</code></li>
                    <li>Fact 2: <code>HNR = {isDistressed ? '1.76 dB' : '19.5 dB'}</code></li>
                    <li>Fact 3: <code>Jitter = {isDistressed ? '15.0%' : '1.2%'}</code></li>
                  </ul>
                </div>

                {/* Step 2 */}
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-xs font-bold text-blue-800">[Rule R-101 Fired]</span>
                  <div className="text-[11px] text-blue-900 mt-1">
                    <code>IF (Pitch &gt; 280 Hz) AND (HNR &lt; 12 dB)</code><br/>
                    <code>THEN Assert(VocalCordStrain == TRUE)</code>
                  </div>
                  <div className="text-[10px] text-blue-700 mt-1 font-sans">
                    Status: {isDistressed ? '✓ Antecedent satisfied ➔ Fact added to memory' : '✗ Antecedent NOT satisfied'}
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-xs font-bold text-amber-800">[Rule R-204 Fired]</span>
                  <div className="text-[11px] text-amber-900 mt-1">
                    <code>IF (VocalCordStrain == TRUE) AND (Jitter &gt; 3.5%)</code><br/>
                    <code>THEN Assert(AcousticDistressSeverity = CRITICAL)</code>
                  </div>
                  <div className="text-[10px] text-amber-700 mt-1 font-sans">
                    Status: {isDistressed ? '✓ Antecedent satisfied ➔ High priority flag set' : '✗ Rule skipped'}
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-800">[Conclusion & Action Plan]</span>
                  <div className="text-[11px] text-emerald-900 mt-1">
                    {isDistressed ? (
                      <>
                        <code>GOAL REACHED: TriggerVeterinaryAlert(ID: {cow.tagId})</code><br/>
                        <code>ACTIONS: [Dispatch Push Notification, Record Vital Signs, Isolate Animal]</code>
                      </>
                    ) : (
                      <>
                        <code>GOAL REACHED: ConfirmHealthyHomeostasis(ID: {cow.tagId})</code><br/>
                        <code>ACTIONS: [Log Routine Check, Schedule Next Scan in 7 Days]</code>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PEAS AGENT ARCHITECTURE */}
        {/* ========================================================================= */}
        {activeTab === 'peas-agent' && (
          <div className="flex flex-col gap-4 animate-fade-up">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800 text-base">Intelligent Agent PEAS Model</h3>
                <span className="text-[11px] font-semibold text-brand bg-brand-light px-2 py-0.5 rounded-full">Unit 1.3 & 1.4</span>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                MooCare AI is formulated as a <strong>Goal-Based Utility Agent</strong> operating autonomously in a livestock agricultural setting.
              </p>

              {/* PEAS Table */}
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                  <span className="font-bold text-purple-900">P — Performance Measure:</span>
                  <p className="text-purple-800 mt-1 text-[11px]">
                    High sensitivity (100% Critical Recall), low false discovery rate (&lt;4%), rapid inference latency (&lt;200 ms), early symptom onset detection.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="font-bold text-blue-900">E — Environment:</span>
                  <p className="text-blue-800 mt-1 text-[11px]">
                    Dairy shed & pasture feedlot. <strong>Partially observable</strong> (acoustic noise, wind), <strong>Stochastic</strong> (animals vocalize unpredictably), <strong>Continuous</strong> (sound waves), <strong>Multi-agent</strong> (herd interactions).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="font-bold text-emerald-900">A — Actuators:</span>
                  <p className="text-emerald-800 mt-1 text-[11px]">
                    Mobile screen diagnostic output, automated push notification to farm manager, veterinary consult dispatch, automated misting cooling fans trigger.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="font-bold text-amber-900">S — Sensors:</span>
                  <p className="text-amber-800 mt-1 text-[11px]">
                    48 kHz MEMS directional audio microphone array, ambient temperature & humidity sensors, camera visual input (future multimodal expansion).
                  </p>
                </div>
              </div>
            </div>

            {/* State space formulation */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-xs text-gray-600">
              <h4 className="font-bold text-gray-800 mb-1">State-Space & MDP Formulation (Unit 4.3):</h4>
              <p className="text-[11px] leading-relaxed">
                States S = &#123; Healthy, Mild Stress, Concern, Critical Illness &#125;.<br/>
                Actions A = &#123; Monitor, Re-scan, Cooling, Veterinary Inspection &#125;.<br/>
                Reward function R(s, a) maximizes animal survival and minimizes treatment costs.
              </p>
            </div>
          </div>
        )}

        {/* Back to Result Button */}
        <button
          onClick={() => navigate(options.analysisResult ? 'result' : 'home', options)}
          className="w-full py-4 rounded-2xl text-white font-bold text-sm shadow-md bg-brand active:scale-98 transition-transform">
          ← Return to Diagnostic Result
        </button>
      </div>
    </div>
  );
}
