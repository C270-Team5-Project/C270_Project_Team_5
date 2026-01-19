USE ttt_app_listweight;

CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) PRIMARY KEY,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    draws INT DEFAULT 0
);

INSERT INTO users (username, wins, losses, draws) VALUES
('Alice', 0, 0, 0),
('Bob', 0, 0, 1);


-- 'This is just temporary data, will change everything after the scoring format has been confirmed ^^' -Eleanor