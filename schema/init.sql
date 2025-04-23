CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Table untuk data sensor
CREATE TABLE IF NOT EXISTS sensor_data (
    id SERIAL PRIMARY KEY,
    device_name TEXT,
    lokasi TEXT,
    sensor_type TEXT,
    parameter TEXT,
    value TEXT,
    unit TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Table untuk data alarm
CREATE TABLE IF NOT EXISTS alarm_event (
    id SERIAL PRIMARY KEY,
    sensor_id TEXT,
    lokasi TEXT,
    pesan TEXT,
    kategori TEXT,
    diteruskan_ke TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
