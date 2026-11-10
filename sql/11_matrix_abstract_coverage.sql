-- Replace demo-only matrix cells with transparent abstract coverage.
-- Sample sizes and limitations are not inferred when the catalog abstract
-- does not report them; those cells explicitly require full-text review.
USE researchlens;

ALTER TABLE paper_extraction
    MODIFY origin VARCHAR(12) NOT NULL DEFAULT 'source',
    DROP CHECK chk_extraction_origin,
    ADD CONSTRAINT chk_extraction_origin
        CHECK (origin IN ('source','demo','abstract','unavailable'));

DELETE FROM paper_extraction WHERE origin = 'demo';

INSERT INTO paper_extraction
    (paper_id, field_key, extracted_text, numeric_value, source_quote,
     source_section, confidence, origin)
SELECT p.paper_id, f.field_key,
       CASE f.field_key
         WHEN 'summary' THEN
           CASE WHEN NULLIF(TRIM(p.abstract), '') IS NULL
             THEN 'No abstract is recorded in the catalog.'
             ELSE CONCAT('Catalog abstract: ', TRIM(p.abstract))
           END
         WHEN 'methodology' THEN
           CASE WHEN NULLIF(TRIM(p.abstract), '') IS NULL
             THEN 'No abstract is recorded in the catalog, so the method requires full-text review.'
             ELSE CONCAT(
               'Abstract-based note: ', TRIM(p.abstract),
               ' This is not a full methods extraction. Consult the linked paper for the design, data, and evaluation details.'
             )
           END
         WHEN 'sample_size' THEN
           'No sample-size value is recorded from the catalog abstract. Check the linked full text and do not treat this as zero or not applicable.'
         WHEN 'limitations' THEN
           'Limitations are not recorded from the catalog abstract. A paper-specific assessment requires full-text review.'
       END,
       NULL, NULL,
       CASE WHEN f.field_key IN ('summary','methodology')
                  AND NULLIF(TRIM(p.abstract), '') IS NOT NULL
         THEN 'Catalog abstract'
         ELSE 'Abstract coverage check'
       END,
       NULL,
       CASE WHEN f.field_key IN ('summary','methodology')
                  AND NULLIF(TRIM(p.abstract), '') IS NOT NULL
         THEN 'abstract'
         ELSE 'unavailable'
       END
  FROM research_paper p
 CROSS JOIN (
       SELECT 'summary' AS field_key
       UNION ALL SELECT 'methodology'
       UNION ALL SELECT 'sample_size'
       UNION ALL SELECT 'limitations'
 ) f
 WHERE 1 = 1
ON DUPLICATE KEY UPDATE
    extracted_text = VALUES(extracted_text),
    numeric_value = VALUES(numeric_value),
    source_quote = VALUES(source_quote),
    source_section = VALUES(source_section),
    confidence = VALUES(confidence),
    origin = VALUES(origin);
