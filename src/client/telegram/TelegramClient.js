import { Telegraf } from 'telegraf';
import Setting from '../../db/model/setting.js';
import Logger from '../../component/Logger.js';

const log = new Logger('client.telegram');

export default class TelegramClient extends Telegraf {
  #id;

  constructor(options) {
    super(options.option);

    this.#id = options.id;
    this.catch(log.error.bind(log));
  }

  setup() {
    this.#setupEvents();
  }

  async launch() {
    try {
      await super.launch();
      log.info(`Logged in as client ${this.botInfo.username}`);
    } catch (e) {
      log.error(e);
    }
  }

  #setupEvents() {
    this.start((ctx) => {
      ctx.reply('안녕하세요!');
    });

    this.on('new_chat_members', async (ctx) => {
      if (String(ctx.update.message.new_chat_members[0].id) !== this.#id) return;
      try {
        await Setting.create({
          platform: 'telegram',
          guild_id: null,
          channel_id: String(ctx.chat.id),
        });
        ctx.reply('안녕하세요! 이 봇을 추가해 주셔서 감사합니다!');
      } catch (e) {
        log.error(e);
      }
    });

    this.on('left_chat_member', async (ctx) => {
      if (String(ctx.update.message.left_chat_member.id) !== this.#id) return;
      Setting.findOneAndDelete(
        { platform: 'telegram', channel_id: String(ctx.chat.id) },
        log.error.bind(log),
      );
    });
  }

  sendEarthquakeMessage(values) {
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

    Setting.find({ platform: 'telegram' }).then((chats) => {
      if (!chats) return;
      chats.forEach((chat) => this.telegram.sendMessage(
        chat.channel_id,
        `${formattedDateStr.year}년 ${formattedDateStr.month}월 ${
          formattedDateStr.day
        }일 ${formattedDateStr.time.hour}시 ${
          formattedDateStr.time.minute
        }분 발표된 지진정보입니다.\n\n진앙 깊이: ${
          values.dep || '정보없음'
        }km\n위치: ${values.loc || '정보없음'}\n규모: ${
          values.mt || '정보없음'
        }\n진도: ${values.inT || '정보없음'}\n참고사항: ${
          values.rem || '정보없음'
        }\n데이터는 기상청 공공 API에서 제공받았습니다.`,
      ));
    });
  }
}
