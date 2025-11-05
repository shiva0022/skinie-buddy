// MongoDB Native Driver Connection Test (matching your provided code)
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

console.log('🔍 Testing MongoDB Connection with Native Driver...\n');
console.log('URI:', uri ? uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@') : 'NOT SET');
console.log('');

if (!uri) {
  console.error('❌ MONGODB_URI not set in .env file');
  process.exit(1);
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    
    // Connect the client to the server
    await client.connect();
    
    console.log('✅ Connected successfully!');
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
    
    // Get database info
    const db = client.db("skinie-buddy");
    console.log(`\n📊 Database: ${db.databaseName}`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`📁 Collections: ${collections.length === 0 ? 'None (empty database)' : collections.map(c => c.name).join(', ')}`);
    
    console.log('\n✅ Connection test successful!');
    
  } catch (error) {
    console.error('\n❌ MongoDB Connection Failed!\n');
    console.error('Error:', error.message);
    console.error('\nFull Error:');
    console.error(error);
    
    console.log('\n💡 Common Solutions:');
    console.log('  1. Check if your IP is whitelisted in MongoDB Atlas (Network Access)');
    console.log('  2. Verify username and password are correct');
    console.log('  3. Check if password has special characters (@ should be %40)');
    console.log('  4. Ensure cluster is running (not paused)');
    
    process.exit(1);
    
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

run().catch(console.dir);
