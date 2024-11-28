// api/sendEmail.js

module.exports = async (req, res) => {
    // Đảm bảo chỉ chấp nhận phương thức POST
    if (req.method !== 'GET') {
      return res.status(405).send('Method Not Allowed');
    }

    const fetch = require('node-fetch');
    
    // Thực hiện gửi email qua Elastic Email API
    const response = await fetch('https://api.elasticemail.com/v4/emails', {
      method: 'POST',
      body: JSON.stringify({
        apikey: '1D379C34823C8E62F6001EEC64879FDB3ECBFC6CE8F09F51B6BA441C6001E81E3FAA59498BE3F3FE370BECAD75D478B2',
        Recipients: [
          {
            Email: 'ngoducnghia01648927528@gmail.com',
            Name: 'Ngô Đức Nghĩa'
          }
        ],
        Content: {
          Body: [
            {
              ContentType: 'HTML',
              Content: '<strong>Đừng bỏ lỡ khuyến mãi hôm nay của chúng tôi!</strong>'
            }
          ],
          From: 'ngoducnghia01648927528@gmail.com',
          Subject: 'Khuyến mãi hôm nay!',
          TemplateName: 'Template01'
        },
        Options: {
          TimeOffset: null,
          PoolName: 'My Custom Pool',
          ChannelName: 'Channel01',
          Encoding: 'UserProvided',
          TrackOpens: true,
          TrackClicks: true
        }
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  
    const data = await response.json();
  
    if (data.TransactionID) {
      return res.status(200).send('Email sent successfully');
    } else {
      return res.status(500).send('Failed to send email');
    }
};
