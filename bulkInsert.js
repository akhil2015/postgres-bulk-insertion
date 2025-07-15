const { Pool } = require('pg');
const { performance } = require('perf_hooks');
const copyFrom = require('pg-copy-streams').from;
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pipeline } = require('stream/promises');

// --- Configuration ---
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASSWORD || 'mynewpassword',
    port: process.env.DB_PORT || 5432,
});

const SOURCE_FILE = 'data.csv'; // Tab-separated file, no header
const TABLE_NAME = 'bulk_test_table';

async function logSystemInfo() {
    const cpus = os.cpus();
    const totalMemGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    console.log('\n--- Environment Info ---');
    console.log(`CPU: ${cpus[0].model} (${cpus.length} cores)`);
    console.log(`Memory: ${totalMemGB} GB`);
    console.log(`PostgreSQL Host: ${process.env.DB_HOST || 'localhost'}`);
}

async function runBulkInsertFromFile() {
    const filePath = path.join(__dirname, SOURCE_FILE);
    if (!fs.existsSync(filePath)) {
        console.error(`Error: Source file not found at ${filePath}`);
        console.error('Please run "node generateData.js" first.');
        return;
    }

    const client = await pool.connect();

    try {
        await client.query(`ALTER TABLE ${TABLE_NAME} SET UNLOGGED`);

        console.log(`\nInserting from ${SOURCE_FILE} using COPY...`);
        const copyQuery = `
            COPY ${TABLE_NAME} (name, email, age, city, country, salary, department, hire_date, is_active, created_at)
            FROM STDIN WITH (FORMAT text)
        `;

        const ingestStream = client.query(copyFrom(copyQuery));
        const sourceStream = fs.createReadStream(filePath, { highWaterMark: 1024 * 1024 });

        const startTime = performance.now();
        await pipeline(sourceStream, ingestStream);
        const endTime = performance.now();

        const duration = (endTime - startTime).toFixed(3);
        const recordCount = 100000;
        const rps = (recordCount / (duration / 1000)).toFixed(0);

        console.log('\n--- Performance Results ---');
        console.log(`✓ Inserted ${recordCount} records in ${duration} ms.`);
        console.log(`✓ Throughput: ~${rps} records/second.`);

    } catch (err) {
        console.error('Insertion Error:', err);
    } finally {
        await client.query(`ALTER TABLE ${TABLE_NAME} SET LOGGED`);
        client.release();
    }
}

(async () => {
    await logSystemInfo();
    await runBulkInsertFromFile();
})();
