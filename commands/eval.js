const {
	SlashCommandBuilder,
	TextInputBuilder,
	ActionRowBuilder,
} = require("@discordjs/builders");
const { ModalBuilder, TextInputStyle } = require("discord.js");

module.exports = {
	data: {
		interaction: new SlashCommandBuilder()
			.setName("eval")
			.setDescription("Test some code!"),
		command: {
			name: "eval",
			description: "Test some code!",
			permission: 6.5,
		},
	},
	async execute(client, interaction, server, fetch) {
		const modal = new ModalBuilder()
			.setCustomId("eval")
			.setTitle("Evaluate your Code");

		const code = new TextInputBuilder()
			.setCustomId("code")
			.setLabel("Code")
			.setPlaceholder("Write your Code here!")
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(true);

		const inline = new TextInputBuilder()
			.setCustomId("inline")
			.setLabel("Do you want the embed to be inlined?")
			.setPlaceholder("Y/N [Default: N]")
			.setStyle(TextInputStyle.Short)
			.setRequired(false);

		const hidden = new TextInputBuilder()
			.setCustomId("hidden")
			.setLabel("Do you want the embed to be hidden?")
			.setPlaceholder("Y/N [Default: N]")
			.setStyle(TextInputStyle.Short)
			.setRequired(false);

		const firstRow = new ActionRowBuilder().addComponents([code]);
		const secondRow = new ActionRowBuilder().addComponents([inline]);
		const thirdRow = new ActionRowBuilder().addComponents([hidden]);

		modal.addComponents([firstRow, secondRow, thirdRow]);

		await interaction.showModal(modal);
	},
};
