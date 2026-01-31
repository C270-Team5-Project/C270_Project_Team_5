from flask import Flask, render_template, jsonify, request
import mysql.connector
import os
from datetime import datetime, timedelta

app = Flask(__name__)

# Database configuration from environment variables
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'yttlzg.h.filess.io'),
    'port': int(os.getenv('DB_PORT', 3307)),
    'database': os.getenv('DB_NAME', 'ttt_app_listweight'),
    'user': os.getenv('DB_USER', 'ttt_app_listweight'),
    'password': os.getenv('DB_PASSWORD', '15c5b65ce12d927dd44652183d83a44196a54474')
}

def get_db_connection():
    """Create and return a database connection"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None

def init_db():
    """Initialize the database table if it doesn't exist"""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS leaderboard (
                id INT AUTO_INCREMENT PRIMARY KEY,
                player_name VARCHAR(100) NOT NULL,
                score INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_score (score),
                INDEX idx_created (created_at)
            )
        """)
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except mysql.connector.Error as err:
        print(f"Error creating table: {err}")
        return False

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/leaderboard", methods=['GET'])
def get_leaderboard():
    """Get top 10 players from the last week"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Get scores from the last 7 days
        week_ago = datetime.now() - timedelta(days=7)
        
        cursor.execute("""
            SELECT player_name as name, MAX(score) as best
            FROM leaderboard
            WHERE created_at >= %s
            GROUP BY player_name
            ORDER BY best DESC
            LIMIT 10
        """, (week_ago,))
        
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify(results)
    except mysql.connector.Error as err:
        print(f"Error fetching leaderboard: {err}")
        return jsonify({'error': 'Failed to fetch leaderboard'}), 500

@app.route("/api/score", methods=['POST'])
def save_score():
    """Save a player's score"""
    data = request.get_json()
    
    if not data or 'player_name' not in data or 'score' not in data:
        return jsonify({'error': 'Missing player_name or score'}), 400
    
    player_name = data['player_name'].strip()
    score = int(data['score'])
    
    if not player_name or len(player_name) > 100:
        return jsonify({'error': 'Invalid player name'}), 400
    
    if score < 0:
        return jsonify({'error': 'Invalid score'}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO leaderboard (player_name, score)
            VALUES (%s, %s)
        """, (player_name, score))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Score saved'}), 201
    except mysql.connector.Error as err:
        print(f"Error saving score: {err}")
        return jsonify({'error': 'Failed to save score'}), 500

# Initialize database on startup
with app.app_context():
    init_db()

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=False, port=3306)
