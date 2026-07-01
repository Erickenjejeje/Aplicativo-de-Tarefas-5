import fs from 'fs';

async function downloadIcon() {
  const urls = ['https://iili.io/C7RO0zv.png', 'https://iili.io/C7RO0zv.jpg'];
  for (const url of urls) {
    console.log('Trying', url);
    try {
      const response = await fetch(url);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync('public/new-icon.png', buffer);
        console.log('Downloaded successfully from', url);
        return;
      } else {
        console.log('Response not ok:', response.status);
      }
    } catch (e) {
      console.error('Error fetching', url, e);
    }
  }
  console.error('Failed to download from all URLs');
}

downloadIcon();
