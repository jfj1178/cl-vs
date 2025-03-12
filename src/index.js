addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    const url = new URL(request.url)
    
    // Basic homepage response
    if (url.pathname === '/') {
      return new Response(`
        <html>
          <head>
            <title>VS Code Tunnel</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                max-width: 800px; 
                margin: 40px auto; 
                padding: 20px;
                line-height: 1.6;
              }
              .status { 
                padding: 20px; 
                background: #f0f0f0; 
                border-radius: 5px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <h1>VS Code Tunnel Status</h1>
            <div class="status">
              <p>✅ Worker is running</p>
              <p>Server Time: ${new Date().toUTCString()}</p>
            </div>
          </body>
        </html>
      `, {
        headers: {
          'Content-Type': 'text/html',
          ...corsHeaders
        }
      })
    }

    // Forward the request to your VS Code server
    const vscodeServer = 'YOUR_SERVER_IP:8080' // Replace with your actual server IP
    const vscodeUrl = new URL(url.pathname, `http://${vscodeServer}`)
    
    const headers = new Headers(request.headers)
    headers.set('Host', vscodeUrl.hostname)

    const response = await fetch(vscodeUrl.toString(), {
      method: request.method,
      headers: headers,
      body: request.body
    })

    const modifiedResponse = new Response(response.body, response)
    Object.keys(corsHeaders).forEach(key => {
      modifiedResponse.headers.set(key, corsHeaders[key])
    })

    return modifiedResponse
  } catch (error) {
    return new Response(`Error: ${error.message}`, { 
      status: 500,
      headers: corsHeaders
    })
  }
}
