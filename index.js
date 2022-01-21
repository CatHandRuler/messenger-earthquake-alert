import { Intents } from 'discord.js';
import EarthquakeClient from './src/client/EarthquakeClient.js';

const client = new EarthquakeClient({
  discord: {
    option: { intents: [Intents.FLAGS.GUILDS] },
    token: process.env.DISCORD_TOKEN,
    id: process.env.DISCORD_ID,
  },
  telegram: {
    option: { token: process.env.TELEGRAM_TOKEN },
    id: process.env.TELEGRAM_ID,
  },
  key: process.env.EARTHQUAKE_API_KEY,
});
console.log(
  `${'-'.repeat(50)} ${new Date().toLocaleString('ko-KR')} ${'-'.repeat(50)}`
);
client.setup();
client.launch();

process.on('uncaughtException', (e) => {
  console.log(
    `${'-'.repeat(50)} ${new Date().toLocaleString('ko-KR')} ${'-'.repeat(50)}`
  );
  console.error(e);
  process.exit(1);
});
