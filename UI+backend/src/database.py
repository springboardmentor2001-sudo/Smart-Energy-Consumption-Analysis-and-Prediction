import sqlite3
from datetime import datetime

def init_db():
    conn = sqlite3.connect('smart_energy.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Predictions table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        temperature REAL NOT NULL,
        occupancy INTEGER NOT NULL,
        hvac_usage TEXT NOT NULL,
        lighting_usage TEXT NOT NULL,
        square_footage INTEGER NOT NULL,
        renewable_energy REAL NOT NULL,
        holiday TEXT NOT NULL,
        prediction REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Chat history table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Feedback table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        feedback TEXT NOT NULL,
        rating INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    conn.commit()
    conn.close()

def save_prediction(user_id, timestamp, temperature, occupancy, hvac_usage, 
                    lighting_usage, square_footage, renewable_energy, holiday, prediction):
    conn = sqlite3.connect('smart_energy.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT INTO predictions 
    (user_id, timestamp, temperature, occupancy, hvac_usage, lighting_usage, 
     square_footage, renewable_energy, holiday, prediction) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, timestamp, temperature, occupancy, hvac_usage, lighting_usage,
          square_footage, renewable_energy, holiday, prediction))
    
    conn.commit()
    prediction_id = cursor.lastrowid
    conn.close()
    return prediction_id

def get_user_predictions(user_id):
    conn = sqlite3.connect('smart_energy.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM predictions 
    WHERE user_id = ? 
    ORDER BY created_at DESC
    ''', (user_id,))
    
    predictions = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return predictions

def save_chat_history(user_id, role, message):
    conn = sqlite3.connect('smart_energy.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT INTO chat_history (user_id, role, message) 
    VALUES (?, ?, ?)
    ''', (user_id, role, message))
    
    conn.commit()
    conn.close()

def get_chat_history(user_id, limit=50):
    conn = sqlite3.connect('smart_energy.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM chat_history 
    WHERE user_id = ? 
    ORDER BY timestamp DESC 
    LIMIT ?
    ''', (user_id, limit))
    
    history = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return history