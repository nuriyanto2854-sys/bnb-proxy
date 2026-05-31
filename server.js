const http = require('http');
const WebSocket = require('ws');
const net = require('net');

const PORT = process.env.PORT || 8080;

// 1. Buat HTTP Server biasa agar Glitch mengenali aplikasi ini sebagai website aktif
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Server Jembatan Proxy Aktif dan Berjalan Lancar!');
});

// 2. Tumpangkan WebSocket Server di atas HTTP Server tadi
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Ada pengunjung blog yang terhubung...');

    // Hubungkan ke Pool Unmineable
    const pool = net.connect(3333, 'rx.unmineable.com', () => {
        console.log('Sukses menghubungkan jembatan ke Unmineable BNB!');
    });

    ws.on('message', (message) => {
        if (pool.writable) {
            pool.write(message.toString().trim() + '\n');
        }
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    ws.on('close', () => {
        pool.end();
    });

    pool.on('close', () => {
        ws.close();
    });

    ws.on('error', (err) => console.error('WS Error:', err.message));
    pool.on('error', (err) => console.error('Pool Error:', err.message));
});

// 3. Jalankan server gabungan ini di port resmi Glitch
server.listen(PORT, () => {
    console.log(`Server aktif di port ${PORT}`);
});
