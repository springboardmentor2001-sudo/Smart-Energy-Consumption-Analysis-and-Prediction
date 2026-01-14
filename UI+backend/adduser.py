import sqlite3

db_name = 'smart_energy.db' 

try:
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    
    sql_query = """
    INSERT INTO users (username, email, password) 
    VALUES (?, ?, ?);
    """

    user_data = ('demo_user', 'demo@example.com', 'demo123')

    cursor.execute(sql_query, user_data)
    conn.commit()
    print(" User 'demo_user' added successfully!")

except sqlite3.Error as e:
    print(f" An error occurred: {e}")

finally:
    if conn:
        conn.close()