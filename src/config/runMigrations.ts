import fs from "fs";
import path from "path";
import pool from "./db";

const runMigrations = async () => {
  try {
    console.log("Running database migrations...");

    // Read SQL file
    const schemaFilePath = path.join(__dirname, "dbSchema.sql");
    const sqlScript = fs.readFileSync(schemaFilePath, "utf8");

    // Execute SQL
    await pool.query(sqlScript);

    console.log("Database migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    process.exit(1);
  } finally {
    // Close pool
    await pool.end();
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export default runMigrations;
