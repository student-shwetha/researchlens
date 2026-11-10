-- Synthetic matrix placeholders for UI demonstrations only.
-- These assumptions are intentionally NOT claims about the cited papers.
-- Keep origin='demo' so the UI and exports distinguish them from source data.
USE researchlens;

INSERT INTO paper_extraction
    (paper_id, field_key, extracted_text, numeric_value, source_quote,
     source_section, confidence, origin)
SELECT p.paper_id, 'sample_size',
       'Synthetic demo value only, this assumed sample size is not reported by the paper.',
       d.demo_sample_size, NULL, 'Synthetic demonstration assumption', NULL, 'demo'
  FROM research_paper p
  JOIN (
       SELECT 'Attention Is All You Need' AS title, 120 AS demo_sample_size
       UNION ALL SELECT 'BERT: Pre-training of Deep Bidirectional Transformers', 250
       UNION ALL SELECT 'Language Models are Few-Shot Learners', 80
       UNION ALL SELECT 'ImageNet Classification with Deep Convolutional Neural Networks', 500
       UNION ALL SELECT 'Dense Passage Retrieval for Open-Domain Question Answering', 300
  ) d ON d.title = p.title
ON DUPLICATE KEY UPDATE
    extracted_text = VALUES(extracted_text),
    numeric_value = VALUES(numeric_value),
    source_quote = VALUES(source_quote),
    source_section = VALUES(source_section),
    confidence = VALUES(confidence),
    origin = VALUES(origin);

INSERT INTO paper_extraction
    (paper_id, field_key, extracted_text, numeric_value, source_quote,
     source_section, confidence, origin)
SELECT p.paper_id, 'limitations',
       CONCAT('Synthetic demo assumption only, not reported by the paper. ',
              d.demo_limitation),
       NULL, NULL, 'Synthetic demonstration assumption', NULL, 'demo'
  FROM research_paper p
  JOIN (
       SELECT 'Attention Is All You Need' AS title,
              'For demonstration, assume results may depend on language-pair coverage and computational resources.'
                AS demo_limitation
       UNION ALL SELECT 'BERT: Pre-training of Deep Bidirectional Transformers',
              'For demonstration, assume results may depend on pre-training data and task-specific fine-tuning.'
       UNION ALL SELECT 'Language Models are Few-Shot Learners',
              'For demonstration, assume results may depend on prompt choice, benchmark coverage, and training data.'
       UNION ALL SELECT 'ImageNet Classification with Deep Convolutional Neural Networks',
              'For demonstration, assume results may depend on dataset composition and available GPU resources.'
       UNION ALL SELECT 'Dense Passage Retrieval for Open-Domain Question Answering',
              'For demonstration, assume results may depend on passage collection coverage and benchmark selection.'
  ) d ON d.title = p.title
ON DUPLICATE KEY UPDATE
    extracted_text = VALUES(extracted_text),
    numeric_value = VALUES(numeric_value),
    source_quote = VALUES(source_quote),
    source_section = VALUES(source_section),
    confidence = VALUES(confidence),
    origin = VALUES(origin);
