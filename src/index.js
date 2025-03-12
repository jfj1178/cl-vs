// Import session info from setup-worker
const { sessionInfo, getCurrentUTCTime } = require('./setup-worker');

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  const url = new URL(request.url)

  // Main status page
  if (url.pathname === '/') {
    return new Response(`
      <html>
        <head>
          <title>SSHX Tunnel Status</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              background-color: #1e1e1e;
              color: #ffffff;
              margin: 40px;
              line-height: 1.6;
            }
            .container {
              max-width: 1000px;
              margin: 0 auto;
            }
            .status-box {
              background-color: #2d2d2d;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .success { color: #4CAF50; }
            .info { color: #03A9F4; }
            .error { color: #f44336; }
            #logOutput {
              background: #000;
              padding: 15px;
              border-radius: 5px;
              height: 400px;
              overflow-y: auto;
              font-size: 14px;
            }
            .timestamp { color: #888; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>SSHX Tunnel Status Dashboard</h1>
            
            <div class="status-box">
              <h2>Session Information</h2>
              <p><span class="info">Current Date and Time (UTC):</span> ${getCurrentUTCTime()}</p>
              <p><span class="info">Current User's Login:</span> ${sessionInfo.user}</p>
              <p><span class="info">Session Start Time:</span> ${sessionInfo.startTime}</p>
              <p><span class="success">Worker Status:</span> Active</p>
            </div>

            <div class="status-box">
              <h2>SSHX Output Log</h2>
              <div id="logOutput">
                ${sessionInfo.logs.map(log => `<div>${log}</div>`).join('\n')}
              </div>
            </div>
          </div>

          <script>
            // Auto-refresh logs every 5 seconds
            setInterval(() => {
              fetch('/api/logs')
                .then(response => response.json())
                .then(logs => {
                  document.getElementById('logOutput').innerHTML = 
                    logs.map(log => `<div>${log}</div>`).join('\n');
                });
            }, 5000);
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

  // API endpoint for logs
  if (url.pathname === '/api/logs') {
    return new Response(JSON.stringify(sessionInfo.logs), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  // Forward other requests to SSHX tunnel
  try {
    const response = await fetch(request);
    return new Response(response.body, {
      status: response.status,
      headers: {
        ...Object.fromEntries(response.headers),
        ...corsHeaders
      }
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: corsHeaders
    });
  }
}
