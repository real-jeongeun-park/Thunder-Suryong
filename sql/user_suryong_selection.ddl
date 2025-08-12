DROP TABLE IF EXISTS user_suryong_selection;

CREATE TABLE user_suryong_selection (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nickname VARCHAR(50) NOT NULL,
  exam_id VARCHAR(36) NULL,
  species_code VARCHAR(50) NOT NULL,
  CONSTRAINT uq_nickname_exam UNIQUE (nickname, exam_id)
);