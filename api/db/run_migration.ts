import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = () => {
  try {
    const schemaPath = path.join(__dirname, 'migration_profiles.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    console.log('Running profiles migration...');
    db.exec(schema);
    console.log('Profiles migration completed successfully.');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
};

runMigration();
