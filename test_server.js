import http from 'http';
http.get('http://localhost:5000/', (res) => {
  console.log('Server is ONLINE, status code:', res.statusCode);
  process.exit(0);
}).on('error', (err) => {
  console.log('Server is OFFLINE, error:', err.message);
  process.exit(1);
});
