process.env.DATABASE_URL = 'file:./dev.db';
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

async function main() {
  const libsql = createClient({ url: process.env.DATABASE_URL });
  const adapter = new PrismaLibSql(libsql);
  const prisma = new PrismaClient({ adapter });
  
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
      }
    });
    console.log('Created new admin');
  } else {
    console.log('Admin already exists');
  }
  console.log('Admin Email:', admin.email);
  console.log('Admin Password: admin123 (if newly created) or unknown');
}
main().catch(console.error);
