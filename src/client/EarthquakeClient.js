import EventEmitter from 'events';
import mongoose from 'mongoose';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import TelegramClient from './telegram/client/TelegramClient.js';
import DiscordClient from './discord/client/DiscordClient.js';
import Logger from '../component/Logger.js';

const REQUEST_URL = 'http://apis.data.go.kr/1360000/EqkInfoService/getEqkMsg';

const log = new Logger('client');
const db = mongoose.connection;

db.once('open', () => log.info('Connected to mongood server'));
db.on('error', log.error.bind(log));

export default class EarthquakeClient extends EventEmitter {
  #key;

  #databaseURL;

  #discord;

  #telegram;

  constructor(option) {
    const { discord, telegram, key, databaseURL } = option;

    super();

    this.#key = key;
    this.#databaseURL = databaseURL;
    this.#discord = new DiscordClient(discord, this);
    this.#telegram = new TelegramClient(telegram, this);
  }

  #eqInfo() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return axios.get(REQUEST_URL, {
      params: {
        serviceKey: this.#key,
        pageNo: 1,
        numOfRows: 1,
        dataType: 'XML',
        fromTmFc: `${year}${month}${day}`,
        toTmFc: `${year}${month}${day}`,
      },
    });
  }

  setup() {
    mongoose.connect(this.#databaseURL);
    this.#setupEarthquakeEvents();
    this.#discord.setup();
    this.#telegram.setup();
  }

  launch() {
    this.#discord.login();
    this.#telegram.launch();
  }

  #setupEarthquakeEvents() {
    let eq = null;

    setInterval(async () => {
      let response;

      try {
        response = await this.#eqInfo();
        const data = new XMLParser().parse(response.data);

        if (data.OpenAPI_ServiceResponse) {
          throw new Error(
            JSON.stringify(data.OpenAPI_ServiceResponse, null, 4)
          );
        }

        if (data.response.header.resultCode !== 0) {
          if (data.response.header.resultCode === 3) return;

          throw new Error(data.response.header.resultMsg);
        }

        const currentEq = data.response.body.items.item;
        if (!eq) {
          eq = currentEq.tmSeq;

          log.info(
            `Initialized earthquake info, current earthquake info is: ${eq}`
          );

          return;
        }
        if (eq !== currentEq.tmSeq) {
          eq = currentEq.tmSeq;

          this.emit('earthquake', currentEq);
        }
      } catch (e) {
        log.error(e);
      }
    }, 9000);
  }
}
