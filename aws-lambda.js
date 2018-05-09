'use strict';

const querystring = require('querystring');
const twilio = require('twilio');

const response = {statusCode: 200, headers: {'Content-Type': 'application/json'}};

exports.handler = function (event, context, callback) {
  const parsed = querystring.parse(event.body);

  if (parsed.token !== process.env.SLACK_VALIDATION_TOKEN) {
    response.body = JSON.stringify({text: 'Message not sent: Invalid Slack token.'});
    return callback(null, response);
  }

  // TODO: Find out if this should be a case-insensitive comparison.
  if (process.env.SLACK_CHANNEL_ID && parsed.channel_id !== process.env.SLACK_CHANNEL_ID) {
    response.body = JSON.stringify({text: 'Sorry! This command is not permitted in this channel!'});
    return callback(null, response);
  }

  const data = parsed.text || '';

  const toPhone = data.substr(0, data.indexOf(' '));
  if (!/^\+1[0-9]{10}$/.test(toPhone)) {
    response.body = JSON.stringify({text: `Message not sent: Phone number must be in +1XXXXXXXXXX format: "${toPhone}"`});
    return callback(null, response);
  }

  const body = data.substr(data.indexOf(' ') + 1);
  if (!/[\S]/.test) {
    response.body = JSON.stringify({text: 'Message not sent: Message body cannot be empty.'});
    return callback(null, response);
  }

  const responseUrl = parsed.response_url;
  if (!responseUrl) {
    response.body = JSON.stringify({text: 'Message not sent: Did not get a response_url'});
    return callback(null, response);
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  const client = twilio(accountSid, authToken);

  client.messages.create({
    to: toPhone,
    from: process.env.OUR_TWILIO_PHONE_NUMBER,
    body: body
  }).then(() => {
    response.body = JSON.stringify({response_type: 'in_channel', text: `Message sent to ${toPhone}: ${body}`});
    callback(null, response);
  }).catch();
};
