const mongoose = require('mongoose');

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/luxgen', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Check if we have any collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Collections:', collections.map(c => c.name));
    
    // Check if we have any groups
    const Group = mongoose.model('Group', new mongoose.Schema({}, { strict: false }));
    const groupCount = await Group.countDocuments();
    console.log(`📁 Groups in database: ${groupCount}`);
    
    if (groupCount > 0) {
      const groups = await Group.find().limit(5);
      console.log('📋 Sample groups:');
      groups.forEach(group => {
        console.log(`  - ${group.name} (${group.color})`);
      });
    }
    
    // Check if we have any users
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const userCount = await User.countDocuments();
    console.log(`👥 Users in database: ${userCount}`);
    
    // Check if we have any tenants
    const Tenant = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
    const tenantCount = await Tenant.countDocuments();
    console.log(`🏢 Tenants in database: ${tenantCount}`);
    
    if (tenantCount > 0) {
      const tenants = await Tenant.find();
      console.log('📋 Tenants:');
      tenants.forEach(tenant => {
        console.log(`  - ${tenant.name} (${tenant.subdomain})`);
      });
    }
    
    console.log('✅ Database test complete!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testDatabase();
