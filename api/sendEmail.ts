// api/sendEmail.js

module.exports = async (req, res) => {
    // Đảm bảo chỉ chấp nhận phương thức GET
    if (req.method !== 'GET') {
      return res.status(405).send('Method Not Allowed');
    }
  
    const fetch = require('node-fetch');
    
    // Thực hiện gửi email qua Elastic Email API
    const response = await fetch('https://api.elasticemail.com/v4/emails', {
      method: 'POST',
      body: JSON.stringify({
        apikey: 'YOUR_ELASTIC_EMAIL_API_KEY',
        from: 'ngoducnghia01648927528@gmail.com',
        to:'ngoducnghia01648927528@gmail.com',
        subject: 'Khuyến mãi hôm nay!',
        bodyHtml: '<strong>Đừng bỏ lỡ khuyến mãi hôm nay của chúng tôi!</strong>'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  
    const data = await response.json();
  
    if (data.success) {
      return res.status(200).send('Email sent successfully');
    } else {
      return res.status(500).send('Failed to send email');
    }
  };
  