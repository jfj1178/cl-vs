// Store logs in memory (since Workers are stateless, we'll use a simple array)
let sshxLogs = [];
const MAX_LOGS = 100;

// Function to add log entry
function addLog(message, type = 'info') {
  const log = {
    timestamp: new Date().toISOString(),
    type: type,
    message: message
  };
  sshxLogs.unshift(log); // Add to beginning
  if (sshxLogs.length > MAX_LOGS) {
    sshxLogs.pop(); // Remove oldest entry
  }
  return log;
}

async function initiateSSHX() {
  addLog('Initiating SSHX connection...', 'info');
  
  try {
    // Simulate SSHX connection process
    addLog('Running: curl -sSf https://sshx.io/get | sh -s run', 'command');
    addLog('SSHX process starting...', 'info');
    addLog('Establishing secure tunnel...', 'info');
    
    // Add actual SSHX output simulation
    addLog('Port forwarding enabled on 8080', 'success');
    addLog('Remote access URL: https://remote.sshx.io/...', 'info');
    
    return {
      status: 'connected',
      timestamp: new Date().toISOString(),
      message: 'SSHX connection established'
    };
  } catch (error) {
    addLog(`Error: ${error.message}`, 'error');
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      message: error.message
    };
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(request.url);

  // Handle the root path
  if (url.pathname === '/') {
    return new Response(`
      <html>
        <head>
          <title>SSHX Tunnel Control Panel</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              background-color: #1e1e1e;
              color: #ffffff;
              margin: 40px;
              line-height: 1.6;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
            }
            .status-box {
              background-color: #2d2d2d;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .button {
              background-color: #4CAF50;
              border: none;
              color: white;
              padding: 15px 32px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              margin: 4px 2px;
              cursor: pointer;
              border-radius: 4px;
            }
            .log-container {
              background-color: #000;
              padding: 20px;
              border-radius: 8px;
              height: 400px;
              overflow-y: auto;
              font-family: 'Courier New', monospace;
              margin-top: 20px;
            }
            .log-entry {
              margin: 5px 0;
              padding: 5px;
              border-bottom: 1px solid #333;
            }
            .log-timestamp {
              color: #888;
            }
            .log-info { color: #03A9F4; }
            .log-error { color: #f44336; }
            .log-success { color: #4CAF50; }
            .log-command { color: #FF9800; }
            .refresh-button {
              background-color: #2196F3;
              margin-left: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>SSHX Tunnel Control Panel</h1>
            
            <div class="status-box">
              <h2>Session Information</h2>
              <p><span class="log-info">Current Date and Time (UTC):</span> 2025-03-12 16:10:58</p>
              <p><span class="log-info">Current User's Login:</span> jfj1178</p>
            </div>

            <div class="status-box">
              <h2>SSHX Control</h2>
              <button class="button" onclick="initiateConnection()">Start SSHX Connection</button>
              <button class="button refresh-button" onclick="refreshLogs()">Refresh Logs</button>
              
              <div class="log-container" id="logOutput">
                <div class="log-entry">
                  <span class="log-timestamp">[${new Date().toISOString()}]</span>
                  <span class="log-info">Waiting for SSHX connection...</span>
                </div>
              </div>
            </div>
          </div>

          <script>
          async function initiateConnection() {
            const logOutput = document.getElementById('logOutput');
            logOutput.innerHTML = '<div class="log-entry"><span class="log-info">Initiating connection...</span></div>';
            
            try {
              const response = await fetch('/initiate-sshx', {
                method: 'POST'
              });
              const result = await response.json();
              refreshLogs();
            } catch (error) {
              logOutput.innerHTML += \`<div class="log-entry log-error">Error: \${error.message}</div>\`;
            }
          }

          async function refreshLogs() {
            try {
              const response = await fetch('/logs');
              const logs = await response.json();
              const logOutput = document.getElementById('logOutput');
              
              logOutput.innerHTML = logs.map(log => \`
                <div class="log-entry">
                  <span class="log-timestamp">[\${new Date(log.timestamp).toLocaleString()}]</span>
                  <span class="log-\${log.type}">\${log.message}</span>
                </div>
              \`).join('');
              
              logOutput.scrollTop = logOutput.scrollHeight;
            } catch (error) {
              console.error('Error fetching logs:', error);
            }
          }

          // Auto-refresh logs every 5 seconds
          setInterval(refreshLogs, 5000);
          </script>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
        ...corsHeaders
      }
    });
  }

  // Handle SSHX initiation request
  if (url.pathname === '/initiate-sshx') {
    const result = await initiateSSHX();
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  // Handle logs request
  if (url.pathname === '/logs') {
    return new Response(JSON.stringify(sshxLogs), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  // Default response for unknown paths
  return new Response('Not Found', { status: 404 });
}
