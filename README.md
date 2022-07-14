# Berrypaw

Berrypaw is a Discord Bot that allows people to view and make changes to their bots on Select List/Fates List as well as monitor the Fates List API status

# About this Project

### How does this all work?

This project recieves data from Uptimerobot to be aware of any issues regarding our services such as a invalid SSL certificate or when the website is down depending on the HTTP status code.

## Permissions

### Discord Server Permissions

The bot will need this list of permissions on the Discord Server it will be running in!

- `READ_MESSAGES`
- `SEND_MESSAGES`

### Invite Scopes

You will have to give the bot some scopes so it can create slash commands as well, here is a list of scopes you will need to give to invite

- `bot`
- `application.commands`

Once invited, that server should have slash commands as long as you have ran the `npm run deploy` command at least once

### Privilaged Gateway Intents

Due to some changes to the Discord API, you now have to give your bot some intents so it can complete some needed actions for this projects. Here is a list of Intents you need to enable (remember, this does not have anything to do with `discord.js`, so you do not have to worry about the Client. This will have to be done on the Discord Developer Portal instead)

- `Message Content Intent`

## Environment Variables

- `CLIENT_ID` - The Client ID of the Discord Application
- `TOKEN` - The Discord BOT Token
- `NODE_ENV` - The Environment you are running the bot in (`development` or `production`)
- `DEV_TOKEN` - The Discord BOT Token (for the development environment, not required)
- `DEV_CLIENT_ID` - The Client ID of the Discord Application (for the development environment, not required)
- `SERVER_PORT` - The port that you want the server to run on
- `DEV_SERVER_PORT` - The port that you want the server to run on (for the development environment, not required)
- `PREFIX` - The prefix that you want the bot to use for commands
- `DEV_PREFIX` - The prefix that you want the bot to use for commands (for the development environment, not required)

# Questions

Reach out to us on our [Discord Server](https://discord.gg/cMAnfu8AJB) and we will be glad to answer questions you may have regarding Fates List!
