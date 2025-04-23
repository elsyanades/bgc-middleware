const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://192.168.1.37:1883');

client.on('connect', () => {
  console.log('📡 Connected to MQTT broker (RK500-09)');

  setInterval(() => {
    const payload = {
      deviceInfo: {
        deviceName: "WR/RK500-09 #PR1",
        location: "Tower A"
      },
      object: {
        ph: +(Math.random() * 4 + 5).toFixed(2),               // 5.00 - 9.00
        do: +(Math.random() * 10).toFixed(2),                  // mg/L
        turbidity: +(Math.random() * 50).toFixed(2),           // NTU
        conductivity: +(Math.random() * 500).toFixed(2),       // µS/cm
        battery: 95
      }
    };

    const topic = "application/west/device/rk500-1/event/up";
    client.publish(topic, JSON.stringify(payload), () => {
      console.log(`📤 [RK500-09] Published to ${topic}:`, payload.object);
    });
  }, 10000);
});
