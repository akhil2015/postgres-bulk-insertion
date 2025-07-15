const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');

// --- Configuration ---
const TOTAL_RECORDS = 100000; // Increased to match original assignment requirements
const OUTPUT_FILE = 'data.csv';

// --- Data Generation Logic ---
// A generator function is memory-efficient for creating large datasets.
function* generateRecordIterator(count) {
    console.log(`Generating ${count} records for CSV...`);
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
    const cities = ['New York', 'London', 'Tokyo', 'Berlin', 'Sydney'];
    const countries = ['USA', 'UK', 'Japan', 'Germany', 'Australia'];

    for (let i = 0; i < count; i++) {
        const record = [
            `user_name_${i}`,
            `user${i}@example.com`,
            20 + (i % 50),
            cities[i % cities.length],
            countries[i % countries.length],
            (30000 + (i % 70000)).toFixed(2),
            departments[i % departments.length],
            new Date(2020 + (i % 4), i % 12, 1 + (i % 28)).toISOString().split('T')[0],
            i % 2 === 0,
            new Date().toISOString()
        ];
        
        // Yield a tab-separated string followed by a newline.
        yield record.join('\t') + '\n';
    }
    console.log('Record generation complete.');
}

// --- Main Execution ---
async function createDataFile() {
    console.log(`Starting data file generation: ${OUTPUT_FILE}`);
    
    // Create a readable stream from our generator function.
    const sourceStream = Readable.from(generateRecordIterator(TOTAL_RECORDS));

    // Create a writable stream to the output file.
    const destinationStream = fs.createWriteStream(path.join(__dirname, OUTPUT_FILE));

    try {
        // Use pipeline to efficiently stream data from the generator to the file.
        await pipeline(sourceStream, destinationStream);
        console.log(`✓ Successfully created ${OUTPUT_FILE} with ${TOTAL_RECORDS} records.`);
    } catch (error) {
        console.error('❌ Error generating data file:', error);
    }
}

createDataFile();
