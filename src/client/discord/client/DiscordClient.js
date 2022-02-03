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

    earthquakeClient.on('earthquake', this.#sendEarthquakeMessage);
  }

  setup() {
    this.#setupCommands();
    this.#setupEvents();
  }

  #setupCommands() {
    const cmdPath = path.join(
      path.resolve(),
      'src',
      'client',
      'discord',
      'command'
    );

    readdir(cmdPath)
      .then((fileNames) =>
        fileNames.forEach((fileName) =>
          import(`../command/${fileName}`)
            .then((cmd) => this.#commands.set(cmd.name, cmd))
            .catch(log.error.bind(log))
        )
      )
      .catch(log.error.bind(log));
  }

  #setupEvents() {
    this.once('ready', (client) => {
      client.user.setActivity('Earthquake Alert', { type: 'LISTENING' });
      client.user.setStatus('online');
      this.guilds
        .fetch({ limit: 200 })
        .then((guildCollection) =>
          guildCollection.each((guild) =>
            this.#tokenSettedRest.put(
              Routes.applicationGuildCommands(this.#appID, guild.id),
              {
                body: this.#commands.map((cmdModule) => cmdModule.slashBuilder),
              }
            )
          )
        )
        .catch(log.error.bind(log));
      log.info(`Logged in as client ${client.user.tag}`);
    });

    this.on('guildCreate', async (guild) => {
      try {
        const channels = await (await guild.fetch()).channels.fetch();
        const channel = await new Promise((resolve) =>
          // eslint-disable-next-line no-promise-executor-return
          resolve(
            channels.find(
              (ch) =>
                ch.type === 'GUILD_TEXT' &&
                ch.viewable &&
                ch.permissionsFor(guild.me).has('SEND_MESSAGES')
            )
          )
        );
        await this.#tokenSettedRest.put(
          Routes.applicationGuildCommands(this.#appID, guild.id),
          {
            body: this.#commands.map((cmdModule) => cmdModule.slashBuilder),
          }
        );
        await Setting.create({
          platform: 'discord',
          guild_id: guild.id,
          channel_id: channel.id || null,
        });
        channel.send('안녕하세요! 이 봇을 추가해 주셔서 감사합니다!');
      } catch (e) {
        log.error(e);
      }
    });

    this.on('guildDelete', (guild) =>
      Setting.findOneAndDelete(
        { platform: 'discord', guild_id: guild.id },
        log.error.bind(log)
      )
    );

    this.on('interactionCreate', (interaction) => {
      if (!interaction.isCommand) return;

      const command = this.#commands.get(interaction.commandName);

      command.run(interaction, this);
    });
  }

  #sendEarthquakeMessage(values) {
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

    Setting.find({ platform: 'discord' }).then((guilds) => {
      if (!guilds) return;
      guilds.forEach((guild) => {
        const channel = this.channels.cache.find(
          (ch) => ch.id === guild.channel_id
        );
        if (!channel) return;
        channel.send(
          `${formattedDateStr.year}년 ${formattedDateStr.month}월 ${
            formattedDateStr.day
          }일 ${formattedDateStr.time.hour}시 ${
            formattedDateStr.time.minute
          }분 발표된 지진 정보입니다.\n\n진앙 깊이: \`${
            values.dep || '정보없음'
          }km\`\n위치: \`${values.loc || '정보없음'}\`\n규모: \`${
            values.mt || '정보없음'
          }\`\n진도: \`${values.inT || '정보없음'}\`\n참고사항: \`${
            values.rem || '정보없음'
          }\`\n데이터는 기상청 공공 API에서 제공받았습니다.`
        );
      });
    });
  }
}
