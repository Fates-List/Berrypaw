// Packages
const {
	Client,
	Collection,
	Formatters,
	MessageEmbed,
	MessageActionRow,
	MessageButton,
	Intents,
} = require("discord.js");
const fs = require("fs");
const modals = require("discord-modals");
const server = require("./server");
const { forums, logChannels } = require("./data/channels.json");
require("colors");
require("dotenv").config();

// Initalize Client
const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// Client Extension
require("./client_extension")(client);

// Add extras to Client for simplicity with interactions
client.Formatters = Formatters;
client.MessageEmbed = MessageEmbed;
client.MessageActionRow = MessageActionRow;
client.MessageButton = MessageButton;

// Initalize Discord Modals
modals(client);

// Ready Event
client.on("ready", async () => {
	console.log(
		`${"[Discord]".yellow} => ${`Logged in as ${client.user.tag}!`.red}`
	);

	// Set Client Activity/Status
	if (process.env.NODE_ENV === "production") {
		client.user.setStatus("online");

		client.user.setActivity(`Select List`, {
			type: "WATCHING",
		});
	} else {
		client.user.setStatus("idle");

		client.user.setActivity(`Test Build`, {
			type: "WATCHING",
		});
	}
});

// Debug Event
client.on("debug", (info) => {
	const type = `[${
		info.substring(info.indexOf("[") + 1, info.indexOf("]")) || "Unknown"
	}]`;

	const debugData = `${type.green} => ${
		info.replace(type, "").replace("[", "").replace("]", "").red
	}`;
	console.log(`${"[Discord Debug]".yellow} ${debugData.green}`);
});

// Error Event
client.on("error", (error) => {
	console.log(`${"[Discord]".yellow} ${"[Error]".green} => ${error.red}`);
});

// Collections
client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();

// Add Commands
const commandFiles = fs
	.readdirSync("./commands")
	.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// Add Modals
const modalFiles = fs
	.readdirSync("./modals")
	.filter((file) => file.endsWith(".js"));

for (const file of modalFiles) {
	const modal = require(`./modals/${file}`);
	client.modals.set(modal.data.name, modal);
}

// Add Buttons
const buttonFiles = fs
	.readdirSync("./buttons")
	.filter((file) => file.endsWith(".js"));

for (const file of buttonFiles) {
	const button = require(`./buttons/${file}`);
	client.buttons.set(button.data.name, button);
}

// Server Events
server.emitter.on("uptimeUpdate", (data) => {
	let json;

	if (data.typeName === "Up") {
		const embed = new MessageEmbed()
			.setTitle(`${data.name} is back online!`)
			.setColor("#00ff00")
			.addField("HTTP Status", data.httpStatus, false)
			.addField("Downtime Duration", data.timeAffected, false);

		json = embed;
	} else if (data.typeName === "Down") {
		const embed = new MessageEmbed()
			.setTitle(`${data.name} is down!`)
			.setColor("#ff0000")
			.addField("HTTP Status", data.httpStatus, false);

		json = embed;
	}

	client.channels.cache.get(logChannels.status).send({
		embeds: [json],
	});
});

// Message Command Event
client.on("messageCreate", async (message) => {
	// Block Messages
	if (message.author.bot) return;
	if (message.channel.type === "dm") return;

	// Block message if doesn't start with prefix
	if (!message.content.startsWith(client.prefix)) return;

	// Fetch command
	const command = message.content.slice(client.prefix.length).split(/ +/);
	const commandName = command.shift().toLowerCase();
	const commandObject = client.commands.get(commandName);

	if (commandObject) {
		const button = {
			type: 1,
			components: [
				{
					type: 2,
					label: "Run command",
					style: 1,
					custom_id: commandObject.data.name,
				},
			],
		};

		const embed = new MessageEmbed()
			.setTitle("Command")
			.setColor("RANDOM")
			.addField("Name:", commandObject.data.name, true)
			.addField("Description:", commandObject.data.description, true)
			.setFooter({
				text: "To run this command, click the button below.",
				iconURL: message.author.displayAvatarURL(),
			});

		message.reply({
			embeds: [embed],
			components: [button],
		});
	} else {
		message.reply({
			content: "Sorry, that command was not found!",
		});
	}
});

// Interaction Event(s)
client.on("interactionCreate", async (interaction) => {
	// Slash Command
	if (interaction.isCommand()) {
		const command = client.commands.get(interaction.commandName);

		if (command) {
			try {
				await command.execute(client, interaction, server);
			} catch (error) {
				console.error(error);

				let embed = new MessageEmbed()
					.setTitle("Oops, there was an error!")
					.setColor("RANDOM")
					.addField("Message", Formatters.codeBlock("javascript", error), false);

				await interaction.reply({
					embeds: [embed],
				});
			}
		} else {
			await interaction.reply("This command does not exist.");
		}
	}

	// Button
	if (interaction.isButton()) {
		const button = client.buttons.get(interaction.customId);
		const command = client.commands.get(interaction.customId);

		if (button) {
			try {
				await button.execute(client, interaction, server);
			} catch (error) {
				console.error(error);

				let embed = new MessageEmbed()
					.setTitle("Oops, there was an error!")
					.setColor("RANDOM")
					.addField("Message", Formatters.codeBlock("javascript", error), false);

				await interaction.reply({
					embeds: [embed],
				});
			}
		} else {
			// Check if button is equal to a slash command
			if (command) {
				try {
					await command.execute(client, interaction, server);
				} catch (error) {
					console.error(error);

					let embed = new MessageEmbed()
						.setTitle("Oops, there was an error!")
						.setColor("RANDOM")
						.addField("Message", Formatters.codeBlock("javascript", error), false);

					await interaction.reply({
						embeds: [embed],
					});
				}
			} else {
				// button does not equal to anything
				await interaction.reply("This button does not have any functionality.");
			}
		}
	}
});

client.on("modalSubmit", async (interaction) => {
	const modal = client.modals.get(interaction.customId);

	if (!modal) {
		let embed = new MessageEmbed()
			.setTitle("Error")
			.setColor("#FF0000")
			.setDescription("Command does not exist!");

		await interaction.reply({
			embeds: [embed],
		});
	}

	try {
		await modal.execute(client, interaction, server);
	} catch (error) {
		let embed = new MessageEmbed()
			.setTitle("Oops, there was an error!")
			.setColor("RANDOM")
			.addField("Message", Formatters.codeBlock("javascript", error), false);

		await interaction.reply({
			embeds: [embed],
		});
	}
});

client.on("threadCreate", async (thread) => {
	const user = client.users.cache.get(thread.ownerId);

	const json = {
		thread: {
			name: thread.name,
			id: thread.id,
		},
		creator: {
			name: user.username,
			discriminator: user.discriminator,
			id: thread.ownerId,
		},
		channel: {
			name: "Unknown",
			id: thread.parentId,
		},
	};

	if (forums[json.channel.id]) {
		const data = forums[json.channel.id];
		let msg;

		switch (data.name) {
			case "public-support":
				msg =
					"Thanks for creating this support ticket, someone from our team will help you shortly!";
				break;

			case "premium-support":
				msg =
					"Thanks for creating this premium support ticket, someone from our team will help you **VERY** shortly!";
				break;

			case "suggestions":
				msg =
					"Thanks for creating this suggestion, our team will review it shortly!";
				break;
		}

		// Send message to Thread
		thread.send({
			content: msg,
		});

		// Send message to Log Channel
		const logChannel = client.channels.cache.get(logChannels.support);
		const embed = new MessageEmbed()
			.setTitle(`New ${String(data.type)} Thread`)
			.setColor("RANDOM")
			.addField("Thread Name:", String(json.thread.name), true)
			.addField("Thread ID:", String(json.thread.id), true)
			.addField("Channel Name:", String(json.channel.name), true)
			.addField("Channel ID:", String(json.channel.id), true)
			.addField(
				"Creator Username:",
				String(`${json.creator.name}#${json.creator.discriminator}`),
				true
			)
			.addField("Creator ID:", String(json.creator.id), true);

		logChannel.send({
			embeds: [embed],
		});
	} else {
		console.log(
			`${"[Discord]".yellow} ${"[Warning]".green} => ${
				"Thread created in a non-forum channel, or is not yet added to object".red
			}`
		);
	}
});

// Login to Discord
server.emitter.on("serverStarted", () => {
	if (process.env.NODE_ENV === "production") {
		client.login(process.env.TOKEN);
	} else {
		client.login(process.env.DEV_TOKEN);
	}
});
