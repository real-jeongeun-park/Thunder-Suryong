// 최초 실행용

CREATE TABLE IF NOT EXISTS SURYONG (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  species_code VARCHAR(20) NOT NULL,   -- 'water' | 'grass' | 'thunder'
  bucket       INT NOT NULL,           -- 0 | 20 | 50 | 80 | 90 | 100
  asset_key    VARCHAR(255) NOT NULL   -- 이미지 URL 또는 앱 리소스 키
);
CREATE INDEX IF NOT EXISTS idx_suryong_sb ON SURYONG(species_code, bucket);

INSERT INTO SURYONG (SPECIES_CODE, BUCKET, ASSET_KEY) VALUES
('water',  33, '33_water1.png'),
('water',  33, '33_water2.png'),
('thunder',33, '33_thunder1.png'),
('thunder',33, '33_thunder2.png'),
('grass',  33, '33_grass1.png'),
('water',  66, '66_water1.png'),
('thunder',66, '66_thunder1.png'),
('thunder',66, '66_thunder2.png'),
('thunder',66, '66_thunder3.png'),
('grass',  66, '66_grass1.png'),
('grass',  66, '66_grass2.png'),
('water', 100, '100_water1.png'),
('thunder',100,'100_thunder1.png'),
('thunder',100,'100_thunder2.png'),
('grass', 100,'100_grass1.png');
