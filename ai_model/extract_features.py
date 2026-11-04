"""
Bioacoustic Feature Extraction for MooCare AI
Processes CowRumIA-Dataset raw WAV files and extracts veterinary acoustic markers:
- Fundamental Frequency (F0 / Pitch in Hz)
- Harmonics-to-Noise Ratio (HNR in dB)
- Jitter & Shimmer
- Spectral Centroid, Rolloff, Spread, Flatness
- RMS Energy & Decibels
- 13 Mel-Frequency Cepstral Coefficients (MFCCs: mean and std)
"""

import os
import json
from pathlib import Path
import numpy as np
import scipy.io.wavfile as wav
import scipy.signal as signal
from scipy.fft import dct
import pandas as pd
from tqdm import tqdm

MODEL_DIR = Path(__file__).resolve().parent
DATASET_ROOT = Path(os.environ.get("COWRUMIA_DATASET_ROOT", MODEL_DIR.parent / "CowRumIA-Dataset" / "CowRumIA-Dataset"))
OUTPUT_DIR = Path(os.environ.get("MOOCARE_MODEL_DIR", MODEL_DIR / "output"))

def compute_mfccs(signal_data, sample_rate, num_filters=26, num_ceps=13, nfft=1024):
    """Compute MFCCs without external heavyweight audio libraries."""
    # Pre-emphasis
    emphasized = np.append(signal_data[0], signal_data[1:] - 0.97 * signal_data[:-1])
    
    # Framing
    frame_len = int(0.025 * sample_rate)  # 25ms
    frame_step = int(0.010 * sample_rate) # 10ms
    signal_length = len(emphasized)
    
    if signal_length < frame_len:
        # Pad if short
        emphasized = np.pad(emphasized, (0, frame_len - signal_length))
        signal_length = len(emphasized)
        
    num_frames = max(1, int(np.ceil(float(np.abs(signal_length - frame_len)) / frame_step)))
    pad_signal_length = num_frames * frame_step + frame_len
    z = np.zeros((pad_signal_length - signal_length))
    pad_signal = np.append(emphasized, z)
    
    indices = np.tile(np.arange(0, frame_len), (num_frames, 1)) + np.tile(
        np.arange(0, num_frames * frame_step, frame_step), (frame_len, 1)
    ).T
    frames = pad_signal[indices.astype(np.int32, copy=False)]
    
    # Windowing
    frames *= np.hamming(frame_len)
    
    # Magnitude Spectrum & Power Spectrum
    mag_frames = np.absolute(np.fft.rfft(frames, nfft))
    pow_frames = ((1.0 / nfft) * (mag_frames ** 2))
    
    # Filterbank
    low_freq_mel = 0
    high_freq_mel = 2595 * np.log10(1 + (sample_rate / 2) / 700)
    mel_points = np.linspace(low_freq_mel, high_freq_mel, num_filters + 2)
    hz_points = 700 * (10 ** (mel_points / 2595) - 1)
    bin_indices = np.floor((nfft + 1) * hz_points / sample_rate).astype(int)
    
    fbank = np.zeros((num_filters, int(np.floor(nfft / 2 + 1))))
    for m in range(1, num_filters + 1):
        f_m_minus = bin_indices[m - 1]
        f_m = bin_indices[m]
        f_m_plus = bin_indices[m + 1]
        
        for k in range(f_m_minus, f_m):
            if f_m != f_m_minus:
                fbank[m - 1, k] = (k - bin_indices[m - 1]) / (f_m - f_m_minus)
        for k in range(f_m, f_m_plus):
            if f_m_plus != f_m:
                fbank[m - 1, k] = (bin_indices[m + 1] - k) / (f_m_plus - f_m)
                
    filter_banks = np.dot(pow_frames, fbank.T)
    filter_banks = np.where(filter_banks == 0, np.finfo(float).eps, filter_banks)
    filter_banks = 20 * np.log10(filter_banks)
    
    mfcc = dct(filter_banks, type=2, axis=1, norm='ortho')[:, :num_ceps]
    return mfcc

def extract_audio_features(wav_path):
    """Extract full bioacoustic vector from a single WAV audio file."""
    sr, raw_audio = wav.read(wav_path)
    
    # Convert to float [-1.0, 1.0]
    if raw_audio.dtype == np.int16:
        audio = raw_audio.astype(np.float32) / 32768.0
    elif raw_audio.dtype == np.int32:
        audio = raw_audio.astype(np.float32) / 2147483648.0
    elif raw_audio.dtype == np.uint8:
        audio = (raw_audio.astype(np.float32) - 128.0) / 128.0
    else:
        audio = raw_audio.astype(np.float32)
        
    if len(audio.shape) > 1:
        audio = np.mean(audio, axis=1) # downmix to mono if stereo
        
    duration = len(audio) / float(sr)
    if len(audio) < 512:
        return None
        
    # Energy & Decibels
    rms = np.sqrt(np.mean(audio ** 2) + 1e-12)
    decibels = 20 * np.log10(max(rms, 1e-6)) + 94.0 # approximate sound pressure level dB SPL
    
    # Zero crossing rate
    zcr = np.mean(np.abs(np.diff(np.sign(audio)))) / 2.0
    
    # FFT spectrum
    n_fft = 2048
    f_axis = np.fft.rfftfreq(n_fft, 1.0 / sr)
    stft = np.abs(signal.stft(audio, fs=sr, nperseg=1024, noverlap=512)[2])
    spec_mean = np.mean(stft, axis=1) # average spectrum
    
    # Peak Frequency
    peak_idx = np.argmax(spec_mean)
    freqs = np.linspace(0, sr / 2.0, len(spec_mean))
    peak_freq = freqs[peak_idx]
    
    # Spectral Centroid
    spectral_centroid = np.sum(freqs * spec_mean) / (np.sum(spec_mean) + 1e-10)
    
    # Spectral Spread (Bandwidth)
    spectral_spread = np.sqrt(np.sum(((freqs - spectral_centroid) ** 2) * spec_mean) / (np.sum(spec_mean) + 1e-10))
    
    # Spectral Rolloff (85%)
    cum_energy = np.cumsum(spec_mean)
    threshold = 0.85 * cum_energy[-1]
    rolloff_idx = np.where(cum_energy >= threshold)[0]
    spectral_rolloff = freqs[rolloff_idx[0]] if len(rolloff_idx) > 0 else freqs[-1]
    
    # Spectral Flatness
    geo_mean = np.exp(np.mean(np.log(spec_mean + 1e-12)))
    arith_mean = np.mean(spec_mean) + 1e-12
    spectral_flatness = geo_mean / arith_mean
    
    # Fundamental frequency F0 (autocorrelation in bovine range 60 Hz to 800 Hz)
    min_lag = int(sr / 800) # max 800 Hz
    max_lag = int(sr / 60)  # min 60 Hz
    
    # Compute autocorrelation on centered audio window
    autocorr = signal.correlate(audio, audio, mode='full')
    autocorr = autocorr[len(autocorr)//2:]
    
    f0 = 150.0
    hnr = 15.0
    jitter = 1.5
    shimmer = 3.0
    
    if len(autocorr) > max_lag:
        search_window = autocorr[min_lag:max_lag]
        if len(search_window) > 0:
            peak_lag = min_lag + np.argmax(search_window)
            r_max = autocorr[peak_lag]
            r_zero = autocorr[0] + 1e-10
            
            if peak_lag > 0 and r_max > 0.1 * r_zero:
                f0 = float(sr / peak_lag)
                # Harmonics-to-Noise Ratio (dB) = 10 * log10(R_max / (R_0 - R_max))
                diff = max(r_zero - r_max, 1e-8)
                hnr = float(10 * np.log10(max(r_max / diff, 1e-3)))
                hnr = np.clip(hnr, 0.0, 40.0)
            
    # Compute frame-to-frame pitch & amplitude perturbations (Jitter & Shimmer)
    frame_sz = int(sr * 0.030) # 30ms frames
    step_sz = int(sr * 0.015)
    f0_frames = []
    amp_frames = []
    
    for start in range(0, len(audio) - frame_sz, step_sz):
        frm = audio[start:start+frame_sz]
        amp_frames.append(np.max(np.abs(frm)))
        # quick f0 estimate per frame
        corr = signal.correlate(frm, frm, mode='full')
        corr = corr[len(corr)//2:]
        if len(corr) > max_lag:
            sw = corr[min_lag:max_lag]
            if len(sw) > 0 and np.max(sw) > 0.15 * (corr[0] + 1e-8):
                pl = min_lag + np.argmax(sw)
                f0_frames.append(sr / pl)
                
    if len(f0_frames) > 3:
        f0_arr = np.array(f0_frames)
        f0_mean = np.mean(f0_arr)
        jitter = float(np.mean(np.abs(np.diff(f0_arr))) / (f0_mean + 1e-6) * 100.0)
        jitter = float(np.clip(jitter, 0.1, 15.0))
        
    if len(amp_frames) > 3:
        amp_arr = np.array(amp_frames)
        amp_mean = np.mean(amp_arr)
        shimmer = float(np.mean(np.abs(np.diff(amp_arr))) / (amp_mean + 1e-6) * 100.0)
        shimmer = float(np.clip(shimmer, 0.5, 25.0))
        
    # MFCC extraction (13 coefficients)
    try:
        mfccs = compute_mfccs(audio, sr, num_filters=26, num_ceps=13)
        mfcc_means = np.mean(mfccs, axis=0)
        mfcc_stds = np.std(mfccs, axis=0)
    except Exception:
        mfcc_means = np.zeros(13)
        mfcc_stds = np.zeros(13)
        
    features = {
        'duration': round(float(duration), 3),
        'rms_energy': round(float(rms), 6),
        'decibels': round(float(decibels), 2),
        'zcr': round(float(zcr), 4),
        'f0_pitch_hz': round(float(f0), 1),
        'peak_freq_hz': round(float(peak_freq), 1),
        'hnr_db': round(float(hnr), 2),
        'jitter_pct': round(float(jitter), 2),
        'shimmer_pct': round(float(shimmer), 2),
        'spectral_centroid': round(float(spectral_centroid), 1),
        'spectral_spread': round(float(spectral_spread), 1),
        'spectral_rolloff': round(float(spectral_rolloff), 1),
        'spectral_flatness': round(float(spectral_flatness), 4),
    }
    
    for i in range(13):
        features[f'mfcc_{i+1}_mean'] = round(float(mfcc_means[i]), 3)
        features[f'mfcc_{i+1}_std'] = round(float(mfcc_stds[i]), 3)
        
    return features

def process_dataset():
    print(f"Scanning dataset from: {DATASET_ROOT}")
    records = []
    
    # Class mapping rules
    # meat_no _stress -> healthy / calm
    # milk_no_stress -> healthy / calm
    # meat_stessed -> distress / concern (beef agitation)
    # Becerra_estres -> critical distress (calf separation/pain)
    # leche_estres -> stress / review (milking discomfort)
    
    class_dirs = [
        ("meat_no _stress", "beef_calm", "healthy", "Normal Pasture Beef Call", "healthy"),
        ("milk_no_stress", "dairy_calm", "healthy", "Normal Dairy Ruminate Moo", "healthy"),
        ("meat_stessed", "beef_distress", "distress", "Agitated Beef Herd Vocalization", "concern"),
        (os.path.join("milk_stress", "Becerra_estres"), "calf_distress", "distress", "Acute Calf Hunger / Pain Cry", "critical"),
        (os.path.join("milk_stress", "leche_estres"), "milking_stress", "distress", "Milking Udder Discomfort Call", "review")
    ]
    
    total_files = 0
    for rel_path, specific_class, binary_status, call_desc, moocare_status in class_dirs:
        folder_path = os.path.join(DATASET_ROOT, rel_path)
        if not os.path.exists(folder_path):
            print(f"Warning: Folder not found: {folder_path}")
            continue
            
        wav_files = [f for f in os.listdir(folder_path) if f.lower().endswith('.wav')]
        print(f"Extracting features from '{rel_path}': {len(wav_files)} files...")
        
        for idx, filename in enumerate(wav_files):
            file_path = os.path.join(folder_path, filename)
            try:
                feat = extract_audio_features(file_path)
                if feat is None:
                    continue
                    
                feat['file_name'] = filename
                feat['rel_path'] = os.path.join(rel_path, filename)
                feat['specific_class'] = specific_class
                feat['binary_status'] = binary_status # 'healthy' vs 'distress'
                feat['moocare_status'] = moocare_status # 'healthy', 'review', 'concern', 'critical'
                feat['call_description'] = call_desc
                feat['sample_id'] = f"COW-{specific_class[:4].upper()}-{idx+1:03d}"
                
                records.append(feat)
                total_files += 1
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
                
    df = pd.DataFrame(records)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    csv_out = OUTPUT_DIR / "cowrumia_acoustic_features.csv"
    json_out = OUTPUT_DIR / "cowrumia_acoustic_features.json"
    
    df.to_csv(csv_out, index=False)
    df.to_json(json_out, orient="records", indent=2)
    
    print("\n" + "="*50)
    print(f"Successfully processed {len(df)} files!")
    print(f"Saved CSV to: {csv_out}")
    print(f"Saved JSON to: {json_out}")
    print("\nClass breakdown (Specific):")
    print(df['specific_class'].value_counts())
    print("\nStatus breakdown (MooCare 4-tier):")
    print(df['moocare_status'].value_counts())
    print("\nBinary breakdown:")
    print(df['binary_status'].value_counts())
    print("="*50)

if __name__ == '__main__':
    process_dataset()
