const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://192.168.1.37:1883');

client.on('connect', () => {
  console.log('📡 Connected to MQTT broker (EM500-PP)');

  setInterval(() => {
    const value = +(Math.random() * 2).toFixed(2); // 0.00 - 2.00 bar
    const payload = {
      deviceInfo: {
        deviceName: "WEST/EM500-PP #1"
      },
      object: {
        pressure: value,
        battery: 96
      }
    };

    const topic = "application/west/device/pp1/event/up";
    client.publish(topic, JSON.stringify(payload), () => {
      console.log(`📤 [EM500-PP] Published to ${topic}:`, payload.object);
    });
  }, 10000);
});
