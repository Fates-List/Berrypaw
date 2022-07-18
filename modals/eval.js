const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: {
		name: "eval",
	},
	async execute(client, interaction, server, fetch) {
		const code = interaction.getTextInputValue("code");
		let inline = interaction.getTextInputValue("inline") || "n";
		let hidden = interaction.getTextInputValue("hidden") || "n";
		let embed;

		if (inline.toLowerCase() === "y") {
			inline = true;
		} else {
			inline = false;
		}

		const limit = (value) => {
			let max_chars = 700;
			let i;

			if (value.length > max_chars) {
				i = value.substr(0, max_chars);
			} else {
				i = value;
			}

			return i;
		};

		const clean = async (text) => {
			if (text && text.constructor.name == "Promise") text = await text;

			if (typeof text !== "string")
				text = require("util").inspect(text, {
					depth: 1,
				});

			text = text
				.replace(/`/g, "`" + String.fromCharCode(8203))
				.replace(/@/g, "@" + String.fromCharCode(8203));

			return text;
		};

		try {
			let evaled = eval(code);
			let results = await clean(evaled);
			let type = typeof evaled;
			let typeOf = type.charAt(0).toUpperCase() + type.slice(1);

			const tree = (obj) => {
				const data = [];

				if (obj === undefined || obj === null) {
					data.push(`${obj}`);
				}

				while (obj) {
					data.push(obj.constructor.name);
					obj = Object.getPrototypeOf(obj);
				}

				return data.reverse().join(" -> ");
			};

			embed = new client.MessageEmbed()
				.setTitle("Evaluation Results")
				.setColor("RANDOM")
				.addField(
					"Input:",
					client.Formatters.codeBlock("javascript", limit(code)),
					inline
				)
				.addField(
					"Output:",
					client.Formatters.codeBlock("javascript", limit(results)),
					inline
				)
				.addField(
					"Type:",
					client.Formatters.codeBlock("javascript", typeOf),
					inline
				)
				.addField(
					"Prototype:",
					client.Formatters.codeBlock("javascript", tree(evaled)),
					inline
				)
				.setFooter({
					iconURL: interaction.user.displayAvatarURL(),
					text: `Executed by ${interaction.user.username}, in about ${Math.floor(
						Date.now() - interaction.createdAt
					)} milliseconds`,
				});
		} catch (err) {
			embed = new client.MessageEmbed()
				.setTitle("Evaluation Results")
				.setColor("#FF0000")
				.addField("Input:", client.Formatters.codeBlock("javascript", code), inline)
				.addField(
					"Output:",
					client.Formatters.codeBlock("javascript", limit(err)),
					inline
				)
				.addField(
					"Type:",
					client.Formatters.codeBlock("javascript", "Error"),
					inline
				)
				.setFooter({
					iconURL: interaction.user.displayAvatarURL(),
					text: `Executed by ${interaction.user.username}, in about ${Math.floor(
						Date.now() - interaction.createdAt
					)} milliseconds`,
				});
		}

		if (hidden.toLowerCase() === "y") {
			await interaction.deferReply({
				ephemeral: true,
			});
			await interaction.followUp({
				embeds: [embed],
				ephemeral: true,
			});
		} else {
			await interaction.reply({
				embeds: [embed],
			});
		}
	},
};
