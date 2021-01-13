'use strict';

const querystring = require('querystring');

const response = { statusCode: 200, headers: { 'Content-Type': 'application/json' } };

exports.handler = function (event, context, callback) {
  const parsed = querystring.parse(event.body);

  if (!parsed.token || parsed.token !== process.env.SLACK_VALIDATION_TOKEN) {
    response.body = JSON.stringify({ text: 'Message not sent: Invalid Slack token.' });
    return callback(null, response);
  }

  // TODO: Find out if this should be a case-insensitive comparison.
  if (process.env.SLACK_CHANNEL_ID && parsed.channel_id !== process.env.SLACK_CHANNEL_ID) {
    response.body = JSON.stringify({ text: 'Sorry! This command is not permitted in this channel!' });
    return callback(null, response);
  }

  const data = parsed.text || '';

  if (!/^\+1[0-9]{10}\b/.test(data)) {
    response.body = JSON.stringify({ text: `Message not sent: Phone number must be in +1XXXXXXXXXX format: "${data}"` });
    return callback(null, response);
  }

  const spaceIndex = data.indexOf(' ');
  if (spaceIndex !== 12) {
    response.body = JSON.stringify({ text: 'Message not sent: Phone number must be followed by a space.' });
    return callback(null, response);
  }

  const body = data.substr(spaceIndex + 1);
  if (!/[\S]/.test(body)) {
    response.body = JSON.stringify({ text: 'Message not sent: Message body cannot be empty.' });
    return callback(null, response);
  }

  const toPhone = data.substr(0, spaceIndex);

  const responseUrl = parsed.response_url;
  if (!responseUrl) {
    response.body = JSON.stringify({ text: 'Message not sent: Did not get a response_url' });
    return callback(null, response);
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  const client = require('twilio')(accountSid, authToken, { lazyLoading: true, edge: 'umatilla' });

  client.messages.create({
    to: toPhone,
    from: process.env.OUR_TWILIO_PHONE_NUMBER,
    body: body
  }).then(() => {
    response.body = JSON.stringify({ response_type: 'in_channel', text: `Message sent to ${toPhone}: ${body}` });
    callback(null, response);
  }).catch();
};
