# twilio-slack

Receive SMS messages in Slack with Twilio.

Assuming you have a Slack channel and a Twilio number already:

* Create a Slack webhook. Make a note of the URL.
* Create a Twilio Function. Paste the contents of `twilio-function.js` there.
* Set the Slack webhook URL as the SLACK_WEBHOOK_PATH environment variable in
  the Twilio interface.
