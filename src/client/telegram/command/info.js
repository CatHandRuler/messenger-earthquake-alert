import os from 'os';

const name = 'info';
const description = 'Send client server info';

function run(ctx) {
  const uptime = os.uptime();
  const formattedUptime = `${parseInt(uptime / 86400, 10)}d ${parseInt(
    (uptime % 86400) / 3600,
    10
  )}h ${parseInt((uptime % 3600) / 60, 10)}m`;
  ctx.reply(
    `${os.cpus().length} Cores of CPU\nServer Uptime: ${formattedUptime}`
  );
}

export { name, description, run };
