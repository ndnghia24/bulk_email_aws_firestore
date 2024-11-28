require('dotenv').config();  // Tải các biến môi trường từ file .env
const axios = require('axios');
const querystring = require('querystring');

// Lấy thông tin từ .env
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;  // Lấy AWS_ACCESS_KEY từ .env
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;  // Lấy AWS_SECRET_KEY từ .env
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';  // Lấy AWS_REGION từ .env hoặc mặc định là us-east-1
const ENDPOINT = `https://email.${AWS_REGION}.amazonaws.com/`;  // Cập nhật endpoint với region từ .env

module.exports = async (req, res) => {
  // Đảm bảo chỉ chấp nhận phương thức POST
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  const body = querystring.stringify({
    'Action': 'SendEmail',
    'Source': 'ngoducnghia01648927528@gmail.com	',
    'Destination.ToAddresses.member.1': 'success@simulator.amazonses.com', 
    'Message.Subject.Data': 'Khuyến mãi hôm nay!',
    'Message.Body.Html.Data': '<html><body><h1>Đừng bỏ lỡ khuyến mãi hôm nay của chúng tôi!</h1></body></html>',  // Nội dung email
    'Version': '2010-12-01'
  });

  // Tạo chữ ký cho yêu cầu (AWS signature - cần thực hiện việc này)
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-Amz-Date': new Date().toISOString().replace(/[:-]|\.\d{3}/g, ''),
    // 'Authorization': `AWS4-HMAC-SHA256 ${signature}`  // Cần tính toán chữ ký AWS (signature) đúng
  };

  try {
    // Gửi yêu cầu POST tới AWS SES API
    const response = await axios.post(ENDPOINT, body, { headers });
    console.log('Email sent successfully:', response.data);
    return res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error during email sending:', error.response?.data || error.message);
    return res.status(500).send(`Failed to send email. Error: ${error.response?.data || error.message}`);
  }
};
