import pandas as pd
from sklearn.tree import DecisionTreeClassifier
import joblib

# 1. โหลดข้อมูลจากไฟล์ CSV
print("Loading data...")
df = pd.read_csv('guest_data.csv')

# 2. แยกข้อมูลเป็น Features (ตัวแปรต้น) และ Targets (ตัวแปรตามที่เราอยากให้ AI ทาย)
X = df[['Age', 'Gender', 'Budget']]
y_floor = df['Preferred_Floor']
y_view = df['Preferred_View']

# 3. เลือกใช้อัลกอริทึม Decision Tree (ต้นไม้ตัดสินใจ)
print("Training models...")
model_floor = DecisionTreeClassifier(max_depth=3, random_state=42)
model_view = DecisionTreeClassifier(max_depth=3, random_state=42)

# 4. สอน AI ให้เรียนรู้
model_floor.fit(X, y_floor)
model_view.fit(X, y_view)

# 5. เซฟสมอง AI ออกมาเป็นไฟล์ .pkl เพื่อเอาไปใช้ใน Django
joblib.dump(model_floor, 'ml_model_floor.pkl')
joblib.dump(model_view, 'ml_model_view.pkl')

print("✅ Training complete! Saved as 'ml_model_floor.pkl' and 'ml_model_view.pkl'")