// controllers/sensorController.js
const { Client } = require('pg');
const format = require('pg-format');

const db = new Client({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD
});
db.connect();

const kategoriMapping = {
  "air-limbah": {
    Ketinggian: ['EM500-UDL'],
    Leakage: ['EM300-ZLD'],
    Odor: ['GS301'],
    Kualitas: ['RK500-09'],
    Debit: ['HBLD']
  },
  "kebencanaan": {
    Banjir: ['EM500-UDL'],
    Gempa: ['EM320-TILT'],
    Longsor: ['HWT9073'],
    Polusi: ['AM307'],
    Angin: ['WTS506']
  },
  "sampah": {
    Sensor: ['EM400-ID', 'EM400-OD']
  }
};

const formatValue = (value, unit) => {
  if (unit === '%') return `${value}%`;
  if (unit === 'cm') return `${value}cm`;
  if (unit === 'mg/L') return `${value} mg/L`;
  if (unit === 'NTU') return `${value} NTU`;
  if (unit === 'L/min') return `${value} L/min`;
  if (unit === 'ppm') return `${value} ppm`;
  if (unit === 'IAQ') return `${value} IAQ`;
  if (unit === 'm/s') return `${value} m/s`;
  if (unit === 'C' || unit === 'C°' || unit === '°C') return `${value} C`;
  return `${value}`;
};

const normalizeLocation = (lokasi) => {
  const parts = lokasi.split("/");
  return parts[parts.length - 1];
};

const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };
  

const getSensorByKawasanAndType = async (req, res) => {
  const { kawasan, tipe } = req.params;
  const mapping = kategoriMapping[tipe];
  if (!mapping) return res.status(404).json({ error: 'Tipe sensor tidak ditemukan' });

  try {
    const result = await db.query(`
      SELECT DISTINCT ON (device_name, parameter)
        device_name, lokasi, sensor_type, parameter, value, unit, timestamp
      FROM sensor_data
      WHERE sensor_type IN (${Object.values(mapping).flat().map(s => `'${s}'`).join(',')})
        AND LOWER(lokasi) LIKE $1
      ORDER BY device_name, parameter, timestamp DESC
    `, [`${kawasan.toLowerCase()}/%`]);

    console.log("🧾 Rows hasil query:", result.rows);

    const grouped = {};
    for (const key in mapping) {
      grouped[key] = { Sensor: [], _Count: 0 };
    }

    let sensorIndex = 1;
    for (const row of result.rows) {
      for (const key in mapping) {
        if (mapping[key].includes(row.sensor_type)) {
          const normalizedLokasi = capitalizeWords(normalizeLocation(row.lokasi));
          let existing = grouped[key].Sensor.find(s => s.Location === normalizedLokasi);
          if (!existing) {
            existing = { Location: normalizedLokasi, _id: `${sensorIndex++}` };
            grouped[key].Sensor.push(existing);
          }

          const param = row.parameter.toLowerCase();
          if (tipe === 'kebencanaan') {
            if (key === 'Banjir' && param === 'distance') existing.Distance = formatValue(row.value, 'cm');
            else if (key === 'Gempa') {
              if (param.includes('x')) existing.Tilt_X = row.value;
              if (param.includes('y')) existing.Tilt_Y = row.value;
              if (param.includes('z')) existing.Tilt_Z = row.value;
            } else if (key === 'Longsor') {
              if (param.includes('x')) existing.Inclination_X = row.value;
              if (param.includes('y')) existing.Inclination_Y = row.value;
              if (param.includes('z')) existing.Inclination_Z = row.value;
            } else if (key === 'Polusi') {
              if (param === 'co2') existing.CO2 = formatValue(row.value, 'ppm');
              if (param === 'tvoc') existing.TVOC = formatValue(row.value, 'IAQ');
            } else if (key === 'Angin') {
              if (param === 'wind_speed') existing.Speed = formatValue(row.value, 'm/s');
              if (param === 'temperature') existing.Temperature = formatValue(row.value, 'C');
            }
          } else if (tipe === 'air-limbah') {
            if (key === 'Leakage' && param === 'leakage_status') existing.Status = row.value === 'leak' ? '1' : '0';
            else if (key === 'Debit' && param === 'flow_rate') existing.FlowRate = formatValue(row.value, 'L/min');
            else if (key === 'Odor') {
              if (param.includes('nh3')) existing.NH3 = formatValue(row.value, 'ppm');
              if (param.includes('h2s')) existing.H2S = formatValue(row.value, 'ppm');
            } else if (key === 'Kualitas') {
              if (param === 'ph') existing.pH = row.value.toString().replace('.', ',');
              if (param === 'do') existing.COD = `${row.value} mg/L`;
              if (param === 'nh4') existing.NH4 = `${row.value} mg/L`;
              if (param === 'turbidity') existing.Turbidity = formatValue(row.value, 'NTU');
            } else {
              const keyName = row.parameter.charAt(0).toUpperCase() + row.parameter.slice(1);
              existing[keyName] = formatValue(row.value, row.unit);
            }
          } else if (tipe === 'sampah') {
            const field = row.parameter.toLowerCase();
            if (field === 'distance') existing.Distance = formatValue(row.value, 'cm');
            if (field === 'burn_detection') existing.BurnAlarm = row.value === 'true' ? '1' : '0';
            if (field === 'tilt_status') existing.Tilt = row.value === 'true' ? '1' : '0';
            if (field === 'temperature') existing.Temperature = formatValue(row.value, 'C');
            if (field === 'battery') existing.Battery = formatValue(row.value, row.unit);
          }

          if (param === 'battery') existing.Battery = formatValue(row.value, row.unit);
        }
      }
    }

    for (const key in grouped) {
      grouped[key]._Count = `${grouped[key].Sensor.length}`;
    }

    res.json({
      BGC_Response: {
        Status: {
          Message: tipe === 'kebencanaan' ? 'Alarm Kebencanaan dan Pemberitahuan Massal'
                  : tipe === 'air-limbah' ? 'Sistem Pengelolaan Air Limbah'
                  : 'Sistem Pengelolaan Sampah',
          Kawasan: `Rusun ASN1 ${kawasan.charAt(0).toUpperCase()}${kawasan.slice(1).toLowerCase()} Residence`,
          _ErrorCode: "0",
          _TimeStamp: new Date().toISOString().slice(0, 19)
        },
        Element: grouped
      }
    });
  } catch (err) {
    console.error("❌ Error GET /api/sensor/:kawasan/:tipe:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getSensorByKawasanAndType };
