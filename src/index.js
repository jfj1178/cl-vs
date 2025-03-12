addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  // Verify auth token
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.AUTH_TOKEN}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const url = new URL(request.url);
    
    // Use the environment variable for VSCODE_SERVER
    const vscodeServerUrl = new URL(url.pathname, env.VSCODE_SERVER);
    
    const headers = new Headers(request.headers);
    headers.set('Host', vscodeServerUrl.hostname);

    const response = await fetch(vscodeServerUrl.toString(), {
      method: request.method,
      headers: headers,
      body: request.body
    });

    const modifiedResponse = new Response(response.body, response);
    Object.keys(corsHeaders).forEach(key => {
      modifiedResponse.headers.set(key, corsHeaders[key]);
    });

    return modifiedResponse;
  } catch (error) {
    return new Response('Error: ' + error.message, { 
      status: 500,
      headers: corsHeaders
    });
  }
}
