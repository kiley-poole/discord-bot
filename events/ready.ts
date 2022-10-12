module.exports = {
  name: 'ready',
  once: true,
  execute (client: any) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`Ready! Logged in as ${client.user.tag}`)
  }
}
