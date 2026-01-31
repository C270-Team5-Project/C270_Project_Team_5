from flask import Flask, render_template, jsonify, request
import mysql.connector
from mysql.connector import Error
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import time

app = Flask(__name__)

# Prometheus metrics
request_count = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
request_duration = Histogram('http_request_duration_seconds', 'HTTP request duration')
db_connection_errors = Counter('db_connection_errors_total', 'Database connection errors')
leaderboard_updates = Counter('leaderboard_updates_total', 'Leaderboard updates', ['action'])

# Database configuration
DB_CONFIG = {
    'host': 'yttlzg.h.filess.io',
    'port': 3307,
    'database': 'ttt_app_listweight',
    'user': 'ttt_app_listweight',
    'password': '15c5b65ce12d927dd44652183d83a44196a54474'
}

def get_db_connection():
    """Create and return a database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        db_connection_errors.inc()
        return None

@app.before_request
def before_request():
    """Track request start time"""
    request.start_time = time.time()

@app.after_request
def after_request(response):
    """Record request metrics"""
    if hasattr(request, 'start_time'):
        request_duration.observe(time.time() - request.start_time)
    request_count.labels(request.method, request.endpoint or 'unknown', response.status_code).inc()
    return response

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/metrics")
def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}

@app.route("/api/leaderboard", methods=["GET"])
def get_leaderboard():
    """Fetch top 10 players from the leaderboard"""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT name, best_score as best 
            FROM leaderboard 
            ORDER BY best_score DESC 
            LIMIT 10
        """
        cursor.execute(query)
        results = cursor.fetchall()
        cursor.close()
        connection.close()
        
        return jsonify(results), 200
    except Error as e:
        print(f"Error fetching leaderboard: {e}")
        return jsonify({"error": "Failed to fetch leaderboard"}), 500

@app.route("/api/leaderboard", methods=["POST"])
def add_score():
    """Add or update a player's score in the leaderboard"""
    data = request.get_json()
    
    if not data or 'name' not in data or 'score' not in data:
        return jsonify({"error": "Missing name or score"}), 400
    
    player_name = data['name'].strip()
    score = int(data['score'])
    
    if not player_name:
        return jsonify({"error": "Name cannot be empty"}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Check if player exists
        check_query = "SELECT id, best_score FROM leaderboard WHERE name = %s"
        cursor.execute(check_query, (player_name,))
        existing_player = cursor.fetchone()
        
        if existing_player:
            # Update only if new score is higher
            if score > existing_player['best_score']:
                update_query = "UPDATE leaderboard SET best_score = %s WHERE id = %s"
                cursor.execute(update_query, (score, existing_player['id']))
                connection.commit()
                leaderboard_updates.labels(action='update').inc()
                message = f"Updated {player_name}'s score to {score}"
            else:
                message = f"Score not updated. Current best: {existing_player['best_score']}"
        else:
            # Insert new player
            insert_query = "INSERT INTO leaderboard (name, best_score) VALUES (%s, %s)"
            cursor.execute(insert_query, (player_name, score))
            connection.commit()
            leaderboard_updates.labels(action='insert').inc()
            message = f"Added {player_name} to leaderboard with score {score}"
        
        cursor.close()
        connection.close()
        
        return jsonify({"success": True, "message": message}), 200
    except Error as e:
        print(f"Error updating leaderboard: {e}")
        return jsonify({"error": "Failed to update leaderboard"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=False, port=3306)
