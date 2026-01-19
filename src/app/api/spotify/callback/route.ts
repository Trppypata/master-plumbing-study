import { NextResponse } from 'next/server';
import querystring from 'querystring';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirect_uri = 'http://localhost:3000/api/spotify/callback';

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
  const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error, description: data.error_description }, { status: 400 });
    }

    // Return the Refresh Token to the user so they can add it to .env.local
    // We display it in a clean HTML page
    return new NextResponse(`
      <html>
        <head>
          <title>Spotify Connected</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #121212; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #1e1e1e; padding: 2rem; border-radius: 12px; max-width: 500px; width: 90%; text-align: center; border: 1px solid #333; }
            h1 { color: #1DB954; margin-top: 0; }
            code { background: #333; padding: 1rem; border-radius: 6px; display: block; word-break: break-all; margin: 1rem 0; font-family: monospace; user-select: all; }
            p { color: #aaa; line-height: 1.5; }
            .copy-hint { font-size: 0.8rem; opacity: 0.7; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>🎉 Connected!</h1>
            <p><strong>Step 1:</strong> Copy this Refresh Token:</p>
            <code>${data.refresh_token}</code>
            <p><strong>Step 2:</strong> Open your project's <code>.env.local</code> file.</p>
            <p><strong>Step 3:</strong> Add this line (replace X with the code above):</p>
            <p style="font-family: monospace; background: #000; padding: 0.5rem; border-radius: 4px;">SPOTIFY_REFRESH_TOKEN=X</p>
            <p><strong>Step 4:</strong> Restart your dev server (Ctrl+C, then npm run dev).</p>
            <a href="/" style="color: #1DB954; text-decoration: none; margin-top: 1rem; display: inline-block;">Back to App</a>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
