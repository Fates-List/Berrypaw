const { SlashCommandBuilder } = require("@discordjs/builders");
const { Modal, TextInputComponent, showModal } = require("discord-modals");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("bot-info")
		.setDescription("Get some information about a bot on Select List and more."),
	async execute(client, interaction, server) {
		const modal = new Modal()
			.setCustomId("bot-information")
			.setTitle("Bot Information")
			.addComponents([
				new TextInputComponent()
					.setCustomId("bot-id")
					.setLabel("Bot ID")
					.setStyle("SHORT")
					.setMinLength(1)
					.setPlaceholder("Please enter the bot's ID.")
					.setRequired(true),
			]);

		showModal(modal, {
			client: client,
			interaction: interaction,
		});
	},
};
