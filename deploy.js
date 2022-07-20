// Packages
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
require("dotenv").config();

// Client ID and Token
let clientID;
let token;

if (process.env.NODE_ENV === "production") {
	clientID = process.env.CLIENT_ID;
	token = process.env.TOKEN;
} else {
	clientID = process.env.DEV_CLIENT_ID;
	token = process.env.DEV_TOKEN;
}

// Initalize REST
const rest = new REST({
	version: "9",
}).setToken(token);

// Slash Commands
const commands = [];
const commandFiles = fs
	.readdirSync("./commands")
	.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.interaction);
}

rest
	.put(Routes.applicationCommands(clientID), { body: commands })
	.then(console.log)
	.catch(console.error);
