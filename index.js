/* global Twilio */

const https = require('https');

// Make sure to declare SLACK_WEBHOOK_PATH in your Environment
// variables at
// https://www.twilio.com/console/runtime/functions/configure

exports.handler = (context, event, callback) => {
  // Extract the bits of the message we want
  const { To, From, Body } = event;
  const images = [];
  while (event['MediaUrl' + images.length]) {
    images.push(event['MediaUrl' + images.length]);
  }
  const bodyWithImages = [Body].concat(images).join('\n\nAttached media: ');
  function encode (field) {
    return field.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  const encodedBody = encode(bodyWithImages);
  const encodedFrom = encode(From);
  const encodedTo = encode(To);

  // Construct a payload for slack's incoming webhooks
  const slackBody = JSON.stringify({
    attachments: [
      {
        fallback: `${From}: ${encodedBody}`,
        text: `Received SMS from ${From}`,
        fields: [
          {
            title: 'Sender',
            value: encodedFrom,
            short: true
          },
          {
            title: 'Receiver',
            value: encodedTo,
            short: true
          },
          {
            title: 'Message',
            value: '<!here> ' + encodedBody,
            short: false
          }
        ],
        color: '#5555AA'
      }
    ]
  });

  // Account for emoji
  function byteLength (str) {
    // returns the byte length of an utf8 string
    var s = str.length;
    for (var i = str.length - 1; i >= 0; i--) {
      var code = str.charCodeAt(i);
      if (code > 0x7f && code <= 0x7ff) {
        s++;
      } else if (code > 0x7ff && code <= 0xffff) {
        s += 2;
      }
      if (code >= 0xDC00 && code <= 0xDFFF) {
        i--; // trail surrogate
      }
    }
    return s;
  }
  const slackBodyLength = byteLength(slackBody);

  // Form our request specification
  const options = {
    host: 'hooks.slack.com',
    port: 443,
    path: context.SLACK_WEBHOOK_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': slackBodyLength
    }
  };
  console.log(slackBody, '===', slackBody.length);

  // send the request
  const post = https.request(options, res => {
    // only respond once we're done, or Twilio's functions
    // may kill our execution before we finish.
    res.on('error', (e) => { console.log('res ERROR:', e); });
    res.on('data', (chunk) => { console.log('res CHUNK:', chunk.toString()); });
    res.on('end', () => {
      // respond with an empty message
      callback(null, new Twilio.twiml.MessagingResponse());
    });
  });
  post.on('error', e => { console.log('post ERROR:', e); });
  post.on('drain', () => { post.end(); });
  if (post.write(slackBody)) {
    post.end();
  }
};
