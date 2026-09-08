import pandas as pd
import numpy as np
import time
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score, f1_score
import joblib

print("Generating 500 Historical Baseline Records...")
np.random.seed(42)
n_samples = 500

# 1. สร้างข้อมูล 10 ตัวแปร
ages = np.random.randint(18, 65, n_samples)
genders = np.random.randint(0, 2, n_samples)
budgets = np.random.randint(10000, 25000, n_samples)
occupants = np.random.randint(1, 3, n_samples)
durations = np.random.choice([1, 6, 12], n_samples)
occupations = np.random.randint(0, 3, n_samples) 
personalities = np.random.randint(0, 2, n_samples) 
wfh_status = np.random.randint(0, 2, n_samples) 
has_vehicle = np.random.randint(0, 2, n_samples) 
heavy_luggage = np.random.randint(0, 2, n_samples) 

# 2. กำหนดตรรกะความต้องการ (Behavioral Logic)
floors = np.where((ages > 45) | (has_vehicle == 1) | (heavy_luggage == 1), 1, 2)
floors = np.where(np.random.rand(n_samples) > 0.85, np.random.choice([1, 2], n_samples), floors)

views = []
for i in range(n_samples):
    if budgets[i] < 12000:
        views.append('No sunlight')
    else:
        if wfh_status[i] == 1 or personalities[i] == 0:
            views.append('Sunset')
        else:
            views.append('Sunrise')

df = pd.DataFrame({
    'Age': ages, 'Gender': genders, 'Budget': budgets, 'Occupants': occupants,
    'Duration': durations, 'Occupation': occupations, 'Personality': personalities,
    'WFH': wfh_status, 'Vehicle': has_vehicle, 'Luggage': heavy_luggage,
    'Preferred_Floor': floors, 'Preferred_View': views
})

df.to_csv('historical_room_data.csv', index=False)
print("Saved 500 records to 'historical_room_data.csv'")

# 3. เตรียม Features และ Targets
X = df[['Age', 'Gender', 'Budget', 'Occupants', 'Duration', 'Occupation', 'Personality', 'WFH', 'Vehicle', 'Luggage']]
y_floor = df['Preferred_Floor']
y_view = df['Preferred_View']

X_train, X_test, y_train_floor, y_test_floor = train_test_split(X, y_floor, test_size=0.2, random_state=42)

# 4. ทดสอบเปรียบเทียบโมเดลเชิงลึก (Deep Evaluation)
models = {
    "Decision Tree": DecisionTreeClassifier(random_state=42),
    "SVM": SVC(random_state=42),
    "Naive Bayes": GaussianNB(),
    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42)
}

print("\n" + "="*85)
print(f"{'Algorithm':<15} | {'Accuracy':<10} | {'F1 (Macro)':<10} | {'CV (Mean ± SD)':<18} | {'Inference Time'}")
print("="*85)

for name, model in models.items():
    # 1. Cross Validation (5-Fold)
    cv_scores = cross_val_score(model, X, y_floor, cv=5)
    cv_mean = cv_scores.mean() * 100
    cv_std = cv_scores.std() * 100
    
    # 2. Train Model
    model.fit(X_train, y_train_floor)
    
    # 3. Inference Time
    start_time = time.time()
    preds = model.predict(X_test)
    inference_time = (time.time() - start_time) * 1000 # แปลงเป็นหน่วย milliseconds (ms)
    
    # 4. Accuracy & F1 Score
    acc = accuracy_score(y_test_floor, preds) * 100
    f1 = f1_score(y_test_floor, preds, average='macro')
    
    print(f"{name:<15} | {acc:>6.2f}%    | {f1:>10.4f} | {cv_mean:>6.2f}% ± {cv_std:>4.2f}% | {inference_time:>9.2f} ms")

print("="*85)

# 5. บันทึกเฉพาะ Random Forest ไปใช้งานจริง
rf_floor = RandomForestClassifier(n_estimators=100, random_state=42)
rf_floor.fit(X, y_floor)

rf_view = RandomForestClassifier(n_estimators=100, random_state=42)
rf_view.fit(X, y_view)

joblib.dump(rf_floor, 'ml_model_floor.pkl')
joblib.dump(rf_view, 'ml_model_view.pkl')
print("\nSuccessfully trained and saved Random Forest models!")