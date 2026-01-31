SELECT * FROM ttt_app_listweight.leaderboard;

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

"This is the original formatting of the Scoreboard database, rewritten and implemented in my own MySQL Workbench. All changes made to the database are done on the Workbench too, so updates and changes of the databse will not be shown." -Eleanor