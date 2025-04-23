const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://192.168.1.37:1883');

client.on('connect', () => {
  console.log('📡 Connected to MQTT broker (EM400-MUD)');

  setInterval(() => {
    const payload = {
      deviceInfo: {
        deviceName: "WR/EM400-OD #9",
        location: "west/Tower E"
      },
      object: {
        distance: +(Math.random() * 100).toFixed(2),
        burn_detection: Math.random() > 0.95,
        tilt_status: Math.random() > 0.9,
        temperature: +(Math.random() * 10 + 25).toFixed(2),
        battery: +(Math.random() * 10 + 85).toFixed(0)
      }
    };

    const topic = "application/west/device/mud1/event/up";
    client.publish(topic, JSON.stringify(payload), () => {
      console.log(`📤 [EM400-MUD] Published to ${topic}:`, payload.object);
    });
  }, 10000);
});
