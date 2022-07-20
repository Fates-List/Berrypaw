// Packages
const {
	Client,
	Collection,
	Formatters,
	EmbedBuilder,
	GatewayIntentBits,
	Partials,
	InteractionType,
} = require("discord.js");
const fs = require("fs");
const server = require("./server");
const { forums, logChannels } = require("./data/channels.json");
const fetch = require("node-fetch");
require("colors");
require("dotenv").config();

// Initalize Client
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.Message],
});

// Client Extension
require("./client_extension")(client);

// Add extras to Client for simplicity with interactions
client.Formatters = Formatters;
client.EmbedBuilder = EmbedBuilder;

// Ready Event
client.on("ready", async () => {
	console.log(
		`${"[Discord]".yellow} ${"[Authentication]".green} => ${
			`Logged in as ${client.user.tag}!`.red
		}`
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
client.commands = new Map();
client.buttons = new Map();
client.modals = new Map();
client.menus = new Map();

// Add Commands
const commandFiles = fs
	.readdirSync("./commands")
	.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.interaction.name, command);
}

// Add Modals
const modalFiles = fs
	.readdirSync("./modals")
	.filter((file) => file.endsWith(".js"));

for (const file of modalFiles) {
	const modal = require(`./modals/${file}`);
	client.modals.set(modal.data.name, modal);
}

// Add Select Menus
const menuFiles = fs
	.readdirSync("./select_menus")
	.filter((file) => file.endsWith(".js"));

for (const file of menuFiles) {
	const menu = require(`./select_menus/${file}`);
	client.menus.set(menu.data.name, menu);
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
		const embed = new client.EmbedBuilder()
			.setTitle(`${data.name} is back online!`)
			.setColor(client.colors.Info)
			.addFields([
				{
					name: "HTTP Status",
					value: data.httpStatus,
					inline: false,
				},
				{
					name: "Downtime Duration",
					value: data.timeAffected,
					inline: false,
				},
			]);

		json = embed;
	} else if (data.typeName === "Down") {
		const embed = new client.EmbedBuilder()
			.setTitle(`${data.name} is down!`)
			.setColor(client.colors.Info)
			.addFields([
				{
					name: "HTTP Status",
					value: data.httpStatus,
					inline: false,
				},
			]);

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
		const permCheck = await client.isStaff(
			message.author.id,
			commandObject.data.command.permission
		);

		if (permCheck.allowed) {
			const button = {
				type: 1,
				components: [
					{
						type: 2,
						label: "Execute",
						style: 1,
						custom_id: commandObject.data.interaction.name,
					},
				],
			};

			const embed = new client.EmbedBuilder()
				.setTitle("Command")
				.setColor(client.colors.Prompt)
				.addFields([
					{ name: "Name:", value: commandObject.data.command.name, inline: true },
					{
						name: "Description:",
						value: commandObject.data.command.description,
						inline: true,
					},
					{
						name: "Permission:",
						value: commandObject.data.command.permission.toString(),
						inline: true,
					},
				])
				.setFooter({
					text: "To run this command, click the button below.",
					iconURL: message.author.displayAvatarURL(),
				});

			message.reply({
				embeds: [embed],
				components: [button],
			});
		} else {
			const embed = new client.EmbedBuilder()
				.setTitle("Command Error")
				.setColor(client.colors.Error)
				.setDescription("You do not have permission to use this command.");

			message.reply({
				embeds: [embed],
			});
		}
	} else {
		message.reply({
			content: "Sorry, that command was not found!",
		});
	}
});

// Interaction Event(s)
client.on("interactionCreate", async (interaction) => {
	// Slash Command
	if (interaction.type === InteractionType.ApplicationCommand) {
		const command = client.commands.get(interaction.commandName);

		if (command) {
			const permCheck = await client.isStaff(
				interaction.user.id,
				command.data.command.permission
			);

			if (permCheck.allowed) {
				try {
					await command.execute(client, interaction, server, fetch);
				} catch (error) {
					console.error(error);

					let embed = new client.EmbedBuilder()
						.setTitle("Oops, there was an error!")
						.setColor(client.colors.Error)
						.addFields([
							{
								name: "Message",
								value: Formatters.codeBlock("javascript", error),
								inline: false,
							},
						]);

					await interaction.reply({
						embeds: [embed],
					});
				}
			} else {
				// User doesn't have permission
				let embed = new client.EmbedBuilder()
					.setTitle("Command Error")
					.setColor(client.colors.Error)
					.setDescription("You do not have permission to use this command.");

				await interaction.reply({
					embeds: [embed],
				});
			}
		} else {
			// Command does not exist
			await interaction.reply("This command does not exist.");
		}
	}

	// Button
	if (interaction.isButton()) {
		const button = client.buttons.get(interaction.customId);
		const command = client.commands.get(interaction.customId);

		if (button) {
			try {
				await button.execute(client, interaction, server, fetch);
			} catch (error) {
				console.error(error);

				let embed = new client.EmbedBuilder()
					.setTitle("Oops, there was an error!")
					.setColor(client.colors.Error)
					.addFields([
						{
							name: "Message",
							value: Formatters.codeBlock("javascript", error),
							inline: false,
						},
					]);

				await interaction.reply({
					embeds: [embed],
				});
			}
		} else {
			// Check if button is equal to a slash command
			if (command) {
				try {
					await command.execute(client, interaction, server, fetch);
				} catch (error) {
					console.error(error);

					let embed = new client.EmbedBuilder()
						.setTitle("Oops, there was an error!")
						.setColor(client.colors.Error)
						.addFields([
							{
								name: "Message",
								value: Formatters.codeBlock("javascript", error),
								inline: false,
							},
						]);

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

	// Select Menu
	if (interaction.isSelectMenu()) {
		const menu = client.menus.get(interaction.customId);

		if (menu) {
			try {
				await menu.execute(client, interaction, fetch);
			} catch (error) {
				console.error(error);

				let embed = new client.EmbedBuilder()
					.setTitle("Oops, there was an error!")
					.setColor(client.colors.Error)
					.addFields([
						{
							name: "Message",
							value: Formatters.codeBlock("javascript", error),
							inline: false,
						},
					]);

				await interaction.reply({
					embeds: [embed],
				});
			}
		} else {
			await interaction.reply("Sorry, that menu does not exist.");
		}
	}

	// Modals
	if (interaction.type === InteractionType.ModalSubmit) {
		const modal = client.modals.get(interaction.customId);

		if (!modal) {
			let embed = new client.EmbedBuilder()
				.setTitle("Error")
				.setColor(client.colors.Error)
				.setDescription("Command does not exist!");

			await interaction.reply({
				embeds: [embed],
			});
		} else {
			try {
				await modal.execute(client, interaction, server, fetch);
			} catch (error) {
				let embed = new client.EmbedBuilder()
					.setTitle("Oops, there was an error!")
					.setColor(client.colors.Error)
					.addFields([
						{
							name: "Message",
							value: Formatters.codeBlock("javascript", error),
							inline: false,
						},
					]);

				await interaction.reply({
					embeds: [embed],
				});
			}
		}
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
		const embed = new client.EmbedBuilder()
			.setTitle(`New ${String(data.type)} Thread`)
			.setColor(client.colors.Info)
			.addFields([
				{ name: "Thread Name:", value: String(json.thread.name), inline: true },
				{ name: "Thread ID:", value: String(json.thread.id), inline: true },
				{ name: "Channel Name:", value: String(json.channel.name), inline: true },
				{ name: "Channel ID:", value: String(json.channel.id), inline: true },
				{
					name: "Creator Username:",
					value: String(`${json.creator.name}#${json.creator.discriminator}`),
					inline: true,
				},
			]);

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
