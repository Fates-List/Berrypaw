module.exports = {
	data: {
		name: "bot-information",
	},
	async execute(client, interaction, server, fetch) {
		const botID = interaction.fields.getTextInputValue("bot-id");
		const staff = await client.isStaff(interaction.user.id, 2);

		const data = await fetch(
			`https://select-api.fateslist.xyz/api/bots/get?id=${botID}`
		).then((res) => {
			if (res.ok) {
				return res.json();
			} else {
				return null;
			}
		});

		if (!data) {
			await interaction.reply({
				content: "That bot does not exist.",
				ephemeral: true,
			});
		} else {
			let components = [
				{
					type: 1,
					components: [
						{
							type: 3,
							custom_id: "botAction-category",
							options: [
								{
									label: "Public",
									value: "Public",
									description: "Actions that everyone can use.",
									emoji: {
										name: "fateslist",
										id: "843387908739563520",
									},
								},
							],
							placeholder: "Choose a action category",
						},
					],
				},
			];

			if (staff.allowed) {
				components[0].components[0].options.push({
					label: "Staff",
					value: "Staff",
					description: "Actions that only staff can use.",
					emoji: {
						name: "blurple_shield",
						id: "919253272282415124",
					},
				});
			}

			const tags = data.tags.map((tag) => tag.name).join(", ");

			const fields = [
				{ name: "Short Description", value: data.description, inline: false },
				{ name: "Tags", value: tags, inline: false },
				{ name: "Bot ID", value: data.bot_id, inline: false },
			];

			const embed = new client.EmbedBuilder()
				.setTitle(data.username)
				.setColor(client.colors.Success)
				.setURL(`https://select.fateslist.xyz/bot/${data.bot_id}`)
				.setThumbnail(data.avatar)
				.addFields(fields);

			await interaction.reply({
				embeds: [embed],
				components: components,
			});
		}
	},
};
