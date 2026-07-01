import fs from 'fs';

async function downloadIcon() {
  const url = 'https://iili.io/C7RO0zv.md.png';
  try {
    const response = await fetch(url);
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync('public/icon-192.png', buffer);
      fs.writeFileSync('public/icon-512.png', buffer);
      console.log('Downloaded successfully');
    } else {
      console.log('Response not ok:', response.status);
    }
  } catch (e) {
    console.error('Error fetching', url, e);
  }
}

downloadIcon();
