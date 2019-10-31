/* global expect:false, test:false */

const { handler } = require('./aws-lambda');

const querystring = require('querystring');

test('requires a Slack token', done => {
  delete process.env.SLACK_VALIDATION_TOKEN;
  delete process.env.SLACK_CHANNEL_ID;

  handler({ body: '' }, {}, (err, response) => {
    expect(err).toBe(null);
    expect(JSON.parse(response.body)).toEqual({ text: 'Message not sent: Invalid Slack token.' });
    done();
  });
});

test('Slack token must match', done => {
  process.env.SLACK_VALIDATION_TOKEN = 'fhqwhgads';
  delete process.env.SLACK_CHANNEL_ID;

  handler({ body: 'token=sterrance' }, {}, (err, response) => {
    expect(err).toBe(null);
    expect(JSON.parse(response.body)).toEqual({ text: 'Message not sent: Invalid Slack token.' });
    done();
  });
});

test('channel_id must match if one is set', done => {
  process.env.SLACK_VALIDATION_TOKEN = 'fhqwhgads';
  process.env.SLACK_CHANNEL_ID = 'cannonmouth';

  handler({ body: 'token=fhqwhgads&channel_id=sterrance' }, {}, (err, response) => {
    expect(err).toBe(null);
    expect(JSON.parse(response.body)).toEqual({ text: 'Sorry! This command is not permitted in this channel!' });
    done();
  });

  handler({ body: 'token=fhqwhgads&channel_id=cannonmouth' }, {}, (err, response) => {
    expect(err).toBe(null);
    expect(JSON.parse(response.body)).not.toEqual({ text: 'Sorry! This command is not permitted in this channel!' });
  });
});

test('requires a phone number', done => {
  process.env.SLACK_VALIDATION_TOKEN = 'fhqwhgads';
  delete process.env.SLACK_CHANNEL_ID;

  handler({ body: 'token=fhqwhgads' }, {}, (err, response) => {
    expect(err).toBe(null);
    expect(JSON.parse(response.body)).toEqual({ text: 'Message not sent: Phone number must be in +1XXXXXXXXXX format: ""' });
    done();
  });
});

test('requires a space', done => {
  process.env.SLACK_VALIDATION_TOKEN = 'fhqwhgads';
  delete process.env.SLACK_CHANNEL_ID;

  const body = querystring.encode({ token: 'fhqwhgads', text: '+11234567890' });

  handler({ body: body }, {}, (err, response) => {
    expect(err).toBe(null);
    expect(JSON.parse(response.body)).toEqual({ text: 'Message not sent: Phone number must be followed by a space.' });
    done();
  });
});

test('requires a body', done => {
  process.env.SLACK_VALIDATION_TOKEN = 'fhqwhgads';
  delete process.env.SLACK_CHANNEL_ID;

  const body = querystring.encode({ token: 'fhqwhgads', text: '+11234567890 ' });

  handler({ body: body }, {}, (err, response) => {
    expect(err).toBe(null);
    expect(JSON.parse(response.body)).toEqual({ text: 'Message not sent: Message body cannot be empty.' });
    done();
  });
});
