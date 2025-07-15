// setup.js
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'testdb',
    password: process.env.DB_PASSWORD || 'mynewpassword',
    port: process.env.DB_PORT || 5432,
});

async function setupDatabase() {
    const client = await pool.connect();
    
    try {
        // Read and execute schema
        const schema = fs.readFileSync('schema.sql', 'utf8');
        await client.query(schema);
        console.log('✓ Database schema created successfully');        
    } catch (error) {
        console.error('Setup error:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

setupDatabase();
