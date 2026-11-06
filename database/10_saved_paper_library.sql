-- Add the personal library table to an existing ResearchLens database.
-- Safe to run when the table already exists; does not drop or rewrite data.
USE researchlens;

CREATE TABLE IF NOT EXISTS saved_paper (
    saved_paper_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT UNSIGNED NOT NULL,
    paper_id       BIGINT UNSIGNED NOT NULL,
    saved_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_saved_paper_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_paper_paper FOREIGN KEY (paper_id)
        REFERENCES research_paper(paper_id) ON DELETE CASCADE,
    CONSTRAINT uq_saved_paper UNIQUE (user_id, paper_id),
    INDEX idx_saved_paper_user (user_id),
    INDEX idx_saved_paper_paper (paper_id)
);
