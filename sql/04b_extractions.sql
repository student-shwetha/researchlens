-- Data Matrix extraction records and demo consensus labels.
-- Run after sql/04_member2_advanced.sql. Demo rows are explicitly marked
-- and have no source quotation; replace them with verified paper passages.
USE researchlens;

CREATE TABLE IF NOT EXISTS paper_extraction (
    paper_id       BIGINT UNSIGNED NOT NULL,
    field_key      VARCHAR(32) NOT NULL,
    extracted_text TEXT NOT NULL,
    numeric_value  BIGINT UNSIGNED,
    source_quote   TEXT,
    source_section VARCHAR(150),
    confidence     DECIMAL(4,3),
    origin         VARCHAR(12) NOT NULL DEFAULT 'source',
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (paper_id, field_key),
    CONSTRAINT fk_extraction_paper FOREIGN KEY (paper_id)
        REFERENCES research_paper(paper_id) ON DELETE CASCADE,
    CONSTRAINT chk_extraction_field
        CHECK (field_key IN ('summary','methodology','sample_size','limitations')),
    CONSTRAINT chk_extraction_origin CHECK (origin IN ('source','demo','abstract','unavailable')),
    CONSTRAINT chk_extraction_confidence
        CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1)
);

CREATE TABLE IF NOT EXISTS matrix_claim (
    claim_id   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    claim_text VARCHAR(500) NOT NULL UNIQUE,
    basis      VARCHAR(10) NOT NULL DEFAULT 'source',
    CONSTRAINT chk_matrix_claim_basis CHECK (basis IN ('source','demo'))
);

CREATE TABLE IF NOT EXISTS matrix_claim_stance (
    claim_id BIGINT UNSIGNED NOT NULL,
    paper_id BIGINT UNSIGNED NOT NULL,
    stance   VARCHAR(12) NOT NULL,
    PRIMARY KEY (claim_id, paper_id),
    CONSTRAINT fk_claim_stance_claim FOREIGN KEY (claim_id)
        REFERENCES matrix_claim(claim_id) ON DELETE CASCADE,
    CONSTRAINT fk_claim_stance_paper FOREIGN KEY (paper_id)
        REFERENCES research_paper(paper_id) ON DELETE CASCADE,
    CONSTRAINT chk_matrix_claim_stance
        CHECK (stance IN ('supports','mixed','contradicts'))
);

INSERT INTO paper_extraction
    (paper_id, field_key, extracted_text, numeric_value, source_quote, source_section, confidence, origin)
SELECT p.paper_id, d.field_key, d.extracted_text, d.numeric_value, NULL, 'Demo data', NULL, 'demo'
  FROM research_paper p
  JOIN (
    SELECT 'Attention Is All You Need' AS paper_title, 'summary' AS field_key,
           'Demo value: Studies an attention-based architecture for sequence transduction.' AS extracted_text,
           NULL AS numeric_value
    UNION ALL SELECT 'Attention Is All You Need', 'methodology',
           'Demo value: Compares attention-based sequence models with recurrent and convolutional approaches.', NULL
    UNION ALL SELECT 'Attention Is All You Need', 'sample_size',
           'Demo value: Training-corpus size shown for interface testing only.', 45000000
    UNION ALL SELECT 'Attention Is All You Need', 'limitations',
           'Demo value: Computational cost and training-data requirements are considerations.', NULL
    UNION ALL SELECT 'Efficient Query Processing in Relational Databases', 'summary',
           'Demo value: Examines cost-based query optimization in relational databases.', NULL
    UNION ALL SELECT 'Efficient Query Processing in Relational Databases', 'methodology',
           'Demo value: Evaluates query plans using cost estimates.', NULL
    UNION ALL SELECT 'Efficient Query Processing in Relational Databases', 'sample_size',
           'Demo value: Dataset size shown for interface testing only.', 1000000
    UNION ALL SELECT 'Efficient Query Processing in Relational Databases', 'limitations',
           'Demo value: Results may depend on the workload and cost model.', NULL
    UNION ALL SELECT 'Approximate Nearest Neighbor Search with Vector Indexes', 'summary',
           'Demo value: Surveys approximate-nearest-neighbour indexes for embedding search.', NULL
    UNION ALL SELECT 'Approximate Nearest Neighbor Search with Vector Indexes', 'methodology',
           'Demo value: Describes and compares HNSW and IVF indexing approaches.', NULL
    UNION ALL SELECT 'Approximate Nearest Neighbor Search with Vector Indexes', 'sample_size',
           'Demo value: Vector count shown for interface testing only.', 10000000
    UNION ALL SELECT 'Approximate Nearest Neighbor Search with Vector Indexes', 'limitations',
           'Demo value: Index accuracy, memory use, and update costs can trade off.', NULL
    UNION ALL SELECT 'CRISPR-Cas9 Genome Editing: A Review', 'summary',
           'Demo value: Reviews CRISPR-Cas9 and its genome-editing applications.', NULL
    UNION ALL SELECT 'CRISPR-Cas9 Genome Editing: A Review', 'methodology',
           'Demo value: Narrative review of genome-editing methods and applications.', NULL
    UNION ALL SELECT 'CRISPR-Cas9 Genome Editing: A Review', 'sample_size',
           'Demo value: Not applicable to this review. Value shown only for interface testing.', NULL
    UNION ALL SELECT 'CRISPR-Cas9 Genome Editing: A Review', 'limitations',
           'Demo value: A review depends on the scope and coverage of the included literature.', NULL
  ) d ON d.paper_title = p.title
ON DUPLICATE KEY UPDATE
    extracted_text = VALUES(extracted_text),
    numeric_value = VALUES(numeric_value),
    source_quote = VALUES(source_quote),
    source_section = VALUES(source_section),
    confidence = VALUES(confidence),
    origin = VALUES(origin);

INSERT INTO matrix_claim (claim_text, basis) VALUES
    ('Attention-based models are used for language and sequence tasks.', 'demo'),
    ('Learned or vector indexes can improve retrieval efficiency.', 'demo'),
    ('Reported conclusions depend on the data and evaluation setup.', 'demo')
ON DUPLICATE KEY UPDATE basis = VALUES(basis);

INSERT INTO matrix_claim_stance (claim_id, paper_id, stance)
SELECT c.claim_id, p.paper_id, s.stance
  FROM (
    SELECT 'Attention-based models are used for language and sequence tasks.' AS claim_text,
           'Attention Is All You Need' AS paper_title, 'supports' AS stance
    UNION ALL SELECT 'Attention-based models are used for language and sequence tasks.',
           'BERT: Pre-training of Deep Bidirectional Transformers', 'supports'
    UNION ALL SELECT 'Attention-based models are used for language and sequence tasks.',
           'Highly Accurate Protein Structure Prediction with AlphaFold', 'supports'
    UNION ALL SELECT 'Learned or vector indexes can improve retrieval efficiency.',
           'Approximate Nearest Neighbor Search with Vector Indexes', 'supports'
    UNION ALL SELECT 'Learned or vector indexes can improve retrieval efficiency.',
           'The Case for Learned Index Structures', 'supports'
    UNION ALL SELECT 'Learned or vector indexes can improve retrieval efficiency.',
           'Billion-Scale Similarity Search with GPUs', 'supports'
    UNION ALL SELECT 'Reported conclusions depend on the data and evaluation setup.',
           'Efficient Query Processing in Relational Databases', 'mixed'
    UNION ALL SELECT 'Reported conclusions depend on the data and evaluation setup.',
           'Approximate Nearest Neighbor Search with Vector Indexes', 'mixed'
  ) s
  JOIN matrix_claim c ON c.claim_text = s.claim_text
  JOIN research_paper p ON p.title = s.paper_title
ON DUPLICATE KEY UPDATE stance = VALUES(stance);
