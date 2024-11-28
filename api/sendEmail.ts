require('dotenv').config();  // Tải các biến môi trường từ file .env
const AWS = require('aws-sdk');  // Import AWS SDK

// Cấu hình AWS SDK với thông tin xác thực từ file .env
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION || 'us-east-1',  // Nếu không có region trong .env thì mặc định là 'us-east-1'
});

const ses = new AWS.SES();  // Tạo instance của SES

module.exports = async (req, res) => {
  // Đảm bảo chỉ chấp nhận phương thức POST
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  // Thiết lập các tham số email
  const params = {
    Source: 'ngoducnghia01648927528@gmail.com',  // Thay thế bằng email đã xác minh trong SES
    Destination: {
      ToAddresses: ['success@simulator.amazonses.com'],  // Email người nhận chính
      CcAddresses: ['ngoducnghia01648927528@gmail.com'],  // Thêm email CC
    },
    Message: {
      Subject: {
        Data: 'Khuyến mãi hôm nay!',
      },
      Body: {
        Html: {
          Data: '<html><body><h1>Đừng bỏ lỡ khuyến mãi hôm nay của chúng tôi!</h1></body></html>',
        },
      },
    },
  };

  try {
    // Gửi email qua SES
    const response = await ses.sendEmail(params).promise();
    console.log('Email sent successfully:', response);
    return res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error during email sending:', error);
    return res.status(500).send(`Failed to send email. Error: ${error.message}`);
  }
};
