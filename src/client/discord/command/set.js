import Setting from '../../../db/model/setting.js';
import { SlashCommandBuilder } from '@discordjs/builders';

const name = 'set';
const description = 'Sets alert channel';
const slashBuilder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description);

function run(interaction) {
  if (
    !interaction.channel.permissionsFor(interaction.guild.me, 'SEND_MESSAGES')
  )
    return interaction.reply('Channel permission error :(');
  Setting.updateOne(
    { platform: 'discord', guild_id: interaction.guildId },
    { channel_id: interaction.channelId }
  ).then(() => interaction.reply('Channel updated :D'));
}

export { name, description, slashBuilder, run };
