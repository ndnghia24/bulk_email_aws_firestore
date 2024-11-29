require('dotenv').config();  // Tải các biến môi trường từ file .env
const AWS = require('aws-sdk');  // Import AWS SDK

// Cấu hình AWS SDK với thông tin xác thực từ file .env
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_NDNGHIA24,
  secretAccessKey: process.env.AWS_SECRET_KEY_NDNGHIA24,
  region: process.env.AWS_REGION_NDNGHIA24 || 'ap-southeast-2',
});

const ses = new AWS.SES();

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Authentication
  const clientApiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY_NDNGHIA24;

  if (!clientApiKey || clientApiKey !== validApiKey) {
    return res.status(403).send({ error: 'Forbidden: Invalid or missing API Key' });
  }

  const { ccAddresses, subject, body } = req.body;

  if (!ccAddresses || !Array.isArray(ccAddresses) || ccAddresses.length === 0) {
    return res.status(400).send('Invalid or missing ccAddresses');
  }
  if (!subject || typeof subject !== 'string') {
    return res.status(400).send('Invalid or missing subject');
  }
  if (!body || typeof body !== 'string') {
    return res.status(400).send('Invalid or missing body');
  }

  // Thiết lập các tham số email
  const params = {
    Source: 'ngoducnghia01648927528@gmail.com',
    Destination: {
      ToAddresses: ['success@simulator.amazonses.com'],
      CcAddresses: ccAddresses,
    },
    Message: {
      Subject: {
        Data: subject, // Tiêu đề nhận từ req.body
      },
      Body: {
        Html: {
          Data: body, // Nội dung nhận từ req.body
        },
      },
    },
  };

  try {
    // Gửi email qua SES
    const response = await ses.sendEmail(params).promise();
    console.log('Email sent successfully:', response);
    return res.status(200).json({ message: 'Email sent successfully', response });
  } catch (error) {
    console.error('Error during email sending:', error);
    return res.status(500).json({ error: `Failed to send email. Error: ${error.message}` });
  }
};
