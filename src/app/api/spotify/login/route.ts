import { NextResponse } from 'next/server';
import querystring from 'querystring';

export async function GET() {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const redirect_uri = 'http://localhost:3000/api/spotify/callback';
  
  // Scopes needed for playback control and reading state
  const scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing';

  const queryParams = querystring.stringify({
    response_type: 'code',
    client_id,
    scope,
    redirect_uri,
  });

  return NextResponse.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
}
