import path from 'path';
import { readdir } from 'fs/promises';
import { Client, Collection } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import Logger from '../../../component/Logger.js';
import Setting from '../../../db/model/setting.js';

const log = new Logger('client.discord');

export default class DiscordClient extends Client {
  #appID;

  #commands;

  #tokenSettedRest;

  constructor(options, earthquakeClient) {
    super(options.option);

    this.token = options.token;
    this.#appID = options.id;
    this.#commands = new Collection();
    this.#tokenSettedRest = new REST({ version: 9 }).setToken(this.token);

    earthquakeClient.on('earthquake', this.#sendEarthquakeMessage.bind(this));
  }

  async setup() {
    const slashBuilders = await this.#setupCommands();
    return this.#setupEvents(slashBuilders);
  }

  async #setupCommands() {
    const cmdPath = path.join(
      path.resolve(),
      'src',
      'client',
      'discord',
      'command'
    );
    const fileNames = await readdir(cmdPath);
    const cmdModules = await Promise.all(
      fileNames.map((fileName) => import(`../command/${fileName}`))
    );

    return cmdModules.map(
      (cmdModule) =>
        this.#commands.set(cmdModule.name, cmdModule) && cmdModule.slashBuilder
    );
  }

  #setupEvents(slashCommandBuilders) {
    this.once('ready', async (client) => {
      const guildCollection = await this.guilds.fetch({ limit: 200 });

      await Promise.all(
        guildCollection.map((guild) =>
          this.#tokenSettedRest.put(
            Routes.applicationGuildCommands(this.#appID, guild.id),
            {
              body: slashCommandBuilders,
            }
          )
        )
      );
      client.user.setActivity('Earthquake Alert', { type: 'LISTENING' });
      client.user.setStatus('online');
      log.info(`Logged in as client ${client.user.tag}`);
    });

    this.on('guildCreate', async (guild) => {
      try {
        const channels = await guild.channels.fetch();
        const channel = channels.find(
          (ch) =>
            ch.type === 'GUILD_TEXT' &&
            ch.viewable &&
            ch.permissionsFor(guild.me).has('SEND_MESSAGES')
        );

        await Promise.all([
          this.#tokenSettedRest.put(
            Routes.applicationGuildCommands(this.#appID, guild.id),
            {
              body: slashCommandBuilders,
            }
          ),
          Setting.create({
            platform: 'discord',
            guild_id: guild.id,
            channel_id: channel.id || null,
          }),
        ]);
        channel.send('???????????????! ??? ?????? ????????? ????????? ???????????????!');
      } catch (e) {
        log.error(e);
      }
    });

    this.on('guildDelete', (guild) => {
      Setting.findOneAndDelete({ platform: 'discord', guild_id: guild.id });
    });

    this.on('interactionCreate', (interaction) => {
      if (!interaction.isCommand) return;
      const command = this.#commands.get(interaction.commandName);

      command.run(interaction, this);
    });
  }

  async #sendEarthquakeMessage(values) {
    const dateStr = String(values.tmFc);
    const formattedDateStr = {
      year: dateStr.substring(0, 4),
      month: dateStr.substring(4, 6),
      day: dateStr.substring(6, 8),
      time: {
        hour: dateStr.substring(8, 10),
        minute: dateStr.substring(10, 12),
      },
    };
    const guildSettings = await Setting.find({ platform: 'discord' });

    guildSettings.map((guildSetting) =>
      this.channels
        .fetch(guildSetting.channel_id)
        .then((channel) =>
          channel.send(
            `${formattedDateStr.year}??? ${formattedDateStr.month}??? ${
              formattedDateStr.day
            }??? ${formattedDateStr.time.hour}??? ${
              formattedDateStr.time.minute
            }??? ????????? ?????? ???????????????.\n\n?????? ??????: \`${
              values.dep || '????????????'
            }km\`\n??????: \`${values.loc || '????????????'}\`\n??????: \`${
              values.mt || '????????????'
            }\`\n??????: \`${values.inT || '????????????'}\`\n????????????: \`${
              values.rem || '????????????'
            }\`\n???????????? ????????? ?????? API?????? ?????????????????????.`
          )
        )
    );
  }
}
