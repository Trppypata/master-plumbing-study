import querystring from 'querystring';

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

export const getAccessToken = async () => {
  if (!refresh_token) {
    return { access_token: null };
  }

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token,
      }),
      cache: 'no-store',
    });

    return response.json();
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return { access_token: null };
  }
};

export const getNowPlaying = async () => {
  const { access_token } = await getAccessToken();

  if (!access_token) {
    return null;
  }

  return fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    cache: 'no-store',
  });
};

export const getPlayerState = async () => {
  const { access_token } = await getAccessToken();

  if (!access_token) {
    return null;
  }

  return fetch('https://api.spotify.com/v1/me/player', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    cache: 'no-store',
  });
};

// Controls
export const play = async () => {
  const { access_token } = await getAccessToken();
  return fetch('https://api.spotify.com/v1/me/player/play', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${access_token}` },
  });
};

export const pause = async () => {
  const { access_token } = await getAccessToken();
  return fetch('https://api.spotify.com/v1/me/player/pause', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${access_token}` },
  });
};

export const next = async () => {
  const { access_token } = await getAccessToken();
  return fetch('https://api.spotify.com/v1/me/player/next', {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}` },
  });
};

export const previous = async () => {
  const { access_token } = await getAccessToken();
  return fetch('https://api.spotify.com/v1/me/player/previous', {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}` },
  });
};
