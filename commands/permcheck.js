const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("permcheck")
		.setDescription("Check your permission level"),
	async execute(client, interaction, server, fetch) {
		const staff = await client.isStaff(interaction.user.id, 0.0);

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

		const perms = await clean({
			Fates: staff.fates,
			Metro: staff.metro,
			Selectlist: staff.selectlist,
		});

		await interaction.reply({
			content: `${client.Formatters.codeBlock("javascript", perms)}`,
		});
	},
};
