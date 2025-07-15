-- schema.sql (Optimized for Maximum Insert Speed)

-- Step 1: Drop the main table if it exists.
DROP TABLE IF EXISTS bulk_test_table;

-- Step 2: Drop the custom ENUM types for a clean setup.
DROP TYPE IF EXISTS department_enum;
DROP TYPE IF EXISTS city_enum;
DROP TYPE IF EXISTS country_enum;

-- Step 3: Create the ENUM types first.
CREATE TYPE department_enum AS ENUM ('Engineering', 'Sales', 'Marketing', 'HR', 'Finance');
CREATE TYPE city_enum AS ENUM ('New York', 'London', 'Tokyo', 'Berlin', 'Sydney');
CREATE TYPE country_enum AS ENUM ('USA', 'UK', 'Japan', 'Germany', 'Australia');

-- Step 4: Create the table with the ENUM types.
CREATE TABLE IF NOT EXISTS bulk_test_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    age INTEGER,
    city city_enum,
    country country_enum,
    salary DECIMAL(10,2),
    department department_enum,
    hire_date DATE,
    is_active BOOLEAN,
    created_at TIMESTAMP
);
