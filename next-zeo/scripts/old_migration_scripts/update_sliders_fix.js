import mysql from 'mysql2/promise';

async function fixSliders() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3308,
    user: 'zeo_user',
    password: 'zeopassword',
    database: 'zeo_website'
  });

  try {
    console.log('Fixing slider 4 (Kailash)...');
    await connection.execute(
      'UPDATE sliders SET video_url = ? WHERE id = ?',
      ['/video/1766036119824_1757086209295_kailash__1_.mp4', 4]
    );

    console.log('Fixing slider 1 (Experience Nepal)...');
    await connection.execute(
      'UPDATE sliders SET video_url = ? WHERE id = ?',
      ['/video/1766079680376_1218_4__1___1_.mp4', 1]
    );

    console.log('Fixing slider 3 (Cultural Heritage Tours)...');
    await connection.execute(
      'UPDATE sliders SET video_url = ? WHERE id = ?',
      ['', 3]
    );
    
    console.log('Fix complete.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

fixSliders();
