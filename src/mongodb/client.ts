import { MongoClient, Db } from "mongodb";

export let client: MongoClient;
export let db: Db;

export async function connectToMongoDB(databaseUrl: string) {
  try {
    console.error("Attempting to connect to MongoDB at:", databaseUrl);
    client = new MongoClient(databaseUrl);
    await client.connect();
    const resourceBaseUrl = new URL(databaseUrl);
    const dbName = resourceBaseUrl.pathname.split("/")[1] || "test";
    console.error(`Connected successfully to MongoDB. Using database: ${dbName}`);
    db = client.db(dbName);
    
    // Test the connection
    const collections = await db.listCollections().toArray();
    console.error("Available collections:", collections.map(c => c.name));
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export async function closeMongoDB() {
  await client?.close();
}
