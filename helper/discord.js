require('dotenv').config();

const sendDiscordContents = async (content, urls) => {
  if (!content || !urls) {
    return;
  }

  const env = process.env.NODE_ENV || 'development';

  if (env === 'development') {
    console.log('urls', urls);
    console.log('content');
    console.log(content);
  } else {
    for (const url of urls) {
      try {
        const fetchOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        };
        const response = await fetch(url, fetchOptions);
        // console.log(await response.json());
      } catch (err) {
        console.log(err);
      }
    }
  }
};

const sendAlert = async (error) => {
  const urls = process.env.DISCORD_ERROR.split(',');

  console.log(error);
  await sendDiscordContents(error.stack.toString(), urls);

  return error;
};

module.exports = {
  sendDiscordContents,
  sendAlert,
};
