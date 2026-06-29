const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

async function main() {
  const db = createClient({ url: 'file:./dev.db' });
  
  // Check if User table exists
  try {
    const adminQuery = await db.execute("SELECT * FROM users WHERE role = 'ADMIN'");
    let admin = adminQuery.rows[0];
    
    if (!admin) {
      const hash = bcrypt.hashSync('admin123', 10);
      await db.execute({
        sql: `INSERT INTO users (id, name, email, password, role, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: ['admin-123', 'Admin', 'admin@example.com', hash, 'ADMIN']
      });
      admin = { email: 'admin@example.com' };
      console.log('Created new admin');
    } else {
      console.log('Admin already exists');
    }
    
    // Find email column index or property
    const email = admin.email || admin[2] || admin.find(v => typeof v === 'string' && v.includes('@'));
    console.log('Admin Email:', email);
    console.log('Admin Password: admin123 (if newly created)');
  } catch(e) {
    console.error(e);
  }
}

main();
