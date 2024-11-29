import { db } from './firebaseAdmin'; // Import cấu hình Firebase
import fetch from 'node-fetch';

// Đọc danh sách subscribers từ Firestore
const getSubscribers = async () => {
  const snapshot = await db.collection('subscribers').get();
  return snapshot.docs.map(doc => doc.data());
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

  const subscribers = await getSubscribers();
  if (!subscribers || subscribers.length === 0) {
    return res.status(404).send('No subscribers found');
  }

  const results = []; // Mảng để lưu kết quả của từng email
  const errors = []; // Mảng để lưu các lỗi nếu có

  for (const subscriber of subscribers) {
    const { email, location } = subscriber;
    const subject = 'Q-Weather-Forecast: Your Location Information';
    const body = createEmailBody(email, location);

    try {
      const response = await fetch('https://nodejs-serverless-function-express-lac-pi.vercel.app/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ccAddresses: [email],
          subject: subject,
          body: body,
        }),
      });

      if (response.ok) {
        const rawBody = await response.text();
        results.push({
          email,
          status: 'success',
          message: `Email sent to ${email} successfully.`,
          response: rawBody,
        });
      } else {
        const errorBody = await response.text();
        errors.push({
          email,
          status: 'failed',
          message: `Failed to send email to ${email}: ${errorBody}`,
        });
      }
    } catch (error) {
      errors.push({
        email,
        status: 'failed',
        message: `Error sending email to ${email}: ${error.message}`,
      });
    }
  }

  return res.status(200).json({
    message: 'Bulk email sending completed.',
    results: results,
    errors: errors,
  });
}
