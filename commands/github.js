const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('github')
		.setDescription('View the GitHub repository'),
	async execute(client, interaction) {
        await interaction.reply({
            content: "This project is open sourced and could use some help!\nYou can help us or take a look at the code here: https://github.com/selectthegang/status_bot"
        });
	},
};