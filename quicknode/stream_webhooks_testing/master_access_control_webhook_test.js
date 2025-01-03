const http = require('http');

const server = http.createServer((req, res) => {
    console.log('Request received:', req.method, req.url);
    if (req.method === 'POST' && req.url === '/master_access_control') {
        let body = '';
        console.log('Received webhook. Request details:');
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            console.log('Received webhook. Request details:');
            console.log('Headers:', JSON.stringify(req.headers, null, 2));
            
            try {
                const jsonData = JSON.parse(body);
                console.log('Parsed JSON data:');
                console.log(JSON.stringify(jsonData, null, 2));
            } catch (error) {
                console.log('Error parsing JSON:', error.message);
                console.log('Raw body:', body);
            }
            
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Webhook received');
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});