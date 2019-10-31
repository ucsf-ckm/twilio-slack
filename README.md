# twilio-slack

Send and receive SMS messages in Slack with Twilio and AWS Lambda.

<img src="https://travis-ci.org/ucsf-ckm/twilio-slack.svg?branch=master">

Assuming you have a Slack channel and a Twilio number already:

* Create a Slack webhook. Make a note of the URL.
* Create a Twilio Function. Paste the contents of `twilio-function.js` there.
* Make sure to set the Slack webhook URL as the SLACK_WEBHOOK_PATH envronment
  variable in the Twilio interface.

If all you need to do is receive SMS messages, then you're done!

To set up a slash-command in Slack to send SMS messages:

* Create an AWS Lambda function. My settings:
  * Name: slackToSms
  * Runtime: Node.js 8.10
  * Role: lambda_basic_execution
* Run `rm -rf node_modules && npm install --production`.
* Copy `aws-lambda.js` to `index.js`.
* Create a zip file of the resulting `node_modules` directory along with the
  `index.js` file. (`zip -r out.zip index.js node_modules/`)
* Upload that zip file as your Lambda function.
* In API Gateway:
  * API: LambadMicroservice
  * Deployment stage: prod
  * Security: open
* Set these environment variables in the AWS Lambda interface for `slackToSms`:
  * `OUR_TWILIO_PHONE_NUMBER` is your Twilio phone number in `+1XXXXXXXXXX`
    format.
  * `TWILIO_ACCOUNT_SID` can be found on your Twilio General Settings page.
  * `TWILIO_AUTH_TOKEN` can also be found on your Twilio General Settings page.
  * We'll come back to add our `SLACK_VALIDATION_TOKEN` value in a little bit...
* Go over to your Slack administration interface and add a new slash command.
  See https://api.slack.com/slash-commands. I use an internal integration. See
  https://api.slack.com/internal-integrations.
* Momentarily head back to the AWS interface in provide the
  `SLACK_VALIDATION_TOKEN` environment variable value.
* In the Slack interface again, adding the slash command, you'll use your AWS
  Lambda URL for the Request URL.
* If you wish to restrict access to the slash command to a single channel, put
  the channel ID in the `SLACK_CHANNEL_ID` environment variable.
* Be sure to install your Slack slash-command app in your Slack, of course.
  Unless you want the whole world to be able to send stuff from your Twilio
  number, you'll want to make sure you do *not* publish/distribute your app. :-D

Phew! That was a lot of steps! But you're done! Try it out!
