import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch'; // Nếu bạn gọi API sendEmail từ trong server của bạn
const filePath = path.resolve('./data/subscribers.json'); // Đường dẫn tới file JSON lưu subscriber

// Đọc danh sách subscribers từ file JSON
const getSubscribers = () => {
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath);
    return JSON.parse(fileData);
  }
  return [];
};

// Đọc nội dung cần gửi cho từng người
const createEmailBody = (email: string, location: string) => {
  return `
    <h1>Hello, ${email}!</h1>
    <p>We are happy to inform you that your location is ${location}.</p>
    <p>Thank you for subscribing to our service!</p>
  `;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const subscribers = getSubscribers();
  if (!subscribers || subscribers.length === 0) {
    return res.status(404).send('No subscribers found');
  }

  // Lặp qua các subscribers và gửi email cho mỗi người
  for (const subscriber of subscribers) {
    const { email, location } = subscriber;

    const subject = 'Your Subscription Confirmation';
    const body = createEmailBody(email, location);

    try {
      // Gọi API gửi email cho từng người (dùng route đã có)
      const response = await fetch('https://nodejs-serverless-function-express-lac-pi.vercel.app/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ccAddresses: [email], // Gửi email tới địa chỉ này
          subject: subject,
          body: body, // Nội dung được tạo tùy chỉnh
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      console.log(`Email sent to ${email} successfully.`);
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error.message);
      continue; // Tiếp tục gửi email cho các subscribers còn lại nếu có lỗi
    }
  }

  return res.status(200).json({ message: 'Bulk email sending completed.' });
}