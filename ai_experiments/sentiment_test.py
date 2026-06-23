import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

def analyze_feedback(text):
    sia = SentimentIntensityAnalyzer()
    score = sia.polarity_scores(text)
    compound = score['compound']
    
    # 1. 🛠️ ดักจับ "คำศัพท์แจ้งซ่อม" (Keyword Matching) ก่อนเป็นอันดับแรก
    repair_keywords = ['repair', 'fix', 'broken', 'not working', 'leak', 'plumbing', 'aircon', 'air conditioner', 'water']
    
    # แปลงข้อความเป็นพิมพ์เล็กทั้งหมด เพื่อให้หาง่ายขึ้น
    text_lower = text.lower()
    is_repair_request = any(keyword in text_lower for keyword in repair_keywords)
    
    # 2. 🧠 ประมวลผลอารมณ์และแยกหมวดหมู่
    if is_repair_request:
        # ถ้ามีคำว่า ซ่อม/พัง ให้จัดกลุ่มเป็นแจ้งซ่อมทันที (และเอาสีแดง/คะแนนลบมาเตือนแอดมิน)
        sentiment = "🛠️ แจ้งซ่อม (Repair Request) 🚨"
    elif compound >= 0.4:
        sentiment = "🟢 เชิงบวก (Positive) 😊"
    elif compound <= -0.4:
        sentiment = "🔴 เชิงลบ (Negative) 😡"
    else:
        sentiment = "⚪ ทั่วไป (Neutral) 😐"
        
    print(f"\n📊 ผลวิเคราะห์: {sentiment}")
    print(f"🌡️ คะแนนอารมณ์ (Score): {compound}")
    print("-" * 50)

if __name__ == "__main__":
    print("=== 🧠 ทดสอบระบบ AI วิเคราะห์ลูกค้า (พิมพ์ 'exit' เพื่อออก) ===")
    
    # สร้าง Loop ให้โปรแกรมรอรับข้อความไปเรื่อยๆ จนกว่าเราจะพิมพ์คำว่า exit
    while True:
        print("\n👇")
        user_input = input("พิมพ์ข้อความภาษาอังกฤษที่นี่: ")
        
        if user_input.lower() == 'exit':
            print("👋 ปิดระบบทดสอบ AI...")
            break
            
        if user_input.strip() == "":
            continue
            
        analyze_feedback(user_input)