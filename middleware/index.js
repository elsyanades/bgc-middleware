// Middleware BGC (Bangunan Gedung Cerdas)
require('dotenv').config();
const mqtt = require('mqtt');
const { Client } = require('pg');
const axios = require('axios');
const fs = require('fs');
const express = require('express');
const sensorRoutes = require('./routes/sensorRoutes');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4000;

// Logging setup
const logFile = 'log/middleware.log';
if (!fs.existsSync('log')) fs.mkdirSync('log');
const writeLog = (msg) => fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);

// Connect to MQTT broker
const client = mqtt.connect(process.env.MQTT_BROKER, {
  username: process.env.MQTT_USERNAME || undefined,
  password: process.env.MQTT_PASSWORD || undefined,
});

// Connect to PostgreSQL
const db = new Client({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD
});
db.connect();

// MQTT status logs
client.on('connect', () => {
  console.log('📡 Connected to MQTT broker');
  client.subscribe('application/+/device/+/event/up');
});
client.on('reconnect', () => console.log('🔁 Reconnecting to MQTT broker...'));
client.on('close', () => console.log('❌ MQTT connection closed'));
client.on('error', err => console.error('🚫 MQTT Error:', err.message));

// Retry helper
const sendToBMS = async (data) => {
  for (let i = 0; i < 3; i++) {
    try {
      await axios.post(`${process.env.BMS_URL}`, data);
      return true;
    } catch (err) {
      console.log(`🔁 Retry kirim ke BMS ke-${i + 1} gagal: ${err.message}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  console.log('❌ Gagal kirim alarm ke BMS setelah 3x percobaan');
  return false;
};

// MQTT handler
client.on('message', async (topic, message) => {
  console.log(`📨 Topic: ${topic}`);
  try {
    const payload = JSON.parse(message.toString());
    const data = payload.object;
    const deviceName = payload.deviceInfo.deviceName || 'unknown';
    const lokasi = payload.deviceInfo.location || 'unknown';
    const sensorType = deviceName.split('/')[1]?.split(' ')[0] || 'unknown';
    const payloadId = Date.now();

    writeLog(`📦 Payload ID: ${payloadId} | Device: ${deviceName}`);

    const unitMap = {
      angle_x: "°", angle_y: "°", angle_z: "°", battery: "%",
      threshold_x: "-", threshold_y: "-", threshold_z: "-",
      distance: "cm", pressure: "hPa", temperature: "°C", nh3: "ppm",
      co2: "ppm", tvoc: "ppb", pm2_5: "µg/m³", illuminance: "Lux",
      ph: "-", do: "mg/L", turbidity: "NTU", conductivity: "µS/cm",
      burn_detection: "-", tilt_status: "-"
    };

    for (const [parameter, value] of Object.entries(data)) {
      if (typeof value === 'object') continue;

      const unit = unitMap[parameter.toLowerCase()] || "-";
      const isAlarm =
        typeof value === 'number' && (
          (parameter.toLowerCase().includes('angle_z') && value > 30) ||
          (parameter.toLowerCase().includes('nh3') && value > 5) ||
          (parameter.toLowerCase().includes('pressure') && value < 0.5) ||
          (parameter.toLowerCase().includes('distance') && (value > 3000 || value < 30)) ||
          (parameter.toLowerCase().includes('co2') && value > 1000) ||
          (parameter.toLowerCase() === "ph" && (value < 6.5 || value > 8.5)) ||
          (parameter.toLowerCase().includes('wind_speed') && value > 20) ||
          (parameter.toLowerCase().includes('rainfall_total') && value > 50) ||
          (parameter.toLowerCase().includes('flow_rate') && value < 1)
        ) ||
        (typeof value === 'string' && (
          (parameter.toLowerCase().includes('threshold_z') && value === "trigger") ||
          (parameter.toLowerCase().includes('leakage_status') && value === "leak") ||
          (parameter.toLowerCase().includes('burn_detection') && value === "true")
        ));

      await db.query(
        `INSERT INTO sensor_data(device_name, lokasi, sensor_type, parameter, value, unit, payload_id, from_alarm)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [deviceName, lokasi, sensorType, parameter, value.toString(), unit, payloadId, isAlarm]
      );

      if (isAlarm) {
        await db.query(
          `INSERT INTO alarm_event(sensor_id, lokasi, pesan, kategori, diteruskan_ke)
           VALUES ($1, $2, $3, $4, $5)`,
          [deviceName, lokasi, `Alarm ${parameter}: ${value}`, sensorType, 'BMS']
        );

        const alarmPayload = {
          BGC_Request: {
            Status: {
              Message: "OK",
              _ErrorCode: "0",
              _TimeStamp: new Date().toISOString()
            },
            Element: {
              _Abbrev: sensorType,
              __text: `Alarm dari sensor ${sensorType}`
            },
            SendMessage: "True",
            Data: {
              Sensor: {
                Location: lokasi,
                Pesan: `Alarm ${parameter} = ${value}`,
                Penerima: {
                  _Nama: "Elsyana",
                  __text: "+62000000000"
                },
                _Id: "1"
              },
              _Count: "1"
            }
          }
        };

        const success = await sendToBMS(alarmPayload);
        if (success) console.log(`🚨 Alarm terkirim: ${deviceName} - ${parameter}: ${value}`);
      }
    }
  } catch (err) {
    console.error("❌ Error handling MQTT message:", err.message);
    writeLog(`❌ Error: ${err.message}`);
  }
});

// Health check endpoint
app.get('/healthz', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.status(200).json({ status: 'ok', timestamp: result.rows[0].now });
  } catch (e) {
    res.status(500).json({ status: 'error', error: e.message });
  }
});

// Dynamic route loader
app.use('/api/sensor', sensorRoutes);

app.listen(PORT, () => {
  console.log(`🩺 Healthcheck aktif di http://localhost:${PORT}/healthz`);
});
