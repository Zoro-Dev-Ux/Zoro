const axios = require('axios');
const crypto = require('crypto');

const AUTHOR_NAME = "Raphael ilom";
const AUTHOR_HASH = crypto.createHash('sha256').update(AUTHOR_NAME).digest('hex');

module.exports = {
  config: {
    name: "spotify",
    aliases: ["spotifydl", "spdl"],
    version: "1.0",
    author: AUTHOR_NAME,
    countDown: 5,
    role: 0,
    shortDescription: "Download Spotify tracks",
    longDescription: "Search and download tracks from Spotify",
    category: "media",
    guide: {
      en: "{pn} <song name>"
    }
  },

  onStart: async function ({ message, args }) {
    if (crypto.createHash('sha256').update(this.config.author).digest('hex') !== AUTHOR_HASH) {
      return message.reply("Unauthorized: Author name has been modified.");
    }

    if (args.length === 0) {
      return message.reply("Please provide a song name to search for.");
    }

    const query = args.join(" ");
    message.reply(`🔎 Searching for "${query}"... Please wait.`);

    try {
      const tracks = await searchSpotify(query);

      if (tracks.length === 0) {
        return message.reply("No tracks found. Please try a different search query.");
      }

      const track = tracks[0];
      const { title, artists, album, releaseDate, durationMs, previewUrl, spotifyUrl } = track;

      const audioStream = await global.utils.getStreamFromURL(previewUrl);

      await message.reply({
        body: `🎵 Found: "${title}"\n` +
              `🎤 Artist(s): ${artists.join(", ")}\n` +
              `💽 Album: ${album}\n` +
              `📅 Release Date: ${releaseDate}\n` +
              `⏱️ Duration: ${formatDuration(durationMs)}\n` +
              `🔗 Spotify URL: ${spotifyUrl}\n\n` +
              `📨 Sending 30-second preview...`,
        attachment: audioStream
      });
    } catch (error) {
      console.error(error);
      message.reply("An error occurred while processing your request. Please try again later.");
    }
  }
};

async function searchSpotify(query) {
  try {
    const response = await axios.get(`https://api.spotify.com/v1/search`, {
      params: {
        q: query,
        type: 'track',
        limit: 1
      },
      headers: {
        'Authorization': `Bearer ${await getSpotifyToken()}`
      }
    });

    return response.data.tracks.items.map(track => ({
      title: track.name,
      artists: track.artists.map(artist => artist.name),
      album: track.album.name,
      releaseDate: track.album.release_date,
      durationMs: track.duration_ms,
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls.spotify
    }));
  } catch (error) {
    console.error('Error searching Spotify:', error);
    throw error;
  }
}

async function getSpotifyToken() {
  const clientId = '138ff8d23e264edba4d5838c811056ce';
  const clientSecret = 'e3578c75d5e04cf59f21af566ef877cd';

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials', 
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    throw error;
  }
}

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds.padStart(2, '0')}`;
  
