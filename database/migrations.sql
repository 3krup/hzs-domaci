-- Pravljenje bazee
CREATE DATABASE IF NOT EXISTS fitplate
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE fitplate;

--Reset baze ako vec postoji
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS saved_recipes;
DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

--Kreiranje tabela

-- Tabela korisnika
CREATE TABLE users (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela recepata
CREATE TABLE recipes (
                         id INT AUTO_INCREMENT PRIMARY KEY,
                         user_id INT NOT NULL,
                         title VARCHAR(255) NOT NULL,
                         description TEXT,
                         preparation_steps TEXT NOT NULL,
                         prep_time_minutes INT,
                         difficulty ENUM('Lako', 'Srednje', 'Teško') DEFAULT 'Srednje',

    -- Nutritivne vrednosti
                         kcal INT DEFAULT 0,
                         protein DECIMAL(5,2) DEFAULT 0,
                         fat DECIMAL(5,2) DEFAULT 0,

    -- Slika
                         image_url VARCHAR(255),

                         is_posno BOOLEAN DEFAULT FALSE,
                         is_halal BOOLEAN DEFAULT FALSE,
                         views_count INT DEFAULT 0,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Tabela sastojaka
CREATE TABLE ingredients (
                             id INT AUTO_INCREMENT PRIMARY KEY,
                             name VARCHAR(100) NOT NULL UNIQUE
);

-- Tabela: Recept <-> Sastojci
CREATE TABLE recipe_ingredients (
                                    recipe_id INT NOT NULL,
                                    ingredient_id INT NOT NULL,
                                    quantity VARCHAR(100), -- npr. 200g, 2 kasike, 3 solje

                                    PRIMARY KEY (recipe_id, ingredient_id),
                                    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
                                    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

-- Tabela: Korisnik <-> Sacuvani recepti
CREATE TABLE saved_recipes (
                               user_id INT NOT NULL,
                               recipe_id INT NOT NULL,
                               saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                               PRIMARY KEY (user_id, recipe_id),
                               FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                               FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);


--UPDATE


ALTER TABLE recipes ADD COLUMN meal_type VARCHAR(20) DEFAULT NULL;

-- UNOS TEST PODATAKA (SEED)

-- Unos 2 korisnika (sifre su hashovane, ovde samo primeri)
INSERT INTO users (email, password_hash) VALUES
                                             ('admin@recepti.com', '$2y$10$primerhashsifre123'),
                                             ('pera@gmail.com', '$2y$10$primerhashsifre456');

-- Unos osnovnih sastojaka
INSERT INTO ingredients (name) VALUES
                                   ('Jaja'), ('Brašno'), ('Mleko'), ('Šećer'), ('So'), ('Piletina'), ('Pirinač'), ('Ulje');

-- Unos recepta 1: Palacinke (Korisnik ID 1)
INSERT INTO recipes (user_id, title, description, preparation_steps, prep_time_minutes, difficulty, kcal, protein, fat, is_posno, is_halal, views_count)
VALUES (1, 'Domaće Palačinke', 'Najbolje palačinke po bakinom receptu.', '1. Umutiti jaja. 2. Dodati mleko i brašno. 3. Peći na tiganju.', 30, 'Lako', 250, 6.5, 10.0, FALSE, TRUE, 150);

-- Unos recepta 2: Piletina sa pirincem (Korisnik ID 2)
INSERT INTO recipes (user_id, title, description, preparation_steps, prep_time_minutes, difficulty, kcal, protein, fat, is_posno, is_halal, views_count)
VALUES (2, 'Pilav sa piletinom', 'Zdrav ručak pun proteina.', '1. Propržiti piletinu. 2. Dodati pirinač i vodu. 3. Kuvati dok voda ne ispari.', 45, 'Srednje', 450, 35.0, 12.0, FALSE, TRUE, 85);

-- Povezivanje sastojaka sa Palacinkama (ID recepta 1)
-- Pretpostavljamo ID-jeve: Jaja=1, Brašno=2, Mleko=3, Ulje=8
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
                                                                        (1, 1, '2 komada'),
                                                                        (1, 2, '200g'),
                                                                        (1, 3, '300ml'),
                                                                        (1, 8, 'po potrebi');

-- Povezivanje sastojaka sa Piletinom (ID recepta 2)
-- Piletina=6, Pirinač=7, So=5, Ulje=8
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
                                                                        (2, 6, '500g'),
                                                                        (2, 7, '2 solje'),
                                                                        (2, 5, 'prstohvat'),
                                                                        (2, 8, '2 kasike');

-- Korisnik 2 cuva recept 1
INSERT INTO saved_recipes (user_id, recipe_id) VALUES (2, 1);