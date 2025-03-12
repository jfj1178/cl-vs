const { exec } = require('child_process');
const fs = require('fs');

// Get current UTC time in YYYY-MM-DD HH:MM:SS format
function getCurrentUTCTime() {
    const now = new Date();
    return now.toISOString()
        .replace(/T/, ' ')
        .replace(/\..+/, '');
}

// Store session information
const sessionInfo = {
    startTime: getCurrentUTCTime(),
    user: 'jfj1178',
    logs: []
};

// Create log file
const logFile = 'sshx-output.log';

// Function to log with timestamp
function logWithTimestamp(message, type = 'info') {
    const timestamp = getCurrentUTCTime();
    const logEntry = `[${timestamp}] [${type}] ${message}`;
    console.log(logEntry);
    sessionInfo.logs.push(logEntry);
    fs.appendFileSync(logFile, logEntry + '\n');
}

// Setup SSHX with output capture
async function setupSSHX() {
    return new Promise((resolve, reject) => {
        logWithTimestamp('Starting SSHX setup...');
        logWithTimestamp(`Session started by user: ${sessionInfo.user}`);
        
        const sshxProcess = exec('curl -sSf https://sshx.io/get | sh -s run', {
            shell: true,
            maxBuffer: 1024 * 1024 * 10 // 10MB buffer
        });

        // Capture stdout
        sshxProcess.stdout.on('data', (data) => {
            logWithTimestamp(`SSHX Output: ${data.trim()}`);
        });

        // Capture stderr
        sshxProcess.stderr.on('data', (data) => {
            logWithTimestamp(`SSHX Error: ${data.trim()}`, 'error');
        });

        // Handle process completion
        sshxProcess.on('close', (code) => {
            if (code === 0) {
                logWithTimestamp('SSHX setup completed successfully');
                resolve();
            } else {
                logWithTimestamp(`SSHX setup failed with code ${code}`, 'error');
                reject(new Error(`Process exited with code ${code}`));
            }
        });

        // Handle process errors
        sshxProcess.on('error', (error) => {
            logWithTimestamp(`SSHX process error: ${error.message}`, 'error');
            reject(error);
        });
    });
}

// Write initial session information
fs.writeFileSync('session-info.json', JSON.stringify({
    startTime: sessionInfo.startTime,
    user: sessionInfo.user,
    workerUrl: 'https://vscode-tunnel.anuradhadey85.workers.dev/'
}, null, 2));

// Start the setup
console.log(`
==================================
SSHX Tunnel Setup
==================================
Current Date and Time (UTC): ${sessionInfo.startTime}
Current User's Login: ${sessionInfo.user}
Worker URL: https://vscode-tunnel.anuradhadey85.workers.dev/
==================================
`);

setupSSHX()
    .then(() => {
        logWithTimestamp('Setup completed successfully');
    })
    .catch((error) => {
        logWithTimestamp(`Setup failed: ${error.message}`, 'error');
        process.exit(1);
    });

// Keep process alive
process.on('SIGINT', () => {
    logWithTimestamp('Received SIGINT signal, cleaning up...');
    process.exit(0);
});

// Export session info for worker
module.exports = {
    sessionInfo,
    getCurrentUTCTime
};
