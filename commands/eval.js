const { SlashCommandBuilder } = require("@discordjs/builders");
const { Modal, TextInputComponent, showModal } = require("discord-modals");

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

		const modal = new Modal()
			.setCustomId("eval")
			.setTitle("Evaluate your Code")
			.addComponents([
				new TextInputComponent()
					.setCustomId("code")
					.setLabel("Code")
					.setStyle("LONG")
					.setMinLength(1)
					.setPlaceholder("Write your Code here!")
					.setRequired(true),
				new TextInputComponent()
					.setCustomId("inline")
					.setLabel("Do you want the embed to be inlined?")
					.setStyle("SHORT")
					.setMaxLength(1)
					.setPlaceholder("Y/N [Default: N]")
					.setRequired(false),
				new TextInputComponent()
					.setCustomId("hidden")
					.setLabel("Hidden?")
					.setStyle("SHORT")
					.setMaxLength(1)
					.setPlaceholder("Y/N [Default: N]")
					.setRequired(false),
			]);

		showModal(modal, {
			client: client,
			interaction: interaction,
		});
	},
};
