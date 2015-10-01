'use strict';

var platform    = require('./platform'),
	slack       = require('node-slack'),
	slackClient, channel, username;

/*
 * Listen for the ready event.
 */
platform.once('ready', function (options) {

	channel  = options.channel;
	username = options.username;

	if (!options.proxy)
		slackClient = new slack(options.webhook);
	else
		slackClient = new slack(options.webhook, {proxy: options.proxy});

	platform.log('Connected to Slack.');
	platform.notifyReady(); // Need to notify parent process that initialization of this plugin is done.
});

/*
 * Listen for the data event.
 */
platform.on('data', function (data) {

	var slackObj = {};

	//test if data is object and there is a text message
	if (typeof data === 'object' && data.text) {
		slackObj = data;
		if (!slackObj.channel)
			slackObj.channel = channel;

		if (!slackObj.username)
			slackObj.username = username;
	} else {
		slackObj.text = data;
		slackObj.channel = channel;
		slackObj.username = username;
	}

	//slack will validate the data and return any relevant error or missing fields
	slackClient.send(slackObj, function(error) {
		console.error('Error on Slack.', error);
		platform.handleException(error);
	})

});