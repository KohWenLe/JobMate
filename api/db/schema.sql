-- create table
CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    position TEXT NOT NULL,
    applied_date DATE NOT NULL,
    job_description TEXT,
    generated_cover_letter TEXT,
    generated_email_body TEXT,
    resume_file_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- create index
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company_name);
CREATE INDEX IF NOT EXISTS idx_applications_position ON applications(position);
CREATE INDEX IF NOT EXISTS idx_applications_date ON applications(applied_date DESC);
