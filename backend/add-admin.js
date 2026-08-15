// backend/add-admin.js
const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function createAdmin() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://user:password@host:port/dbname',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const hashedPassword = await bcrypt.hash('Admin@123456', 10);
    
    const query = `
      INSERT INTO users (
        email, 
        password, 
        "firstName", 
        "lastName", 
        phone, 
        role, 
        status, 
        "verificationStatus", 
        balance, 
        "isPinVerified",
        "createdAt",
        "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, role;
    `;

    const values = [
      'admin@tamoura.com',
      hashedPassword,
      'Admin',
      'User',
      '0000000000',
      'admin',
      'active',
      'fully_verified',
      0,
      true
    ];

    const result = await client.query(query, values);

    if (result.rows.length > 0) {
      console.log('✅ Admin created successfully!');
      console.log('Email:', result.rows[0].email);
      console.log('Role:', result.rows[0].role);
      console.log('ID:', result.rows[0].id);
    } else {
      console.log('️ Admin already exists');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createAdmin();
