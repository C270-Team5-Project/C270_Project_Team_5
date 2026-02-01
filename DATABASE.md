======== CONNECTION DETAILS ========
//These are the details that to be be used to access the database. Our team is using files.io to host the database, and MySQL Workbench is what we are using to access the database locally. 

container_name: ttt_app
database environment:
  DB_HOST: yttlzg.h.filess.io
  DB_PORT: 3307
  DB_NAME: ttt_app_listweight
  DB_USER: ttt_app_listweight
  DB_PASSWORD: 15c5b65ce12d927dd44652183d83a44196a54474


======== SQL FORMATTING ========
//This is the SQL format used to get the original Leaderboard/scoreboard database and written on MySQL Workbench. All changes or additions added to the database do not show up in GitHub, so we have to manually check the database in the Workbench. 

CREATE TABLE IF NOT EXISTS leaderboard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    best_score INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_best_score (best_score DESC)
);

INSERT INTO leaderboard (name, best_score) VALUES
    ('Player 1', 3126),
    ('Player 2', 2864),
    ('Player 3', 2021),
    ('Player 4', 1796),
    ('Player 5', 1642),
    ('Player 6', 1627),
    ('Player 7', 1555)
ON DUPLICATE KEY UPDATE best_score = VALUES(best_score);

======== ADDITIONAL DETAILS ========
- filess.io URL = https://panel.filess.io/shared/8560ca9f-096d-4410-8b0d-e72cee1e0f6a
- Use 'SELECT * FROM ttt_app_listweight.leaderboard;' to preview the entire table, and run using the 'Under Keyboard Cursor' button. 
- Inside MySQL, there is an "Edit" section for the tables. This is used if we want to delete or rename variables inside the databse. Adding new values are not reccomended to be done with Workbench, but it is possible. 
- If there is any problems with the Database, please let Eleanor know before making tweaks ^u^
