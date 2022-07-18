const {
	SlashCommandBuilder,
	TextInputBuilder,
	ActionRowBuilder,
} = require("@discordjs/builders");
const { ModalBuilder, TextInputStyle } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("bot-info")
		.setDescription("Get some information about a bot on Select List and more."),
	async execute(client, interaction, server) {
		const modal = new ModalBuilder()
			.setCustomId("bot-information")
			.setTitle("Bot Information");

		const botID = new TextInputBuilder()
			.setCustomId("bot-id")
			.setLabel("Bot ID")
			.setStyle(TextInputStyle.Paragraph);

		const firstRow = new ActionRowBuilder().addComponents([botID]);

		modal.addComponents([firstRow]);

		await interaction.showModal(modal);
	},
};
