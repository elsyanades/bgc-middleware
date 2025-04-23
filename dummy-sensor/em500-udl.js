const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://192.168.1.37:1883');

client.on('connect', () => {
  console.log('📡 Connected to MQTT broker (EM500-UDL)');

  setInterval(() => {
    const payload = {
      deviceInfo: {
        deviceName: "WEST/EM500-UDL #1"
      },
      object: {
        battery: Math.floor(Math.random() * 20 + 80), // 80–100%
        distance: Math.floor(Math.random() * 2000 + 100), // 100–2100 mm (~0.1–2.1 m)
        history: [
          {
            timestamp: Math.floor(Date.now() / 1000), // UNIX time
            distance: Math.floor(Math.random() * 2000 + 100)
          }
        ]
      }
    };

    const topic = "application/WEST/device/UDL1/event/up";
    client.publish(topic, JSON.stringify(payload), () => {
      console.log(`📤 [EM500-UDL] Published to ${topic}:`, payload.object);
    });

  }, 10000);
});
