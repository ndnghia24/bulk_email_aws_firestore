import { db } from './firebaseAdmin'; // Import cấu hình Firebase
import fetch from 'node-fetch';

// Lấy danh sách subscribers từ Firestore
const getSubscribers = async () => {
  const snapshot = await db.collection('subscribers').get();
  const subscribers = snapshot.docs.map(doc => doc.data());
  return subscribers;
};

// Lưu danh sách subscribers vào Firestore
const saveSubscribers = async (subscribers) => {
  const batch = db.batch();
  subscribers.forEach(subscriber => {
    const docRef = db.collection('subscribers').doc(subscriber.email);
    batch.set(docRef, subscriber);
  });
  await batch.commit();
};

export default async function handler(req, res) {
  switch (req.method) {
    case 'POST':
      const { email, location } = req.body;
      if (!email || !location) {
        return res.status(400).send('Invalid or missing email or location');
      }

      const subscribersPost = await getSubscribers();

      const existingSubscriber = subscribersPost.find(subscriber => subscriber.email === email);
      if (existingSubscriber) {
        return res.status(200).json({ message: 'Email already exists, skipping verification.' });
      }

      subscribersPost.push({ email, location });
      return res.status(200).json({ message: 'Subscriber added.' });
      await saveSubscribers(subscribersPost);

      try {
        const response = await fetch('https://nodejs-serverless-function-express-lac-pi.vercel.app/api/verifyEmail', {
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
      const { emailToDelete } = req.body;
      if (!emailToDelete) {
        return res.status(400).send('Invalid email');
      }

      let subscribersDelete = await getSubscribers();
      subscribersDelete = subscribersDelete.filter(subscriber => subscriber.email !== emailToDelete);
      await saveSubscribers(subscribersDelete);

      return res.status(200).json({ message: 'Subscriber deleted.' });

    case 'GET':
      const subscribersGet = await getSubscribers();
      return res.status(200).json(subscribersGet);

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
