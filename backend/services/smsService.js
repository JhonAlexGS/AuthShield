const twilio = require('twilio');

const sendSMS = async (phoneNumber, message) => {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log('SMS sent: %s', result.sid);
    return result;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error('Error al enviar SMS');
  }
};

module.exports = sendSMS;
