# About

Nekomimi is a bot program that sends messages when earthquake API is updated.

This program requires a MongoDB server before installation.

## Installation

<aside>
💡 If you are install in docker, go to the next paragraph.

</aside>

- Node.js environment is required before installation.
- And also, some environment variables required.

```bash
$npm install --production
$npm start
```

## Installation using Docker

```bash
$docker build -t nekomimi .
$docker run -d --env-file some-variable-file.env --name some-container-name nekomimi
```
