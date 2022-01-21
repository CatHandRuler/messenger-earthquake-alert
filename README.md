# About

Nekomimi is a bot program that sends messages when earthquake API is updated.

This program requires a MongoDB server running on localhost.

## Installation

<aside>
💡 If you are going to run on docker, go to the next paragraph.

</aside>

- Node.js environment is required before installation.
- And also, you need some environment variables for the bot.

```bash
$npm install --production
$npm start
```

## Installation using Docker

- First, you have to adjust Dockerfile

```bash
$docker build -t nekomimi
$docker run -d --env-file earthquake-bot-variables.env --network="host" --name nekomimi -it nekomimi
```
