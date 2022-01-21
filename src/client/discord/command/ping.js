import { SlashCommandBuilder } from '@discordjs/builders';

const name = 'ping';
const description = 'Send client WebSocket ping';
const slashBuilder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description);

function run(interaction, client) {
  interaction.reply(`Client WebSocket ping: ${client.ws.ping}ms`);
}

export { name, description, slashBuilder, run };
