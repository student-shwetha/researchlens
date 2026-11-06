-- Replace the placeholder links for the GPT-3 sample record with its verified
-- arXiv DOI and PDF. Safe to run repeatedly.
USE researchlens;

UPDATE research_paper
   SET doi = '10.48550/arxiv.2005.14165',
       pdf_url = 'https://arxiv.org/pdf/2005.14165'
 WHERE title = 'Language Models are Few-Shot Learners'
   AND publication_year = 2020
   AND (doi = '10.1000/gpt3.2020.05'
        OR (doi = '10.48550/arxiv.2005.14165'
            AND NOT (pdf_url <=> 'https://arxiv.org/pdf/2005.14165')));
