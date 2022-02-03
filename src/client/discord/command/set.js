import { SlashCommandBuilder } from '@discordjs/builders';
import Setting from '../../../db/model/setting.js';

const name = 'set';
const description = 'Sets alert channel';
const slashBuilder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description);

function run(interaction) {
  if (
    !interaction.channel.permissionsFor(interaction.guild.me, 'SEND_MESSAGES')
  ) {
    interaction.reply('Channel permission error :(');
    return;
  }

  Setting.updateOne(
    { platform: 'discord', guild_id: interaction.guildId },
    { channel_id: interaction.channelId }
  ).then(() => interaction.reply('Channel updated :D'));
}

export { name, description, slashBuilder, run };
