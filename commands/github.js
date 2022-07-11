const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("github")
		.setDescription("View the GitHub repository"),
	async execute(client, interaction, server, fetch) {
		await interaction.reply({
			content:
				"This project is open sourced and could use some help! You can help us or take a look at the code here: https://github.com/Fates-List/Berrypaw",
		});
	},
};
