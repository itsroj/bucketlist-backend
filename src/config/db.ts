import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Connection configuration for Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }
  if (client) {
    client.query("SELECT NOW()", (err, result) => {
      release();
      if (err) {
        return console.error("Error executing query", err.stack);
      }
      console.log("Connected to Database!", result.rows[0]);
    });
  }
});

export default pool;
