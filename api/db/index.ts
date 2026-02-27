import Database from 'better-sqlite3';
import path from 'path';

// Initialize the database
const dbPath = path.join(process.cwd(), 'job_applications.db');
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

export default db;
