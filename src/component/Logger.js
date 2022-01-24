export default class Logger {
  #client;

  constructor(client = 'NONE') {
    this.#client = client;
  }

  #format(type, ctx) {
    return `[${type}][${this.#client}][${Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'medium',
      hourCycle: 'h24',
    }).format(new Date())}] ${ctx}`;
  }

  error(err) {
    console.error(this.#format('error', err.message));
  }

  info(context) {
    console.log(this.#format('info', context));
  }
}
