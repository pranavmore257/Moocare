"""
MooCare AI - Real-Time Audio Inference Engine
Loads trained bioacoustic models and diagnoses any WAV cattle vocalization.
Can be invoked from CLI, Python, or the MooCare Node.js backend.
"""

import sys
import os
import json
from pathlib import Path
import joblib
import numpy as np

# Fix Windows console UTF-8 encoding
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Ensure local ai_model folder is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from extract_features import extract_audio_features

OUTPUT_DIR = Path(os.environ.get("MOOCARE_MODEL_DIR", Path(__file__).resolve().parent / "output"))
SCALER_PATH = OUTPUT_DIR / "feature_scaler.joblib"
XGB_PATH = OUTPUT_DIR / "moocare_triage_xgboost.joblib"

FEATURE_LIST = [
    'duration', 'rms_energy', 'decibels', 'zcr',
    'f0_pitch_hz', 'peak_freq_hz', 'hnr_db', 'jitter_pct', 'shimmer_pct',
    'spectral_centroid', 'spectral_spread', 'spectral_rolloff', 'spectral_flatness',
    'mfcc_1_mean', 'mfcc_2_mean', 'mfcc_3_mean', 'mfcc_4_mean', 'mfcc_5_mean',
    'mfcc_6_mean', 'mfcc_7_mean', 'mfcc_8_mean', 'mfcc_9_mean', 'mfcc_10_mean',
    'mfcc_11_mean', 'mfcc_12_mean', 'mfcc_13_mean',
    'mfcc_1_std', 'mfcc_2_std', 'mfcc_3_std', 'mfcc_4_std', 'mfcc_5_std',
    'mfcc_6_std', 'mfcc_7_std', 'mfcc_8_std', 'mfcc_9_std', 'mfcc_10_std',
    'mfcc_11_std', 'mfcc_12_std', 'mfcc_13_std'
]

TRIAGE_CLASSES = ['concern', 'critical', 'healthy', 'review']

class MooCarePredictor:
    def __init__(self):
        missing = [str(path) for path in (SCALER_PATH, XGB_PATH) if not path.is_file()]
        if missing:
            raise FileNotFoundError(f"Trained model artifact(s) not found: {', '.join(missing)}")
        for path in (SCALER_PATH, XGB_PATH):
            with path.open("rb") as model_file:
                if model_file.read(40).startswith(b"version https://git-lfs.github.com/spec/v1"):
                    raise RuntimeError(
                        f"{path} is a Git LFS pointer, not a model file. "
                        "Restore the model artifact or retrain the model."
                    )
        self.scaler = joblib.load(SCALER_PATH)
        self.model = joblib.load(XGB_PATH)

    def predict(self, wav_path):
        if not os.path.exists(wav_path):
            return {"error": f"File not found: {wav_path}"}

        feat = extract_audio_features(wav_path)
        if feat is None:
            return {"error": "Audio file is too short or corrupted."}

        x_vec = np.array([[feat[c] for c in FEATURE_LIST]])
        x_scaled = self.scaler.transform(x_vec)

        # Probabilities
        probs = self.model.predict_proba(x_scaled)[0]
        pred_idx = np.argmax(probs)
        pred_status = TRIAGE_CLASSES[pred_idx]
        confidence = float(np.max(probs) * 100.0)

        # Map to MooCare health metrics
        normal_pct = float(probs[TRIAGE_CLASSES.index('healthy')] * 100.0)
        review_pct = float(probs[TRIAGE_CLASSES.index('review')] * 100.0)
        concern_pct = float(probs[TRIAGE_CLASSES.index('concern')] * 100.0)
        critical_pct = float(probs[TRIAGE_CLASSES.index('critical')] * 100.0)

        stress_score = round(review_pct * 0.4 + concern_pct * 0.7 + critical_pct * 1.0, 1)

        insights = {
            'healthy': f"Normal bovine acoustic profile. Fundamental frequency ({feat['f0_pitch_hz']} Hz) and HNR ({feat['hnr_db']} dB) indicate calm homeostasis.",
            'review': f"Mild vocal perturbation detected (milking / agitation signs). Pitch is {feat['f0_pitch_hz']} Hz with shimmer at {feat['shimmer_pct']}%. Keep under observation.",
            'concern': f"Elevated vocal strain detected. Fundamental pitch shifted to {feat['f0_pitch_hz']} Hz and spectral centroid is high ({feat['spectral_centroid']} Hz). Physical discomfort suspected.",
            'critical': f"ACUTE DISTRESS SHOCK CALL. Peak frequency reached {feat['peak_freq_hz']} Hz with severe jitter ({feat['jitter_pct']}%). Immediate veterinary inspection strongly advised!"
        }

        # Simulated or extracted waveform bar envelope (26 bars for UI)
        wave_bars = [
            max(6, min(52, int(feat['decibels'] * 0.4 + np.sin(i * 0.4) * 14)))
            for i in range(26)
        ]

        return {
            'success': True,
            'file': os.path.basename(wav_path),
            'status': pred_status,
            'confidence': round(confidence, 1),
            'stress_score': stress_score,
            'breakdown': {
                'normal': round(normal_pct, 1),
                'stress': round(review_pct + concern_pct, 1),
                'distress': round(critical_pct, 1)
            },
            'probabilities': {
                cls_name: round(float(probs[i] * 100.0), 1)
                for i, cls_name in enumerate(TRIAGE_CLASSES)
            },
            'acoustic_features': {
                'meanPitchHz': feat['f0_pitch_hz'],
                'peakFrequencyHz': feat['peak_freq_hz'],
                'harmonicToNoiseRatio': feat['hnr_db'],
                'jitterPct': feat['jitter_pct'],
                'shimmerPct': feat['shimmer_pct'],
                'spectralCentroid': feat['spectral_centroid'],
                'decibels': feat['decibels'],
                'duration': feat['duration']
            },
            'aiInsights': insights[pred_status],
            'waveformData': wave_bars
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python predict.py <path_to_wav_file>")
        sys.exit(1)

    try:
        predictor = MooCarePredictor()
        result = predictor.predict(sys.argv[1])
        print(json.dumps(result, indent=2))
    except Exception as error:
        print(json.dumps({"success": False, "error": str(error)}))
        sys.exit(1)
