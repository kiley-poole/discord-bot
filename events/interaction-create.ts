module.exports = {
  name: 'interactionCreate',
  async execute (interaction: any, client: any) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`)
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!interaction.isChatInputCommand()) return

    const command: any = interaction.client.commands.get(interaction.commandName)

    try {
      await command.execute(interaction)
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
  }
}
