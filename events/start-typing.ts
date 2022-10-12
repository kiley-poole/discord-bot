module.exports = {
  name: 'typingStart',
  execute (channel: any, user: any) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`${user.username} is typing in ${channel.name}`)
  }
}
