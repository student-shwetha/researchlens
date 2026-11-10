-- Replace sample placeholder URLs/DOIs with verified sources where the paper
-- is identifiable. Synthetic examples are left without misleading links.
-- Safe to run repeatedly.
USE researchlens;

UPDATE research_paper
   SET doi = '10.48550/arxiv.1706.03762',
       pdf_url = 'https://arxiv.org/pdf/1706.03762'
 WHERE title = 'Attention Is All You Need'
   AND publication_year = 2017
   AND NOT (doi <=> '10.48550/arxiv.1706.03762'
            AND pdf_url <=> 'https://arxiv.org/pdf/1706.03762');

UPDATE research_paper
   SET doi = '10.18653/v1/n19-1423',
       pdf_url = 'https://aclanthology.org/N19-1423.pdf'
 WHERE title = 'BERT: Pre-training of Deep Bidirectional Transformers'
   AND publication_year = 2019
   AND NOT (doi <=> '10.18653/v1/n19-1423'
            AND pdf_url <=> 'https://aclanthology.org/N19-1423.pdf');

UPDATE research_paper
   SET doi = NULL, pdf_url = NULL
 WHERE title IN (
         'Efficient Query Processing in Relational Databases',
         'Approximate Nearest Neighbor Search with Vector Indexes',
         'CRISPR-Cas9 Genome Editing: A Review',
         'Learned Cardinality Estimation for Query Optimization',
         'Graph Neural Networks Survey'
       )
   AND (doi IS NOT NULL OR pdf_url IS NOT NULL);

UPDATE research_paper
   SET doi = '10.1038/s41586-019-1666-5',
       pdf_url = 'https://arxiv.org/pdf/1910.11333'
 WHERE title = 'Quantum Supremacy Using a Programmable Processor'
   AND publication_year = 2019
   AND NOT (doi <=> '10.1038/s41586-019-1666-5'
            AND pdf_url <=> 'https://arxiv.org/pdf/1910.11333');

UPDATE research_paper
   SET doi = '10.1109/cvpr.2016.90',
       pdf_url = 'https://openaccess.thecvf.com/content_cvpr_2016/papers/He_Deep_Residual_Learning_CVPR_2016_paper.pdf'
 WHERE title = 'Deep Residual Learning for Image Recognition'
   AND publication_year = 2016
   AND NOT (doi <=> '10.1109/cvpr.2016.90'
            AND pdf_url <=> 'https://openaccess.thecvf.com/content_cvpr_2016/papers/He_Deep_Residual_Learning_CVPR_2016_paper.pdf');

UPDATE research_paper
   SET doi = '10.48550/arxiv.2005.14165',
       pdf_url = 'https://arxiv.org/pdf/2005.14165'
 WHERE title = 'Language Models are Few-Shot Learners'
   AND publication_year = 2020
   AND NOT (doi <=> '10.48550/arxiv.2005.14165'
            AND pdf_url <=> 'https://arxiv.org/pdf/2005.14165');

UPDATE research_paper
   SET doi = '10.1145/3065386',
       pdf_url = 'https://proceedings.neurips.cc/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf'
 WHERE title = 'ImageNet Classification with Deep Convolutional Neural Networks'
   AND publication_year = 2012
   AND NOT (doi <=> '10.1145/3065386'
            AND pdf_url <=> 'https://proceedings.neurips.cc/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf');

UPDATE research_paper
   SET doi = '10.1038/s41586-021-03819-2',
       pdf_url = 'https://www.nature.com/articles/s41586-021-03819-2.pdf'
 WHERE title = 'Highly Accurate Protein Structure Prediction with AlphaFold'
   AND publication_year = 2021
   AND NOT (doi <=> '10.1038/s41586-021-03819-2'
            AND pdf_url <=> 'https://www.nature.com/articles/s41586-021-03819-2.pdf');

UPDATE research_paper
   SET doi = '10.1145/3183713.3196909',
       pdf_url = 'https://arxiv.org/pdf/1712.01208'
 WHERE title = 'The Case for Learned Index Structures'
   AND publication_year = 2018
   AND NOT (doi <=> '10.1145/3183713.3196909'
            AND pdf_url <=> 'https://arxiv.org/pdf/1712.01208');

UPDATE research_paper
   SET doi = '10.1109/tbdata.2019.2921572',
       pdf_url = 'https://arxiv.org/pdf/1702.08734'
 WHERE title = 'Billion-Scale Similarity Search with GPUs'
   AND publication_year = 2019
   AND NOT (doi <=> '10.1109/tbdata.2019.2921572'
            AND pdf_url <=> 'https://arxiv.org/pdf/1702.08734');

UPDATE research_paper
   SET doi = '10.1103/revmodphys.87.1379',
       pdf_url = 'https://arxiv.org/pdf/1208.0928'
 WHERE title = 'Surface Codes: Towards Practical Large-Scale Quantum Computation'
   AND publication_year = 2012
   AND NOT (doi <=> '10.1103/revmodphys.87.1379'
            AND pdf_url <=> 'https://arxiv.org/pdf/1208.0928');

UPDATE research_paper
   SET doi = '10.18653/v1/2020.emnlp-main.550',
       pdf_url = 'https://aclanthology.org/2020.emnlp-main.550.pdf'
 WHERE title = 'Dense Passage Retrieval for Open-Domain Question Answering'
   AND publication_year = 2020
   AND NOT (doi <=> '10.18653/v1/2020.emnlp-main.550'
            AND pdf_url <=> 'https://aclanthology.org/2020.emnlp-main.550.pdf');

UPDATE research_paper
   SET doi = '10.1038/nature17946',
       pdf_url = 'https://www.nature.com/articles/nature17946.pdf'
 WHERE title = 'Programmable Editing of a Target Base in Genomic DNA'
   AND publication_year = 2016
   AND NOT (doi <=> '10.1038/nature17946'
            AND pdf_url <=> 'https://www.nature.com/articles/nature17946.pdf');
