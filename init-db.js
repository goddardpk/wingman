const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Create a new database connection
const db = new sqlite3.Database('wingman.db');

// Read the schema file
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

// Execute the schema
db.exec(schema, (err) => {
    if (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
    console.log('Database initialized successfully');
    db.close();
});
