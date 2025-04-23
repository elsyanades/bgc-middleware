const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://192.168.1.37:1883');

client.on('connect', () => {
  console.log('📡 Connected to MQTT broker (EM300-ZLD)');

  setInterval(() => {
    const payload = {
      deviceInfo: {
        deviceName: "WEST/EM300-ZLD #1"
      },
      object: {
        battery: 95,
        temperature: +(Math.random() * 10 + 20).toFixed(2), // 20–30 °C
        humidity: +(Math.random() * 30 + 50).toFixed(2),   // 50–80 %
        leakage_status: Math.random() > 0.9 ? "leak" : "normal" // 10% kemungkinan leak
      }
    };

    const topic = "application/west/device/zld1/event/up";
    client.publish(topic, JSON.stringify(payload), () => {
      console.log(`📤 [EM300-ZLD] Published to ${topic}:`, payload.object);
    });
  }, 10000);
});
