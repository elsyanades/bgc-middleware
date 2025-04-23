const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://192.168.1.37:1883');

client.on('connect', () => {
  console.log('📡 Connected to MQTT broker (HBLD Flow Meter)');

  setInterval(() => {
    const payload = {
      deviceInfo: {
        deviceName: "WEST/HBLD #2",
        location: "Tower B"
      },
      object: {
        flow_rate: +(Math.random() * 10).toFixed(2), // 0–10 L/min (alarm if < 1)
        battery: 93
      }
    };

    const topic = "application/west/device/hbld1/event/up";
    client.publish(topic, JSON.stringify(payload), () => {
      console.log(`📤 [HBLD] Published to ${topic}:`, payload.object);
    });
  }, 10000);
});