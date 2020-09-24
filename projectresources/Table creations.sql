CREATE TABLE islands(
    island_id INT NOT NULL AUTO_INCREMENT,
    island_name VARCHAR(10) NOT NULL,
    PRIMARY KEY (island_id)
);

CREATE TABLE player_collectibles(
    item_name VARCHAR(20) NOT NULL,
    item_type VARCHAR(20) NOT NULL,
    PRIMARY KEY(item_name)
);

CREATE TABLE island_collectibles(
    item_name VARCHAR(20) NOT NULL,
    item_type VARCHAR(20) NOT NULL,
    PRIMARY KEY(item_name)
);

CREATE TABLE users(
    user_name VARCHAR(16) NOT NULL,
    char_name VARCHAR(16) NOT NULL,
    password CHAR(60) NOT NULL,
    island_id INT NOT NULL,
    PRIMARY KEY(user_name),
    FOREIGN KEY(island_id)
       REFERENCES islands(island_id)
       ON DELETE CASCADE
);

CREATE TABLE user_relationships(
    user_name_1 VARCHAR(16) NOT NULL,
    user_name_2 VARCHAR(16) NOT NULL,
    PRIMARY KEY (user_name_1, user_name_2),
    FOREIGN KEY (user_name_1)
        REFERENCES users(user_name)
        ON DELETE CASCADE,
    FOREIGN KEY (user_name_2)
        REFERENCES users(user_name)
        ON DELETE CASCADE
);

CREATE TABLE island_collections(
    island_id INT NOT NULL,
    item_name VARCHAR(20) NOT NULL,
    PRIMARY KEY (island_id, item_name),
    FOREIGN KEY (island_id)
        REFERENCES islands(island_id)
        ON DELETE CASCADE,
    FOREIGN KEY (item_name)
        REFERENCES island_collectibles(item_name)
);

CREATE TABLE player_collections(
    user_name VARCHAR(16) NOT NULL,
    item_name VARCHAR(20) NOT NULL,
    FOREIGN KEY (user_name)
        REFERENCES users(user_name)
        ON DELETE CASCADE,
    FOREIGN KEY (item_name)
        REFERENCES player_collectibles(item_name)
);