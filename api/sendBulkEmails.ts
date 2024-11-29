import { db } from './firebaseAdmin'; // Import cấu hình Firebase
import fetch from 'node-fetch';
import Cors from 'cors'; // Import thư viện cors

// Cấu hình cors
const cors = Cors({
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  origin: '*', // Hoặc thay bằng domain cụ thể nếu cần
});

// Lấy danh sách subscribers từ Firestore
const getSubscribers = async () => {
  const snapshot = await db.collection('subscribers').get();
  return snapshot.docs.map(doc => doc.data());
};

// Fetch thông tin thời tiết từ WeatherAPI.com
const fetchWeatherData = async (location: string) => {
  const apiKey = process.env.WEATHER_API_KEY;
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data for location: ${location}`);
    }
    const data = await response.json();

    return {
      temperature: data.current.temp_c, // Nhiệt độ (°C)
      weather: data.current.condition.text, // Mô tả điều kiện thời tiết
      icon: data.current.condition.icon, // URL của icon thời tiết
    };
  } catch (error) {
    console.error(`Error fetching weather data: ${error.message}`);
    return null;
  }
};

// Tạo nội dung email với thông tin thời tiết
const createEmailBody = (email: string, location: string, weatherData: any) => {
  if (!weatherData) {
    return `
      <h1>Hello, ${email}!</h1>
      <p>We were unable to fetch the weather information for your location (${location}).</p>
      <p>Please try again later.</p>
    `;
  }

  return `
    <h1>Hello, ${email}!</h1>
    <p>Here is the latest weather update for your location, <strong>${location}</strong>:</p>
    <ul>
      <li><strong>Temperature:</strong> ${weatherData.temperature}°C</li>
      <li><strong>Condition:</strong> ${weatherData.weather}</li>
    </ul>
    <img src="https:${weatherData.icon}" alt="Weather Icon" />
    <p>Thank you for subscribing to Q-Weather-Forecast!</p>
  `;
};

// Hàm để chạy CORS trước khi xử lý logic API
const runCors = (req, res) => {
  return new Promise((resolve, reject) => {
    cors(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve(result);
    });
  });
};

export default async function handler(req, res) {
  try {
    // Chạy CORS trước khi xử lý API logic
    await runCors(req, res);

    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const subscribers = await getSubscribers();
    if (!subscribers || subscribers.length === 0) {
      return res.status(404).send('No subscribers found');
    }

    const results = [];
    const errors = [];

    for (const subscriber of subscribers) {
      const { email, location } = subscriber;

      // Fetch weather data for the location
      const weatherData = await fetchWeatherData(location);
      const subject = 'Q-Weather-Forecast: Your Location Information';
      const body = createEmailBody(email, location, weatherData);

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
  } catch (error) {
    console.error('Error handling request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
