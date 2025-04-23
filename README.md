# Bangunan Gedung Cerdas (BGC) Middleware

Middleware ini digunakan sebagai penghubung antara sistem IoT LoRaWAN (via ChirpStack), database PostgreSQL, dan sistem BMS/SCADA untuk monitoring dan alarm pada sistem Bangunan Gedung Cerdas (BGC).

## Fitur Utama
- Terima data sensor via MQTT dari ChirpStack.
- Simpan data ke PostgreSQL.
- Deteksi alarm berdasarkan threshold.
- Kirim alarm via HTTP POST ke sistem BMS.
- Endpoint REST API untuk ambil data sensor per kawasan dan tipe sistem.
- Auto reconnect, retry logic, dan healthcheck endpoint.

## Struktur Folder
```
middleware/
├── controllers/         # Logic API (per tipe sensor)
├── routes/              # Routing API
├── log/                 # Log file folder
├── index.js             # Main app
├── Dockerfile           # Docker build config
├── .env                 # Konfigurasi environment
├── package.json         # Dependency list
├── docker-compose.yml   # Compose file for full stack
```

## Teknologi Digunakan
- Node.js (Express.js, MQTT.js, pg)
- PostgreSQL
- ChirpStack MQTT broker
- Docker & Docker Compose

## Setup di Server Baru
### 1. Clone Repository
```bash
git clone https://github.com/elsyanades/bgc-middleware.git
cd bgc-middleware
```

### 2. Isi File `.env`
Contoh isi:
```
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=smartbuilding
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password123
MQTT_HOST=mqtt://localhost:1883
BMS_ENDPOINT=http://192.168.1.100:4000/alarm
```

### 3. Jalankan dengan Docker Compose
```bash
docker compose up -d --build
```

### 4. Cek Endpoint API
- Healthcheck: `GET /healthz`
- Data sensor: `GET /api/sensor/:kawasan/:tipe`

Contoh:
```bash
curl http://localhost:3000/api/sensor/west/sampah
```

## Tipe Sistem & Sensor
- **kebencanaan**: Gempa, Longsor, Polusi, Angin, Banjir
- **air-limbah**: Odor, Kualitas, Debit, Leakage
- **sampah**: Sensor tong indoor & outdoor

## Auto Restart
Docker Compose akan auto-restart jika container mati (kecuali jika server shutdown manual).

## Catatan
- Jika server di-reboot, sistem akan otomatis aktif kembali karena policy `restart: always`.
- Disarankan install `docker` dan `docker-compose-plugin` via repository resmi Ubuntu.

---

Created with ❤️ by Elsyana for BGC Project.
