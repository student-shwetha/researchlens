-- =====================================================================
-- ResearchLens - 02_sample_data.sql
-- Run AFTER 01_schema.sql.   USE researchlens;
-- =====================================================================
USE researchlens;

-- NOTE: the password_hash values below are placeholders. Member 2's register
-- API will create real bcrypt hashes. Never store plain-text passwords.
INSERT INTO users (name, email, password_hash, role) VALUES
 ('Shwetha S',          'shwetha@example.com',  '$2b$10$placeholderhashADMIN000000000000000000000000000000000', 'ADMIN'),
 ('Pratistha Majumder', 'pratistha@example.com','$2b$10$placeholderhashADMIN111111111111111111111111111111111', 'ADMIN'),
 ('Arjun Rao',          'arjun@example.com',    '$2b$10$placeholderhashSTUD222222222222222222222222222222222', 'STUDENT'),
 ('Meera Nair',         'meera@example.com',    '$2b$10$placeholderhashSTUD333333333333333333333333333333333', 'STUDENT');

INSERT INTO research_domain (domain_name, description) VALUES
 ('Computer Science', 'Computing, algorithms and information systems'),
 ('Biomedical Science', 'Medicine, biology and healthcare research'),
 ('Physics', 'Fundamental physical sciences');

INSERT INTO research_subdomain (domain_id, subdomain_name, description) VALUES
 (1, 'Artificial Intelligence', 'Machine learning and reasoning systems'),
 (1, 'Databases', 'Data storage, retrieval and management'),
 (2, 'Genomics', 'Study of genomes'),
 (3, 'Quantum Physics', 'Quantum mechanics and computing');

INSERT INTO research_topic (subdomain_id, topic_name, description) VALUES
 (1, 'Natural Language Processing', 'Understanding human language by machines'),
 (1, 'Deep Learning', 'Neural networks with many layers'),
 (2, 'Query Optimization', 'Making database queries faster'),
 (2, 'Vector Databases', 'Similarity search over embeddings'),
 (3, 'Gene Editing', 'CRISPR and related techniques'),
 (4, 'Quantum Computing', 'Computation using quantum states');

INSERT INTO research_paper (title, publication_year, doi, pdf_url, abstract, journal) VALUES
 ('Attention Is All You Need', 2017, '10.5555/3295222.3295349', 'https://example.com/attention.pdf',
  'We propose the Transformer, a network architecture based solely on attention mechanisms for sequence transduction.', 'NeurIPS'),
 ('BERT: Pre-training of Deep Bidirectional Transformers', 2019, '10.18653/v1/N19-1423', 'https://example.com/bert.pdf',
  'We introduce BERT, a language representation model that pre-trains deep bidirectional representations from unlabeled text.', 'NAACL'),
 ('Efficient Query Processing in Relational Databases', 2020, '10.1000/dbqp.2020.01', 'https://example.com/dbqp.pdf',
  'This paper studies cost-based query optimization techniques for large relational database systems.', 'VLDB Journal'),
 ('Approximate Nearest Neighbor Search with Vector Indexes', 2021, '10.1000/vec.2021.07', 'https://example.com/ann.pdf',
  'We survey HNSW and IVF indexes for similarity search over high-dimensional embeddings in vector databases.', 'ACM TODS'),
 ('CRISPR-Cas9 Genome Editing: A Review', 2018, '10.1000/crispr.2018.03', 'https://example.com/crispr.pdf',
  'A review of the CRISPR-Cas9 system and its applications in precise genome editing.', 'Nature Reviews'),
 ('Quantum Supremacy Using a Programmable Processor', 2019, '10.1000/qs.2019.10', 'https://example.com/qs.pdf',
  'We report the use of a programmable superconducting processor to perform a task intractable for classical computers.', 'Nature');

INSERT INTO author (name, affiliation, email) VALUES
 ('Ashish Vaswani', 'Google Brain', 'avaswani@example.com'),
 ('Jacob Devlin',   'Google AI Language', 'jdevlin@example.com'),
 ('Priya Sharma',   'IISc Bangalore', 'psharma@example.com'),
 ('Li Wei',         'Tsinghua University', 'liwei@example.com'),
 ('Jennifer Doe',   'UC Berkeley', 'jdoe@example.com'),
 ('Frank Arute',    'Google Quantum AI', 'farute@example.com');

INSERT INTO keyword (keyword_name) VALUES
 ('transformer'), ('attention'), ('language model'), ('query optimization'),
 ('embeddings'), ('similarity search'), ('CRISPR'), ('quantum');

INSERT INTO paper_topic (paper_id, topic_id) VALUES
 (1,1),(1,2),(2,1),(2,2),(3,3),(4,4),(5,5),(6,6);

INSERT INTO paper_author (paper_id, author_id, author_order) VALUES
 (1,1,1),(2,2,1),(3,3,1),(3,4,2),(4,4,1),(4,3,2),(5,5,1),(6,6,1);

INSERT INTO paper_keyword (paper_id, keyword_id) VALUES
 (1,1),(1,2),(2,1),(2,3),(3,4),(4,5),(4,6),(5,7),(6,8);

INSERT INTO citation (citing_paper_id, cited_paper_id, citation_context) VALUES
 (2,1,'BERT builds on the Transformer architecture'),
 (4,2,'Embeddings from BERT are indexed for similarity search'),
 (4,1,'Transformer embeddings are the main input to vector indexes'),
 (4,3,'Vector indexes compared with relational query optimization');

INSERT INTO search_history (user_id, query, search_type, results_count) VALUES
 (3,'transformer','keyword',2),
 (3,'database','keyword',2),
 (4,'quantum','keyword',1);

INSERT INTO saved_search (user_id, query, search_type) VALUES
 (3,'transformer','keyword'),
 (4,'quantum','keyword');

-- =====================================================================
-- DML demonstration: UPDATE / DELETE / extra INSERT
-- =====================================================================
UPDATE research_paper SET journal = 'NeurIPS 2017' WHERE paper_id = 1;
UPDATE research_paper SET publication_year = 2020 WHERE paper_id = 4;  -- (we will reverse this below)
UPDATE research_paper SET publication_year = 2021 WHERE paper_id = 4;

INSERT INTO keyword (keyword_name) VALUES ('temporary keyword');
DELETE FROM keyword WHERE keyword_name = 'temporary keyword';

-- =====================================================================
-- SELECT demonstration queries (screenshot each for the report)
-- =====================================================================

-- Q1. JOIN: paper list with authors (in author order) and journal
SELECT p.paper_id, p.title, p.publication_year, p.journal,
       GROUP_CONCAT(a.name ORDER BY pa.author_order SEPARATOR ', ') AS authors
FROM research_paper p
JOIN paper_author pa ON pa.paper_id = p.paper_id
JOIN author a        ON a.author_id = pa.author_id
GROUP BY p.paper_id, p.title, p.publication_year, p.journal
ORDER BY p.publication_year DESC;

-- Q2. Full hierarchy join: domain > subdomain > topic > paper
SELECT d.domain_name, s.subdomain_name, t.topic_name, p.title
FROM research_domain d
JOIN research_subdomain s ON s.domain_id = d.domain_id
JOIN research_topic t     ON t.subdomain_id = s.subdomain_id
JOIN paper_topic pt       ON pt.topic_id = t.topic_id
JOIN research_paper p     ON p.paper_id = pt.paper_id
ORDER BY d.domain_name, s.subdomain_name, t.topic_name;

-- Q3. GROUP BY + aggregate: papers per domain
SELECT d.domain_name, COUNT(DISTINCT pt.paper_id) AS paper_count
FROM research_domain d
LEFT JOIN research_subdomain s ON s.domain_id = d.domain_id
LEFT JOIN research_topic t     ON t.subdomain_id = s.subdomain_id
LEFT JOIN paper_topic pt       ON pt.topic_id = t.topic_id
GROUP BY d.domain_name
ORDER BY paper_count DESC;

-- Q4. HAVING: authors with more than one paper
SELECT a.name, COUNT(*) AS papers_written
FROM author a
JOIN paper_author pa ON pa.author_id = a.author_id
GROUP BY a.author_id, a.name
HAVING COUNT(*) > 1;

-- Q5. Aggregate functions: stats per publication year
SELECT publication_year, COUNT(*) AS papers
FROM research_paper
GROUP BY publication_year
ORDER BY publication_year;

-- Q6. Subquery: papers cited more than the average citation count
SELECT p.title, c.cnt
FROM research_paper p
JOIN (SELECT cited_paper_id, COUNT(*) AS cnt FROM citation GROUP BY cited_paper_id) c
  ON c.cited_paper_id = p.paper_id
WHERE c.cnt > (SELECT AVG(cnt) FROM (SELECT COUNT(*) AS cnt FROM citation GROUP BY cited_paper_id) x);

-- Q7. Subquery with NOT EXISTS: papers never cited
SELECT title FROM research_paper p
WHERE NOT EXISTS (SELECT 1 FROM citation c WHERE c.cited_paper_id = p.paper_id);

-- Q8. Full-text search (advanced feature)
SELECT paper_id, title,
       MATCH(title, abstract) AGAINST ('vector similarity embeddings' IN NATURAL LANGUAGE MODE) AS relevance
FROM research_paper
WHERE MATCH(title, abstract) AGAINST ('vector similarity embeddings' IN NATURAL LANGUAGE MODE)
ORDER BY relevance DESC;

-- Q9. Index usage proof (use in the demo)
EXPLAIN SELECT * FROM research_paper WHERE publication_year = 2019;
