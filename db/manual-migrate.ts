import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function run() {
  const query = fs.readFileSync(path.join(process.cwd(), "db/migrations/0001_windy_the_hunter.sql"), "utf8");
  
  // Split query into individual statements and filter out empty ones
  const statements = query.split(';').filter(stmt => stmt.trim().length > 0);
  
  for (const stmt of statements) {
    console.log("Running:", stmt);
    try {
      await sql.query(stmt);
      console.log("Success");
    } catch (e) {
      console.error("Failed:", e);
    }
  }
  console.log("Done");
}

run();
