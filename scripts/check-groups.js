const mongoose = require('mongoose');

async function checkGroups() {
  try {
    console.log('🔍 Checking groups in database...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/luxgen', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Check groups
    const Group = mongoose.model('Group', new mongoose.Schema({}, { strict: false }));
    const groups = await Group.find().limit(5);
    
    console.log('📁 Sample groups:');
    groups.forEach(group => {
      console.log(`  - ${group.name}`);
      console.log(`    Tenant: ${group.tenant} (type: ${typeof group.tenant})`);
      console.log(`    CreatedBy: ${group.createdBy} (type: ${typeof group.createdBy})`);
      console.log(`    IsActive: ${group.isActive}`);
      console.log('');
    });
    
    // Check tenants
    const Tenant = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
    const tenants = await Tenant.find();
    
    console.log('🏢 Tenants:');
    tenants.forEach(tenant => {
      console.log(`  - ${tenant.name} (${tenant.subdomain}) - ID: ${tenant._id}`);
    });
    
    console.log('✅ Database check complete!');
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkGroups();
