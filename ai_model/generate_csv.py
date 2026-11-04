"""
Generate full MooCare-compatible CSV from the 624 CowRumIA dataset recordings
for seamless ingestion into MongoDB.
"""

import pandas as pd
import numpy as np
import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_DIR = Path(os.environ.get("MOOCARE_MODEL_DIR", Path(__file__).resolve().parent / "output"))
CSV_IN = Path(os.environ.get("MOOCARE_FEATURES_CSV", MODEL_DIR / "cowrumia_acoustic_features.csv"))
CSV_OUT = PROJECT_ROOT / "backend" / "data" / "cowrumia_dataset.csv"

df = pd.read_csv(CSV_IN)

# Breeds pool to assign realistic diversity
beef_breeds = ['Angus', 'Hereford', 'Charolais', 'Brahman', 'Simmental']
dairy_breeds = ['Holstein Friesian', 'Jersey', 'Gir', 'Sahiwal', 'Guernsey']

names_pool = [
    'Ganga', 'Yamuna', 'Kaveri', 'Chitra', 'Devaki', 'Anandi', 'Meera', 'Durga',
    'Tulsi', 'Parvati', 'Radha', 'Lakshmi', 'Bella', 'Daisy', 'Molly', 'Luna',
    'Buttercup', 'Bessie', 'Penny', 'Ruby', 'Rosie', 'Stella', 'Chloe', 'Maggie'
]

rows = []
for i, r in df.iterrows():
    is_dairy = 'milk' in str(r['rel_path']).lower()
    breed = np.random.choice(dairy_breeds if is_dairy else beef_breeds)
    name = names_pool[i % len(names_pool)] + f" #{i+1:03d}"
    tag_id = f"#{300 + (i % 80)}" # 80 distinct cattle
    age = np.random.choice([1, 2, 3, 4, 5, 6]) if not 'calf' in str(r['specific_class']) else 1
    
    rows.append({
        'sample_id': r['sample_id'],
        'tag_id': tag_id,
        'animal_name': name,
        'breed': breed,
        'age': age,
        'vocalization_type': r['call_description'],
        'health_status': r['moocare_status'],
        'confidence': int(88 + np.random.rand() * 10),
        'duration_seconds': r['duration'],
        'pitch': r['f0_pitch_hz'],
        'peak_freq': r['peak_freq_hz'],
        'hnr': r['hnr_db'],
        'jitter': r['jitter_pct'],
        'shimmer': r['shimmer_pct'],
        'decibels': r['decibels'],
        'notes': f"CowRumIA dataset recording ({r['file_name']}) - {r['specific_class'].replace('_', ' ').title()}"
    })

out_df = pd.DataFrame(rows)
CSV_OUT.parent.mkdir(parents=True, exist_ok=True)
out_df.to_csv(CSV_OUT, index=False)
print(f"Created {len(out_df)} rows in {CSV_OUT}")
