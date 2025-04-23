const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://192.168.1.37:1883');

client.on('connect', () => {
  console.log('📡 Connected to MQTT broker (GS301)');

  setInterval(() => {
    const value = +(Math.random() * 10).toFixed(2); // 0 - 10 ppm
    const payload = {
      deviceInfo: {
        deviceName: "WEST/GS301 #1"
      },
      object: {
        nh3: value,
        battery: 96
      }
    };

    const topic = "application/west/device/gs301-1/event/up";
    client.publish(topic, JSON.stringify(payload), () => {
      console.log(`📤 [GS301] Published to ${topic}:`, payload.object);
    });
  }, 10000); // tiap 10 detik
});
