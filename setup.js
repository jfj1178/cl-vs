const os = require('os');
const fs = require('fs');
const dotenv = require('dotenv');

// Function to get IP address
function getIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (const alias of iface) {
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '127.0.0.1';
}

// Get the IP address
const ipAddress = getIPAddress();

// Generate a random auth token
const authToken = require('crypto').randomBytes(32).toString('hex');

// Create or update .env file
const envContent = `VSCODE_SERVER=http://${ipAddress}:8080
PORT=8080
AUTH_TOKEN=${authToken}
`;

fs.writeFileSync('.env', envContent);

console.log(`Environment configuration created successfully!`);
console.log(`Server IP: ${ipAddress}`);
console.log(`Auth Token generated and saved to .env`);
