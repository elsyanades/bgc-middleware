const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://192.168.1.37:1883');

client.on('connect', () => {
  console.log('📡 Connected to MQTT broker (WTS506)');

  setInterval(() => {
    const payload = {
      deviceInfo: {
        deviceName: "WEST/WTS506 #1"
      },
      object: {
        battery: 94,
        temperature: +(Math.random() * 10 + 20).toFixed(2),       // 20–30 °C
        humidity: +(Math.random() * 40 + 40).toFixed(2),          // 40–80 %
        wind_direction: +(Math.random() * 360).toFixed(2),        // 0–360°
        pressure: +(Math.random() * 10 + 1000).toFixed(2),        // 1000–1010 hPa
        wind_speed: +(Math.random() * 25).toFixed(2),             // 0–25 m/s (alarm if > 20)
        rainfall_total: +(Math.random() * 100).toFixed(2),        // 0–100 mm (alarm if > 50)
        rainfall_counter: Math.floor(Math.random() * 256)         // 0–255
      }
    };

    const topic = "application/west/device/wts506-1/event/up";
    client.publish(topic, JSON.stringify(payload), () => {
      console.log(`📤 [WTS506] Published to ${topic}:`, payload.object);
    });
  }, 10000);
});