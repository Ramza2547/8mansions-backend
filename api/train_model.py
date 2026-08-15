import pandas as pd
from sklearn.ensemble import RandomForestClassifier # 🎯 เปลี่ยนจาก DecisionTree เป็น RandomForest
import joblib

# 1. โหลดข้อมูลจากไฟล์ CSV
print("Loading data...")
df = pd.read_csv('guest_data.csv')

# 2. แยกข้อมูลเป็น Features (ตัวแปรต้น) และ Targets (ตัวแปรตาม)
X = df[['Age', 'Gender', 'Budget']]
y_floor = df['Preferred_Floor']
y_view = df['Preferred_View']

# 3. เลือกใช้อัลกอริทึม Random Forest (ตามที่แจ้งอาจารย์)
print("Training models with Random Forest...")
# n_estimators=100 หมายถึงการสร้าง Decision Tree 100 ต้นมาช่วยกันโหวตคำตอบ
model_floor = RandomForestClassifier(n_estimators=100, max_depth=3, random_state=42)
model_view = RandomForestClassifier(n_estimators=100, max_depth=3, random_state=42)

# 4. สอน AI ให้เรียนรู้
model_floor.fit(X, y_floor)
model_view.fit(X, y_view)

# 5. เซฟสมอง AI ออกมาเป็นไฟล์ .pkl เพื่อเอาไปใช้ใน Django
joblib.dump(model_floor, 'ml_model_floor.pkl')
joblib.dump(model_view, 'ml_model_view.pkl')

print("✅ Random Forest Training complete! Saved as 'ml_model_floor.pkl' and 'ml_model_view.pkl'")