-- Allow UUID-backed, locally stored PDF URLs in the paper validation triggers.
-- Safe to run repeatedly. Run after sql/08_replace_synthetic_papers.sql.
USE researchlens;

DROP TRIGGER IF EXISTS trg_paper_before_insert;
DROP TRIGGER IF EXISTS trg_paper_before_update;

DELIMITER $$

CREATE TRIGGER trg_paper_before_insert
BEFORE INSERT ON research_paper
FOR EACH ROW
BEGIN
    SET NEW.title = TRIM(NEW.title);
    IF NEW.title = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Paper title cannot be blank';
    END IF;

    IF NEW.doi IS NOT NULL THEN
        SET NEW.doi = NULLIF(
            REPLACE(REPLACE(LOWER(TRIM(NEW.doi)), 'https://doi.org/', ''), 'http://doi.org/', ''),
            '');
    END IF;

    IF NEW.journal IS NOT NULL THEN
        SET NEW.journal = NULLIF(TRIM(NEW.journal), '');
    END IF;

    IF NEW.doi IS NOT NULL AND NEW.doi NOT LIKE '10.%/%' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'DOI must look like 10.xxxx/suffix';
    END IF;
    IF NEW.pdf_url IS NOT NULL
       AND NEW.pdf_url NOT LIKE 'http://%'
       AND NEW.pdf_url NOT LIKE 'https://%'
       AND NEW.pdf_url NOT REGEXP '^/api/papers/uploads/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PDF URL must start with http:// or https://';
    END IF;
END$$

CREATE TRIGGER trg_paper_before_update
BEFORE UPDATE ON research_paper
FOR EACH ROW
BEGIN
    SET NEW.title = TRIM(NEW.title);
    IF NEW.title = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Paper title cannot be blank';
    END IF;

    IF NEW.doi IS NOT NULL THEN
        SET NEW.doi = NULLIF(
            REPLACE(REPLACE(LOWER(TRIM(NEW.doi)), 'https://doi.org/', ''), 'http://doi.org/', ''),
            '');
    END IF;

    IF NEW.journal IS NOT NULL THEN
        SET NEW.journal = NULLIF(TRIM(NEW.journal), '');
    END IF;

    IF NEW.doi IS NOT NULL AND NEW.doi NOT LIKE '10.%/%' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'DOI must look like 10.xxxx/suffix';
    END IF;
    IF NEW.pdf_url IS NOT NULL
       AND NEW.pdf_url NOT LIKE 'http://%'
       AND NEW.pdf_url NOT LIKE 'https://%'
       AND NEW.pdf_url NOT REGEXP '^/api/papers/uploads/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PDF URL must start with http:// or https://';
    END IF;
END$$

DELIMITER ;
