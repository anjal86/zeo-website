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
    const [rows] = await connection.execute('SELECT id, title, video_url FROM sliders');
    console.log('Current sliders:', rows);
    
    for (const row of rows) {
      if (row.video_url && row.video_url.includes('vercel-storage.com')) {
        console.log(`Updating slider ${row.id} to use local video...`);
        await connection.execute(
          'UPDATE sliders SET video_url = ? WHERE id = ?',
          ['/video/slider video.mp4', row.id]
        );
      }
    }
    
    console.log('Update complete.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

updateSliders();
