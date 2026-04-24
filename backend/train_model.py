import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import os

# Path to your dataset
DATA_PATH = os.path.join("..", "data", "dataset.csv")

def batch_predict(model, X, batch_size=5000):
    """Predict in chunks to avoid memory spike during predict_proba."""
    results = []
    for start in range(0, len(X), batch_size):
        chunk = X.iloc[start:start + batch_size]
        results.append(model.predict(chunk))
    return np.concatenate(results)

def train():
    if not os.path.exists(DATA_PATH):
        print(f"❌ Error: {DATA_PATH} not found. Check your 'data' folder!")
        return

    print("Reading dataset and optimizing memory...")
    df = pd.read_csv(DATA_PATH)
    
    target_col = 'diseases'
    
    # 1. Prepare Features (X) and Target (y)
    X = df.drop(target_col, axis=1).astype('int8')
    y = df[target_col]

    # 2. Drop diseases with only 1 sample (stratification requires at least 2)
    counts = y.value_counts()
    singletons = counts[counts < 2].index.tolist()
    if singletons:
        print(f"Dropping {len(singletons)} singleton disease(s) with only 1 sample...")
        mask = ~y.isin(singletons)
        X, y = X[mask], y[mask]

    # 3. Split into Train (80%) and Test (20%)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # 4. Train the Model
    print(f"Training Random Forest on {len(X_train)} samples...")
    print("This will take 5-8 minutes.")
    
    model = RandomForestClassifier(
        n_estimators=100,         # reduced from 150 — cuts model file size significantly
        max_depth=40,             # reduced from 80 — biggest RAM saver
        min_samples_split=2,
        min_samples_leaf=2,       # slightly coarser leaves — smaller tree nodes
        max_samples=0.5,          # less data per tree — smaller trees
        max_features='sqrt',
        random_state=42,
        n_jobs=-1,
        class_weight='balanced'
    )
    
    model.fit(X_train, y_train)
    
    # 5. Evaluate in batches to avoid the 284MB memory spike
    print("Evaluating in batches...")
    predictions = batch_predict(model, X_test, batch_size=5000)
    acc = accuracy_score(y_test, predictions)
    
    print("\n" + "="*35)
    print(f"✅ Final Accuracy: {acc * 100:.2f}%")
    print("="*35 + "\n")
    
    # 6. Save
    joblib.dump(model, 'symptom_model.pkl')
    joblib.dump(list(X.columns), 'model_features.pkl')
    print("✅ Model saved: symptom_model.pkl")
    print("✅ Features saved: model_features.pkl")

if __name__ == "__main__":
    train()