import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch'; // Import thư viện fetch để gọi API sendVerificationEmail

// Đường dẫn đến file JSON lưu trữ subscribers
const filePath = path.resolve('./data/subscribers.json');

// Đọc danh sách subscribers từ file JSON
const getSubscribers = () => {
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath);
    return JSON.parse(fileData);
  }
  return [];
};

// Lưu danh sách subscribers vào file JSON
const saveSubscribers = (subscribers) => {
  fs.writeFileSync(filePath, JSON.stringify(subscribers, null, 2));
};

export default async function handler(req, res) {
  switch (req.method) {
    case 'POST':
      // Thêm subscriber mới vào danh sách
      const { email, location } = req.body;
      if (!email || !location) {
        return res.status(400).send('Invalid or missing email or location');
      }

      const subscribersPost = getSubscribers();

      // Kiểm tra xem email đã có trong danh sách chưa
      const existingSubscriber = subscribersPost.find(subscriber => subscriber.email === email);
      if (existingSubscriber) {
        return res.status(200).json({ message: 'Email already exists, skipping verification.' });
      }

      // Thêm email và location vào danh sách
      subscribersPost.push({ email, location });
      saveSubscribers(subscribersPost);

      // Gửi yêu cầu tới API sendVerificationEmail để gửi email xác nhận
      try {
        // Gọi API nội bộ bằng relative URL
        const response = await fetch('/api/verifyEmail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error('Failed to send verification email');
        }

        return res.status(200).json({ message: 'Subscriber added and verification email sent.' });
      } catch (error) {
        console.error('Error sending verification email:', error);
        return res.status(500).json({ error: `Failed to send verification email: ${error.message}` });
      }

    case 'DELETE':
      // Xoá subscriber khỏi danh sách theo email
      const { emailToDelete } = req.body;
      if (!emailToDelete) {
        return res.status(400).send('Invalid email');
      }

      let subscribersDelete = getSubscribers();
      subscribersDelete = subscribersDelete.filter(subscriber => subscriber.email !== emailToDelete);
      saveSubscribers(subscribersDelete);
      return res.status(200).json({ message: 'Subscriber deleted.' });

    case 'GET':
      // Lấy danh sách subscribers
      const subscribersGet = getSubscribers();
      return res.status(200).json(subscribersGet);

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}