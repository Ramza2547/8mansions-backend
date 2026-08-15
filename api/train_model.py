import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib

print("Generating 300 synthetic records for Random Forest...")
np.random.seed(42)
n_samples = 300

# สร้างข้อมูลจำลอง 5 ตัวแปร
ages = np.random.randint(18, 65, n_samples)
genders = np.random.randint(0, 2, n_samples)
budgets = np.random.randint(10000, 25000, n_samples)
occupants = np.random.randint(1, 3, n_samples)
durations = np.random.choice([1, 6, 12], n_samples)

floors = np.where((ages > 45) | (occupants == 2), 1, 2)
views = np.where(budgets > 13000, np.where(genders == 1, 'Sunrise', 'Sunset'), 'No sunlight')

df = pd.DataFrame({
    'Age': ages, 'Gender': genders, 'Budget': budgets,
    'Occupants': occupants, 'Duration': durations,
    'Preferred_Floor': floors, 'Preferred_View': views
})

# 🎯 เซฟข้อมูล 300 แถวลงไฟล์ CSV ให้อาจารย์ดู
df.to_csv('guest_data.csv', index=False)
print("✅ Saved 300 records to 'guest_data.csv'")

# เตรียม Features และ Targets
X = df[['Age', 'Gender', 'Budget', 'Occupants', 'Duration']]
y_floor = df['Preferred_Floor']
y_view = df['Preferred_View']

print("Training Random Forest Models...")
model_floor = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
model_view = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)

model_floor.fit(X, y_floor)
model_view.fit(X, y_view)

joblib.dump(model_floor, 'ml_model_floor.pkl')
joblib.dump(model_view, 'ml_model_view.pkl')
print("✅ Successfully trained and saved models!")