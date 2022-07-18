module.exports = {
	data: {
		name: "botAction-category",
	},
	async execute(client, interaction, fetch) {
		const values = interaction.values;

		values.forEach(async (value) => {
			if (value === "Public") {
				let components;

				components = [
					{
						type: 1,
						components: [
							{
								type: 2,
								label: "Create Test Server",
								style: 1,
								custom_id: "test_bot_public",
							},
							{
								type: 2,
								label: "View Bot Page",
								style: 5,
								url: interaction.message.embeds[0].url,
							},
						],
					},
				];

				await interaction.update({
					components: components,
				});
			}

			if (value === "Staff") {
				let components;

				components = [
					{
						type: 1,
						components: [
							{
								type: 2,
								label: "Claim",
								style: 1,
								custom_id: "claim_bot",
							},
							{
								type: 2,
								label: "Ban",
								style: 1,
								custom_id: "ban_bot",
							},
						],
					},
				];

				await interaction.update({
					components: components,
				});
			}
		});
	},
};
