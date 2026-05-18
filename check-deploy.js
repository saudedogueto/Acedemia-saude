const https = require('https');
https.get('https://academia-saude-293b.vercel.app/login', (r) => {
  let b = '';
  r.on('data', d => b += d);
  r.on('end', () => {
    const m = b.match(/_next\/static\/chunks\/app\/login[^"]*\.js/);
    if (m) {
      const u = 'https://academia-saude-293b.vercel.app/' + m[0];
      console.log('JS URL:', u);
      https.get(u, (r2) => {
        let j = '';
        r2.on('data', d => j += d);
        r2.on('end', () => {
          console.log('Has OLD key:', j.includes('AIzaSyBi3Sku'));
          console.log('Has NEW key:', j.includes('JF-l34'));
        });
      });
    } else {
      console.log('No JS chunk match found');
    }
  });
});
