const mongoose = require('mongoose');

async function testGroups() {
  try {
    console.log('🔍 Testing groups query...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/luxgen', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Get demo tenant
    const Tenant = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
    const demoTenant = await Tenant.findOne({ subdomain: 'demo' });
    console.log('🏢 Demo tenant:', demoTenant ? demoTenant._id.toString() : 'Not found');
    
    if (demoTenant) {
      // Query groups for demo tenant
      const Group = mongoose.model('Group', new mongoose.Schema({}, { strict: false }));
      const query = { 
        isActive: true,
        tenant: demoTenant._id.toString()
      };
      
      console.log('🔍 Query:', query);
      
      const groups = await Group.find(query);
      console.log(`📁 Found ${groups.length} groups for demo tenant`);
      
      if (groups.length > 0) {
        console.log('📋 Sample groups:');
        groups.slice(0, 3).forEach(group => {
          console.log(`  - ${group.name} (${group.color})`);
        });
      }
    }
    
    console.log('✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testGroups();
