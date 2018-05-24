/* global expect:false, test:false */

const { handler } = require('./aws-lambda');

test('requires a Slack token', done => {
  handler({body: ''}, {}, (err, response) => {
    expect(err).toBe(null);
    expect(JSON.parse(response.body)).toEqual({text: 'Message not sent: Invalid Slack token.'});
    done();
  });
});
