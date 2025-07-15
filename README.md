# High-Performance Bulk Insertion into PostgreSQL

This project demonstrates a high-performance method for bulk inserting 100,000 records into a PostgreSQL database using Node.js. The primary goal was to achieve latency of 20ms for 100,000 rows by leveraging advanced PostgreSQL features and efficient data streaming.

### Objective

The core objective is to design and implement a process to insert a large dataset (100,000 records) into a PostgreSQL database as quickly as possible, measuring the end-to-end insertion time[1].

### Performance Results

The script was executed in the following environment, yielding the results below.

**Environment Info**
*   **CPU**: Intel(R) Core(TM) i5-9400F CPU @ 2.90GHz (6 cores)
*   **Memory**: 31.29 GB
*   **PostgreSQL Host**: localhost

**Insertion Metrics**
*   **Total Records Inserted**: 100,000
*   **Insertion Time**: 245.325 ms
*   **Throughput**: ~407,623 records/second

### Tech Stack

*   **Database**: PostgreSQL
*   **Language**: Node.js
*   **Key Libraries**: `pg`, `pg-copy-streams`

### Setup Instructions

1.  **Prerequisites**:
    *   Node.js installed.
    *   A running PostgreSQL server.

2.  **Database Configuration**:
    *   Create a database in PostgreSQL.
    *   Set your database connection details (user, password, host, port, database name) as environment variables or update them directly in the `setup.js`[2] and `bulkInsert.js`[3] files.

3.  **Install Dependencies**:
    ```bash
    npm install dotenv pg pg-copy-streams
    ```

4.  **Create Database Schema**:
    *   Execute the setup script to create the necessary tables and data types. The script reads the schema definition from `schema.sql`[4][2].
    ```bash
    node setup.js
    ```

5.  **Prepare Data**:
    *   A data source file named `data.csv` is required in the project's root directory. The script expects a tab-separated file without a header row[3]. A script to generate this data, `generateData.js`, is mentioned in the code but must be run first[3].

### How to Run the Insertion

Once the setup is complete and the `data.csv` file is present, run the bulk insertion script:
```bash
node bulkInsert.js
```
The script will stream the data from `data.csv` into the `bulk_test_table` and log the performance metrics upon completion[3].

### Performance Optimization Techniques

Several strategies were implemented to achieve high throughput and low latency:

*   **PostgreSQL `COPY` Command**: Instead of using standard `INSERT` statements, the implementation leverages the `COPY` command via the `pg-copy-streams` library[3]. `COPY` is PostgreSQL's native and fastest utility for bulk data loading, as it bypasses significant SQL processing overhead.

*   **`UNLOGGED` Tables**: Before starting the insertion, the target table is temporarily altered to be `UNLOGGED`[3]. This setting skips writing to the Write-Ahead Log (WAL), which dramatically reduces I/O operations and increases insertion speed. The table is set back to `LOGGED` after the operation to ensure durability for future transactions[3]. This is a documented trade-off where crash safety is sacrificed for maximum performance during the load.

*   **Efficient Streaming**: The entire process is stream-based. The script reads the `data.csv` file as a readable stream and pipes it directly into the PostgreSQL ingest stream[3]. This approach is highly memory-efficient, as it does not require loading the entire 100,000-record dataset into memory at once.

*   **Optimized Schema Design**: The database schema uses `ENUM` types for columns with a limited set of possible values (e.g., `city`, `country`, `department`)[4]. `ENUM` types are stored more efficiently than variable-length strings (`VARCHAR`), reducing storage footprint and improving query performance.
# postgres-bulk-insertion
