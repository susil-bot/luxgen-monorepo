const mongoose = require('mongoose');

async function clearDatabase() {
  try {
    console.log('🧹 Clearing database...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/luxgen', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Clear all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).deleteMany({});
      console.log(`🗑️ Cleared ${collection.name}`);
    }
    
    console.log('✅ Database cleared successfully!');
    
  } catch (error) {
    console.error('❌ Database clearing failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

clearDatabase();
