import { Intents } from 'discord.js';
import Logger from './src/component/Logger.js';
import EarthquakeClient from './src/client/EarthquakeClient.js';

const log = new Logger('process');
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
  databaseURL: process.env.DB_URL,
});

log.info('process start');
client.setup();
client.launch();

process.on('uncaughtException', (e) => {
  log.error(e);
  process.exit(1);
});
