# twilio-slack
--------------

Use Twilio to receive an SMS message. Have that message appear in a Slack
channel.

Assuming you have a Slack channel and a Twilio number already:

* Create a Slack webhook. Make a note of the URL.
* Create a Twilio Function. Paste the contents of `index.js` there.
* Make sure to set the Slack webhook URL as the SLACK_WEBHOOK_PATH envronment
  variable in the Twilio interface.

And that's it! It should work. If it doesn't, open an issue (or even better,
file a pull request to fix whatever it is).
