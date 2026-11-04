"""
MooCare AI - Bioacoustic Model Training Pipeline
Trains and compares:
1. XGBoost Classifier (Gradient Boosted Trees)
2. PyTorch Deep Neural Network (MLP with BatchNorm, Dropout, GELU)

Evaluates:
- Binary Task: Healthy vs. Distress
- Multi-tier Task: MooCare 4-tier Triage (healthy, review, concern, critical)
"""

import os
import sys
import json
import copy
from pathlib import Path
import joblib

# Fix Windows console UTF-8 encoding
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_recall_fscore_support,
    classification_report, confusion_matrix
)
import xgboost as xgb
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader

OUTPUT_DIR = Path(os.environ.get("MOOCARE_MODEL_DIR", Path(__file__).resolve().parent / "output"))
CSV_PATH = Path(os.environ.get("MOOCARE_FEATURES_CSV", OUTPUT_DIR / "cowrumia_acoustic_features.csv"))

FEATURE_COLS = [
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

# PyTorch Deep Neural Network Definition
class BioacousticMLP(nn.Module):
    def __init__(self, input_dim, num_classes):
        super(BioacousticMLP, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.BatchNorm1d(128),
            nn.GELU(),
            nn.Dropout(0.3),
            
            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.GELU(),
            nn.Dropout(0.3),
            
            nn.Linear(64, 32),
            nn.BatchNorm1d(32),
            nn.GELU(),
            nn.Dropout(0.2),
            
            nn.Linear(32, num_classes)
        )
        
    def forward(self, x):
        return self.net(x)

def train_pytorch(X_train, y_train, X_test, y_test, num_classes, class_weights, epochs=60, batch_size=32):
    torch.manual_seed(42)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    # Datasets & Loaders
    train_dataset = TensorDataset(torch.tensor(X_train, dtype=torch.float32), torch.tensor(y_train, dtype=torch.long))
    test_dataset = TensorDataset(torch.tensor(X_test, dtype=torch.float32), torch.tensor(y_test, dtype=torch.long))
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
    
    model = BioacousticMLP(X_train.shape[1], num_classes).to(device)
    weights_tensor = torch.tensor(class_weights, dtype=torch.float32).to(device)
    criterion = nn.CrossEntropyLoss(weight=weights_tensor)
    optimizer = optim.AdamW(model.parameters(), lr=0.002, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    
    best_acc = 0.0
    best_state = None
    
    for epoch in range(epochs):
        model.train()
        for batch_x, batch_y in train_loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            optimizer.zero_grad()
            out = model(batch_x)
            loss = criterion(out, batch_y)
            loss.backward()
            optimizer.step()
            
        scheduler.step()
        
        # Eval
        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for bx, by in test_loader:
                bx, by = bx.to(device), by.to(device)
                preds = torch.argmax(model(bx), dim=1)
                correct += (preds == by).sum().item()
                total += by.size(0)
                
        val_acc = correct / total
        if val_acc > best_acc:
            best_acc = val_acc
            best_state = copy.deepcopy(model.state_dict())
            
    model.load_state_dict(best_state)
    model.eval()
    
    all_preds = []
    with torch.no_grad():
        for bx, _ in test_loader:
            bx = bx.to(device)
            preds = torch.argmax(model(bx), dim=1)
            all_preds.extend(preds.cpu().numpy())
            
    return model, np.array(all_preds), best_acc

def run_training_pipeline():
    if not CSV_PATH.is_file():
        raise FileNotFoundError(
            f"Feature dataset not found: {CSV_PATH}. Set MOOCARE_FEATURES_CSV or run extract_features.py first."
        )
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Loading feature dataset from: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH)
    
    print(f"Total rows: {len(df)}")
    print(f"Features count: {len(FEATURE_COLS)}")
    
    X_raw = df[FEATURE_COLS].values
    
    # ==========================================
    # EXPERIMENT 1: MooCare 4-Tier Triage
    # ('healthy', 'review', 'concern', 'critical')
    # ==========================================
    print("\n" + "="*60)
    print("[EXPERIMENT 1] MooCare 4-Tier Triage Status Classification")
    print("   Classes: healthy, review (milking), concern (meat), critical (calf)")
    print("="*60)
    
    le_triage = LabelEncoder()
    y_triage = le_triage.fit_transform(df['moocare_status'])
    triage_labels = le_triage.classes_.tolist()
    
    # Compute inverse class frequencies for weighted loss
    counts = np.bincount(y_triage)
    total_samples = len(y_triage)
    class_weights = total_samples / (len(counts) * counts)
    
    # 80/20 Stratified Split
    X_train, X_test, y_train, y_test = train_test_split(
        X_raw, y_triage, test_size=0.20, random_state=42, stratify=y_triage
    )
    
    # Standardization (Z-score normalization)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 1. XGBoost
    print("\n--- Training XGBoost Classifier ---")
    xgb_weights = np.array([class_weights[y] for y in y_train])
    xgb_model = xgb.XGBClassifier(
        n_estimators=180,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        eval_metric='mlogloss'
    )
    xgb_model.fit(X_train_scaled, y_train, sample_weight=xgb_weights)
    xgb_preds = xgb_model.predict(X_test_scaled)
    
    xgb_acc = accuracy_score(y_test, xgb_preds)
    p, r, f1, _ = precision_recall_fscore_support(y_test, xgb_preds, average='weighted')
    
    print(f"XGBoost Test Accuracy:  {xgb_acc * 100:.2f}%")
    print(f"XGBoost Weighted F1:    {f1 * 100:.2f}%")
    print("\nXGBoost Classification Report:")
    print(classification_report(y_test, xgb_preds, target_names=triage_labels))
    
    # Top Features
    importances = xgb_model.feature_importances_
    top_indices = np.argsort(importances)[::-1][:10]
    print("\nTop 10 Most Influential Bioacoustic Markers:")
    for rank, idx in enumerate(top_indices, 1):
        print(f"  {rank:2d}. {FEATURE_COLS[idx]:<22} (Importance: {importances[idx]*100:.2f}%)")
        
    # 2. PyTorch Neural Net
    print("\n--- Training PyTorch Deep Bioacoustic Neural Network ---")
    torch_model, torch_preds, torch_best_acc = train_pytorch(
        X_train_scaled, y_train, X_test_scaled, y_test,
        num_classes=len(triage_labels),
        class_weights=class_weights,
        epochs=75,
        batch_size=32
    )
    
    torch_acc = accuracy_score(y_test, torch_preds)
    tp, tr, tf1, _ = precision_recall_fscore_support(y_test, torch_preds, average='weighted')
    print(f"PyTorch Test Accuracy:  {torch_acc * 100:.2f}%")
    print(f"PyTorch Weighted F1:    {tf1 * 100:.2f}%")
    print("\nPyTorch Classification Report:")
    print(classification_report(y_test, torch_preds, target_names=triage_labels))
    
    # Confusion Matrix
    cm_xgb = confusion_matrix(y_test, xgb_preds).tolist()
    cm_torch = confusion_matrix(y_test, torch_preds).tolist()
    
    # ==========================================
    # EXPERIMENT 2: Binary Detection (Healthy vs Distress)
    # ==========================================
    print("\n" + "="*60)
    print("[EXPERIMENT 2] Binary Risk Classification (Healthy vs. Distress)")
    print("="*60)
    
    le_binary = LabelEncoder()
    y_binary = le_binary.fit_transform(df['binary_status'])
    bin_labels = le_binary.classes_.tolist()
    
    X_tr_b, X_te_b, y_tr_b, y_te_b = train_test_split(
        X_raw, y_binary, test_size=0.20, random_state=42, stratify=y_binary
    )
    scaler_b = StandardScaler()
    X_tr_b_scaled = scaler_b.fit_transform(X_tr_b)
    X_te_b_scaled = scaler_b.transform(X_te_b)
    
    b_counts = np.bincount(y_tr_b)
    scale_pos_weight = b_counts[0] / b_counts[1] if len(b_counts) > 1 else 1.0
    
    xgb_bin = xgb.XGBClassifier(
        n_estimators=120,
        max_depth=4,
        learning_rate=0.06,
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        eval_metric='logloss'
    )
    xgb_bin.fit(X_tr_b_scaled, y_tr_b)
    bin_preds = xgb_bin.predict(X_te_b_scaled)
    
    bin_acc = accuracy_score(y_te_b, bin_preds)
    bp, br, bf1, _ = precision_recall_fscore_support(y_te_b, bin_preds, average='weighted')
    print(f"Binary Test Accuracy:  {bin_acc * 100:.2f}%")
    print(f"Binary Weighted F1:    {bf1 * 100:.2f}%")
    print(classification_report(y_te_b, bin_preds, target_names=bin_labels))
    
    # ==========================================
    # SAVE MODELS & METADATA FOR PRODUCTION
    # ==========================================
    print("\n" + "="*60)
    print("[SAVING] Saving Production Artifacts...")
    
    # Save Scaler
    scaler_path = OUTPUT_DIR / "feature_scaler.joblib"
    joblib.dump(scaler, scaler_path)
    
    # Save XGBoost Model
    xgb_path = OUTPUT_DIR / "moocare_triage_xgboost.joblib"
    joblib.dump(xgb_model, xgb_path)
    
    # Save PyTorch Model
    torch_path = OUTPUT_DIR / "moocare_triage_pytorch.pth"
    torch.save({
        'state_dict': torch_model.state_dict(),
        'feature_cols': FEATURE_COLS,
        'classes': triage_labels,
        'input_dim': len(FEATURE_COLS),
        'num_classes': len(triage_labels)
    }, torch_path)
    
    # Save Report JSON
    report = {
        'dataset': 'CowRumIA-Dataset',
        'total_samples': len(df),
        'features_count': len(FEATURE_COLS),
        'classes': triage_labels,
        'xgboost': {
            'accuracy': round(float(xgb_acc), 4),
            'precision': round(float(p), 4),
            'recall': round(float(r), 4),
            'f1_weighted': round(float(f1), 4),
            'confusion_matrix': cm_xgb,
            'top_features': [
                {'rank': i+1, 'feature': FEATURE_COLS[idx], 'importance': round(float(importances[idx]), 4)}
                for i, idx in enumerate(top_indices)
            ]
        },
        'pytorch': {
            'accuracy': round(float(torch_acc), 4),
            'precision': round(float(tp), 4),
            'recall': round(float(tr), 4),
            'f1_weighted': round(float(tf1), 4),
            'confusion_matrix': cm_torch
        },
        'binary_classification': {
            'accuracy': round(float(bin_acc), 4),
            'f1_weighted': round(float(bf1), 4),
            'labels': bin_labels
        }
    }
    
    report_path = OUTPUT_DIR / "training_report.json"
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
        
    print(f"Saved Scaler:        {scaler_path}")
    print(f"Saved XGBoost Model: {xgb_path}")
    print(f"Saved PyTorch Model: {torch_path}")
    print(f"Saved Report JSON:   {report_path}")
    print("="*60)
    print("[SUCCESS] Training Pipeline Finished Successfully!")

if __name__ == '__main__':
    run_training_pipeline()
