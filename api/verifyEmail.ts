require('dotenv').config(); // Đọc biến môi trường từ file .env
const AWS = require('aws-sdk'); // Import AWS SDK

// Cấu hình AWS SDK với thông tin xác thực
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_NDNGHIA24,
  secretAccessKey: process.env.AWS_SECRET_KEY_NDNGHIA24,
  region: process.env.AWS_REGION_NDNGHIA24 || 'ap-southeast-2',
});

const ses = new AWS.SES(); // Tạo instance SES

module.exports = async (req, res) => {
  // Kiểm tra nếu phương thức không phải POST
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method Not Allowed.' });
  }

  // Authentication
  const clientApiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY_NDNGHIA24;

  if (!clientApiKey || clientApiKey !== validApiKey) {
    return res.status(403).send({ error: 'Forbidden: Invalid or missing API Key' });
  }

  // Lấy email từ body request
  const { email } = req.body;
  if (!email) {
    return res.status(400).send({ error: 'Email is required' });
  }

  const params = {
    EmailAddress: email, // Email cần xác minh
  };

  try {
    // Gửi yêu cầu xác minh email qua SES
    await ses.verifyEmailIdentity(params).promise();
    console.log(`Verification email sent to ${email}`);
    return res.status(200).send({ message: `Verification email sent to ${email}. Please check your inbox.` });
  } catch (error) {
    console.error('Error during email verification:', error.message);
    return res.status(500).send({ error: `Failed to send verification email. ${error.message}` });
  }
};