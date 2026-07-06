import mysql from 'mysql2/promise';

async function updateSliders() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3308,
    user: 'zeo_user',
    password: 'zeopassword',
    database: 'zeo_website'
  });

  try {
    console.log('Updating slider 4 (Kailash)...');
    await connection.execute(
      'UPDATE sliders SET video_url = ? WHERE id = ?',
      ['/video/1766036119824_1757086209295_kailash__1_.mp4', 4]
    );

    console.log('Updating slider 1 (Nepal)...');
    await connection.execute(
      'UPDATE sliders SET video_url = ? WHERE id = ?',
      ['/video/1766079680376_1218_4__1___1_.mp4', 1]
    );
    
    console.log('Update complete.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

updateSliders();
