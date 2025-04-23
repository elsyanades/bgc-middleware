const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://192.168.1.37:1883');

client.on('connect', () => {
  console.log('📡 Connected to MQTT broker (AM307)');

  setInterval(() => {
    const payload = {
      deviceInfo: {
        deviceName: "PCA/AM307 #GF",
        location: "precint/tower a"
      },
      object: {
        temperature: +(Math.random() * 5 + 25).toFixed(2),   // °C
        humidity: +(Math.random() * 20 + 60).toFixed(2),     // %
        co2: +(Math.random() * 2000).toFixed(0),             // ppm
        tvoc: +(Math.random() * 500).toFixed(0),             // ppb
        pm2_5: +(Math.random() * 150).toFixed(0),            // µg/m³
        illuminance: +(Math.random() * 100).toFixed(0),      // lux
        pressure: +(Math.random() * 5 + 1000).toFixed(2),    // hPa
        battery: 96                                          // %
      }
    };

    const topic = "application/west/device/am307-1/event/up";
    client.publish(topic, JSON.stringify(payload), () => {
      console.log(`📤 [AM307] Published to ${topic}:`, payload.object);
    });
  }, 10000);
});
