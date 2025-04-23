const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://192.168.1.37:1883');

client.on('error', (err) => {
    console.error("❌ MQTT Error:", err.message);
  });

client.on('connect', () => {
  console.log('📡 Connected to MQTT broker (EM320-TILT)');

  setInterval(() => {
    const payload = {
      deviceInfo: {
        deviceName: "WEST/EM320-TILT #1"
      },
      object: {
        battery: 95,
        angle_x: +(Math.random() * 4 - 2).toFixed(2),
        angle_y: +(Math.random() * 4 - 2).toFixed(2),
        angle_z: +(Math.random() * 45).toFixed(2),
        threshold_x: "normal",
        threshold_y: "normal",
        threshold_z: Math.random() > 0.8 ? "trigger" : "normal"
      }
    };

    const topic = "application/west/device/TILT1/event/up";

    client.publish(topic, JSON.stringify(payload), () => {
      console.log(`📤 [EM320-TILT] Published to ${topic}:`, payload.object);
    });

  }, 10000); // kirim tiap 10 detik
});
