module.exports = {
	data: {
		name: "bot-information",
	},
	async execute(client, interaction, server, fetch) {
		const botID = interaction.getTextInputValue("bot-id");
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

			if (data.tags.map((tag) => tag.name).includes("Music")) {
				data.tags.splice(data.tags.map((tag) => tag.name).indexOf("Music"), 1);
			} // Remove when FL bug is fixed

			const embed = new client.MessageEmbed()
				.setTitle(data.username)
				.setColor("RANDOM")
				.setURL(`https://select.fateslist.xyz/bot/${data.bot_id}`)
				.setThumbnail(data.avatar)
				.addField("Short Description:", data.description, false)
				.addField("Tags:", data.tags.map((tag) => tag.name).join(", "), false);

			await interaction.reply({
				embeds: [embed],
				components: components,
			});
		}
	},
};
