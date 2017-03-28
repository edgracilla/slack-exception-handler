'use strict'

const reekoh = require('reekoh')
const _ = require('lodash')
const plugin = new reekoh.plugins.ExceptionLogger()

let slackConfig = {}
let slackClient

plugin.on('exception', (error) => {
  let notification = _.clone(slackConfig)

  _.extend(notification, {
    text: error.stack
  })

  slackClient.send(notification, (error) => {
    if (!error) return

    console.error('Error on Slack.', error)
    plugin.logException(error)
  })

  plugin.log(JSON.stringify({
    title: 'Exception sent to Slack',
    data: {message: error.message, stack: error.stack, name: error.name}
  }))
})

plugin.once('ready', () => {
  let Slack = require('node-slack')

  _.extend(slackConfig, {
    channel: _.startsWith(plugin.config.channel, '#') ? plugin.config.channel : '#' + plugin.config.channel,
    username: plugin.config.username
  })

  slackClient = new Slack(plugin.config.webhook)

  plugin.log('Slack Exception Logger has been initialized.')
  plugin.emit('init')
})

module.exports = plugin
