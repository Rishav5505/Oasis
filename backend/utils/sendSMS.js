const twilio = require('twilio');

// const accountSid = process.env.TWILIO_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = twilio(accountSid, authToken);

const sendSMS = (to, message) => {
  // client.messages
  //   .create({
  //     body: message,
  //     from: process.env.TWILIO_PHONE,
  //     to: to,
  //   })
  //   .then(message => console.log(message.sid))
  //   .catch(err => console.log(err));
  console.log(`SMS to ${to}: ${message}`); // For demo
};

module.exports = sendSMS;