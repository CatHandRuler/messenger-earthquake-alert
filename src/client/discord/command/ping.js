import { SlashCommandBuilder } from '@discordjs/builders';
import os from 'os';

const name = 'ping';
const description = 'Send client WebSocket ping';
const slashBuilder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description);

function run(interaction, client) {
  const uptime = os.uptime();
  const formattedUptime = `${parseInt(uptime / 86400, 10)}d ${parseInt(
    (uptime % 86400) / 3600,
    10
  )}h ${parseInt((uptime % 3600) / 60, 10)}m`;
  interaction.reply(
    `${
      os.cpus().length
    } Cores of CPU\nServer Uptime: ${formattedUptime}\nWebSocket ping: ${
      client.ws.ping
    }ms`
  );
}

export { name, description, slashBuilder, run };
