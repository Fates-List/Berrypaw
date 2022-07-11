module.exports = {
	data: {
		name: "add-incident",
	},
	async execute(client, interaction, server, fetch) {
		const title = interaction.getTextInputValue("title");
		const description = interaction.getTextInputValue("description");

		const staff = await client.isStaff(interaction.user.id, 6.5);

		if (staff) {
			await interaction.reply({
				content: "This command is currently unavailable.",
				ephemeral: true,
			});
		} else {
			await interaction.reply({
				content: "You do not have permission to use this command.",
			});
		}
	},
};
