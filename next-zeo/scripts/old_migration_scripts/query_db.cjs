const mysql = require('mysql2/promise');

async function main() {
  const db = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3308,
    user: 'zeo_user',
    password: 'zeopassword',
    database: 'zeo_website'
  });
  
  const [fallback] = await db.execute('SELECT name, country FROM destinations ORDER BY id DESC LIMIT 6;');
  console.log("Fallback Destinations:", fallback);
  
  await db.end();
}
main().catch(console.error);
