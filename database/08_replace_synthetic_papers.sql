-- Replace synthetic sample rows with identifiable, sourceable research papers.
-- Safe to run repeatedly. Run after sql/07_repair_sample_paper_links.sql.
USE researchlens;

UPDATE research_paper
   SET title = 'Learning to Optimize Join Queries With Deep Reinforcement Learning',
       publication_year = 2018,
       doi = '10.48550/arxiv.1808.03196',
       pdf_url = 'https://arxiv.org/pdf/1808.03196',
       abstract = 'We study deep reinforcement learning for join-query optimization, training agents to choose join orders and evaluating their performance across database systems.',
       journal = 'SIGMOD'
 WHERE title = 'Efficient Query Processing in Relational Databases'
   AND publication_year = 2020;

UPDATE research_paper
   SET title = 'Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs',
       publication_year = 2020,
       doi = '10.1109/tpami.2018.2889473',
       pdf_url = 'https://arxiv.org/pdf/1603.09320',
       abstract = 'We introduce Hierarchical Navigable Small World graphs for approximate nearest-neighbor search and evaluate their search efficiency, accuracy, and memory tradeoffs.',
       journal = 'IEEE Transactions on Pattern Analysis and Machine Intelligence'
 WHERE title = 'Approximate Nearest Neighbor Search with Vector Indexes'
   AND publication_year = 2021;

UPDATE research_paper
   SET title = 'Development and Applications of CRISPR-Cas9 for Genome Engineering',
       publication_year = 2014,
       doi = '10.1016/j.cell.2014.05.010',
       pdf_url = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4089965/pdf/nihms-609112.pdf',
       abstract = 'This review describes the CRISPR-Cas9 genome-engineering system, its mechanisms and applications, and key challenges such as specificity and delivery.',
       journal = 'Cell'
 WHERE title = 'CRISPR-Cas9 Genome Editing: A Review'
   AND publication_year = 2018;

UPDATE research_paper
   SET title = 'Learned Cardinalities: Estimating Correlated Joins with Deep Learning',
       publication_year = 2019,
       doi = '10.48550/arxiv.1809.00677',
       pdf_url = 'https://arxiv.org/pdf/1809.00677',
       abstract = 'We introduce a deep-learning approach for estimating cardinalities of correlated joins and evaluate its accuracy and impact on query optimization.',
       journal = 'CIDR'
 WHERE title = 'Learned Cardinality Estimation for Query Optimization'
   AND publication_year = 2019;

UPDATE research_paper
   SET title = 'A Comprehensive Survey on Graph Neural Networks',
       publication_year = 2021,
       doi = '10.1109/tnnls.2020.2978386',
       pdf_url = 'https://arxiv.org/pdf/1901.00596',
       abstract = 'This survey reviews graph neural network methods, their applications, and open challenges, covering graph convolutional, recurrent, and attention-based approaches.',
       journal = 'IEEE Transactions on Neural Networks and Learning Systems'
 WHERE title = 'Graph Neural Networks Survey'
   AND publication_year = 2022;

INSERT INTO author (name)
SELECT 'Sanjay Krishnan'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Sanjay Krishnan');
INSERT INTO author (name)
SELECT 'Zongheng Yang'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Zongheng Yang');
INSERT INTO author (name)
SELECT 'Ken Goldberg'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Ken Goldberg');
INSERT INTO author (name)
SELECT 'Joseph Hellerstein'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Joseph Hellerstein');
INSERT INTO author (name)
SELECT 'Ion Stoica'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Ion Stoica');
INSERT INTO author (name)
SELECT 'Yury A. Malkov'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Yury A. Malkov');
INSERT INTO author (name)
SELECT 'Dmitry A. Yashunin'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Dmitry A. Yashunin');
INSERT INTO author (name)
SELECT 'Patrick D. Hsu'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Patrick D. Hsu');
INSERT INTO author (name)
SELECT 'Eric S. Lander'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Eric S. Lander');
INSERT INTO author (name)
SELECT 'Feng Zhang'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Feng Zhang');
INSERT INTO author (name)
SELECT 'Thomas Kipf'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Thomas Kipf');
INSERT INTO author (name)
SELECT 'Bernhard Radke'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Bernhard Radke');
INSERT INTO author (name)
SELECT 'Viktor Leis'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Viktor Leis');
INSERT INTO author (name)
SELECT 'Peter Boncz'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Peter Boncz');
INSERT INTO author (name)
SELECT 'Alfons Kemper'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Alfons Kemper');
INSERT INTO author (name)
SELECT 'Zonghan Wu'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Zonghan Wu');
INSERT INTO author (name)
SELECT 'Shirui Pan'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Shirui Pan');
INSERT INTO author (name)
SELECT 'Fengwen Chen'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Fengwen Chen');
INSERT INTO author (name)
SELECT 'Guodong Long'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Guodong Long');
INSERT INTO author (name)
SELECT 'Chengqi Zhang'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Chengqi Zhang');
INSERT INTO author (name)
SELECT 'Philip S. Yu'
 WHERE NOT EXISTS (SELECT 1 FROM author WHERE name = 'Philip S. Yu');

DELETE FROM paper_author
 WHERE paper_id IN (
     SELECT paper_id
       FROM research_paper
      WHERE title IN (
          'Learning to Optimize Join Queries With Deep Reinforcement Learning',
          'Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs',
          'Development and Applications of CRISPR-Cas9 for Genome Engineering',
          'Learned Cardinalities: Estimating Correlated Joins with Deep Learning',
          'A Comprehensive Survey on Graph Neural Networks'
      )
 );

INSERT INTO paper_author (paper_id, author_id, author_order)
SELECT p.paper_id, a.author_id, authors.author_order
  FROM (
    SELECT 'Learning to Optimize Join Queries With Deep Reinforcement Learning' AS paper_title,
           'Sanjay Krishnan' AS author_name, 1 AS author_order
    UNION ALL SELECT 'Learning to Optimize Join Queries With Deep Reinforcement Learning', 'Zongheng Yang', 2
    UNION ALL SELECT 'Learning to Optimize Join Queries With Deep Reinforcement Learning', 'Ken Goldberg', 3
    UNION ALL SELECT 'Learning to Optimize Join Queries With Deep Reinforcement Learning', 'Joseph Hellerstein', 4
    UNION ALL SELECT 'Learning to Optimize Join Queries With Deep Reinforcement Learning', 'Ion Stoica', 5
    UNION ALL SELECT 'Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs', 'Yury A. Malkov', 1
    UNION ALL SELECT 'Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs', 'Dmitry A. Yashunin', 2
    UNION ALL SELECT 'Development and Applications of CRISPR-Cas9 for Genome Engineering', 'Patrick D. Hsu', 1
    UNION ALL SELECT 'Development and Applications of CRISPR-Cas9 for Genome Engineering', 'Eric S. Lander', 2
    UNION ALL SELECT 'Development and Applications of CRISPR-Cas9 for Genome Engineering', 'Feng Zhang', 3
    UNION ALL SELECT 'Learned Cardinalities: Estimating Correlated Joins with Deep Learning', 'Andreas Kipf', 1
    UNION ALL SELECT 'Learned Cardinalities: Estimating Correlated Joins with Deep Learning', 'Thomas Kipf', 2
    UNION ALL SELECT 'Learned Cardinalities: Estimating Correlated Joins with Deep Learning', 'Bernhard Radke', 3
    UNION ALL SELECT 'Learned Cardinalities: Estimating Correlated Joins with Deep Learning', 'Viktor Leis', 4
    UNION ALL SELECT 'Learned Cardinalities: Estimating Correlated Joins with Deep Learning', 'Peter Boncz', 5
    UNION ALL SELECT 'Learned Cardinalities: Estimating Correlated Joins with Deep Learning', 'Alfons Kemper', 6
    UNION ALL SELECT 'A Comprehensive Survey on Graph Neural Networks', 'Zonghan Wu', 1
    UNION ALL SELECT 'A Comprehensive Survey on Graph Neural Networks', 'Shirui Pan', 2
    UNION ALL SELECT 'A Comprehensive Survey on Graph Neural Networks', 'Fengwen Chen', 3
    UNION ALL SELECT 'A Comprehensive Survey on Graph Neural Networks', 'Guodong Long', 4
    UNION ALL SELECT 'A Comprehensive Survey on Graph Neural Networks', 'Chengqi Zhang', 5
    UNION ALL SELECT 'A Comprehensive Survey on Graph Neural Networks', 'Philip S. Yu', 6
  ) authors
  JOIN research_paper p ON p.title = authors.paper_title
  JOIN author a ON a.name = authors.author_name;

DELETE FROM citation
 WHERE citing_paper_id IN (
       SELECT paper_id
         FROM research_paper
        WHERE title IN (
            'Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs',
            'Development and Applications of CRISPR-Cas9 for Genome Engineering'
        )
   )
    OR (
       citing_paper_id = (
           SELECT paper_id FROM research_paper
            WHERE title = 'The Case for Learned Index Structures'
       )
       AND cited_paper_id = (
           SELECT paper_id FROM research_paper
            WHERE title = 'Learning to Optimize Join Queries With Deep Reinforcement Learning'
       )
   );

UPDATE paper_extraction pe
  JOIN research_paper p ON p.paper_id = pe.paper_id
   SET pe.extracted_text = CASE
       WHEN p.title = 'Learning to Optimize Join Queries With Deep Reinforcement Learning'
            AND pe.field_key = 'summary'
           THEN 'Demo value: Explores deep reinforcement learning for choosing database join orders.'
       WHEN p.title = 'Learning to Optimize Join Queries With Deep Reinforcement Learning'
            AND pe.field_key = 'methodology'
           THEN 'Demo value: Evaluates learned join-order policies against database query workloads.'
       WHEN p.title = 'Learning to Optimize Join Queries With Deep Reinforcement Learning'
            AND pe.field_key = 'sample_size'
           THEN 'Demo value: Workload sizes vary; no single sample count is represented.'
       WHEN p.title = 'Learning to Optimize Join Queries With Deep Reinforcement Learning'
            AND pe.field_key = 'limitations'
           THEN 'Demo value: Outcomes depend on training data, workload, and cost-model assumptions.'
       WHEN p.title = 'Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs'
            AND pe.field_key = 'summary'
           THEN 'Demo value: Presents hierarchical small-world graphs for approximate nearest-neighbor search.'
       WHEN p.title = 'Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs'
            AND pe.field_key = 'methodology'
           THEN 'Demo value: Evaluates graph-based approximate search for speed, accuracy, and memory use.'
       WHEN p.title = 'Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs'
            AND pe.field_key = 'sample_size'
           THEN 'Demo value: Dataset sizes vary; no single sample count is represented.'
       WHEN p.title = 'Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs'
            AND pe.field_key = 'limitations'
           THEN 'Demo value: Search quality, memory use, and indexing cost involve tradeoffs.'
       WHEN p.title = 'Development and Applications of CRISPR-Cas9 for Genome Engineering'
            AND pe.field_key = 'summary'
           THEN 'Demo value: Reviews CRISPR-Cas9 mechanisms and applications in genome engineering.'
       WHEN p.title = 'Development and Applications of CRISPR-Cas9 for Genome Engineering'
            AND pe.field_key = 'methodology'
           THEN 'Demo value: Reviews genome-engineering methods and applications; this is not a primary study.'
       WHEN p.title = 'Development and Applications of CRISPR-Cas9 for Genome Engineering'
            AND pe.field_key = 'sample_size'
           THEN 'Demo value: Not applicable to this review.'
       WHEN p.title = 'Development and Applications of CRISPR-Cas9 for Genome Engineering'
            AND pe.field_key = 'limitations'
           THEN 'Demo value: A review reflects the scope and coverage of the literature available to its authors.'
       ELSE pe.extracted_text
   END,
   pe.numeric_value = CASE
       WHEN pe.field_key = 'sample_size' AND p.title IN (
           'Learning to Optimize Join Queries With Deep Reinforcement Learning',
           'Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs'
       ) THEN NULL
       ELSE pe.numeric_value
   END
 WHERE pe.origin = 'demo'
   AND p.title IN (
       'Learning to Optimize Join Queries With Deep Reinforcement Learning',
       'Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs',
       'Development and Applications of CRISPR-Cas9 for Genome Engineering'
   );
