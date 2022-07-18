const {
	SlashCommandBuilder,
	TextInputBuilder,
	ActionRowBuilder,
} = require("@discordjs/builders");
const { ModalBuilder, TextInputStyle } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("eval")
		.setDescription("Test some code!"),
	async execute(client, interaction, server, fetch) {
		const isStaff = await client.isStaff(interaction.user.id, 6.5);
		if (!isStaff.allowed)
			return interaction.reply({
				content: "You do not have enough permissions to use this command!",
			});

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
