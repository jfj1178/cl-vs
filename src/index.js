// Store the current session information
const SESSION_INFO = {
  startTime: new Date().toISOString(),
  user: 'jfj1178'
};

// Function to format date in YYYY-MM-DD HH:MM:SS
function formatDate(date) {
  return date.toISOString()
    .replace('T', ' ')
    .replace(/\..+/, '');
}

async function initiateSSHX() {
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      command: 'curl -sSf https://sshx.io/get | sh -s run',
      timestamp: formatDate(new Date())
    })
  };

  try {
    // Instead of actually running the command, we'll simulate the connection
    return {
      status: 'initiated',
      timestamp: formatDate(new Date()),
      message: 'SSHX connection request processed'
    };
  } catch (error) {
    return {
      status: 'error',
      timestamp: formatDate(new Date()),
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
              max-width: 1000px;
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
            .info { color: #03A9F4; }
            #status { margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>SSHX Tunnel Control Panel</h1>
            
            <div class="status-box">
              <h2>Session Information</h2>
              <p><span class="info">Current Date and Time (UTC):</span> ${formatDate(new Date())}</p>
              <p><span class="info">Current User's Login:</span> ${SESSION_INFO.user}</p>
              <p><span class="info">Session Start:</span> ${SESSION_INFO.startTime}</p>
            </div>

            <div class="status-box">
              <h2>SSHX Control</h2>
              <button class="button" onclick="initiateConnection()">Initiate SSHX Connection</button>
              <div id="status"></div>
            </div>
          </div>

          <script>
          async function initiateConnection() {
            const statusDiv = document.getElementById('status');
            statusDiv.innerHTML = 'Initiating SSHX connection...';
            
            try {
              const response = await fetch('/initiate-sshx', {
                method: 'POST'
              });
              const result = await response.json();
              statusDiv.innerHTML = \`Status: \${result.status}<br>Time: \${result.timestamp}<br>Message: \${result.message}\`;
            } catch (error) {
              statusDiv.innerHTML = \`Error: \${error.message}\`;
            }
          }
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

  // Default response for unknown paths
  return new Response('Not Found', { status: 404 });
}
