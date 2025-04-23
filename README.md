# 📘 BGC Middleware - Dokumentasi Lengkap

Middleware ini adalah bagian dari sistem Bangunan Gedung Cerdas (BGC) yang menghubungkan ChirpStack dengan Database PostgreSQL dan Server BMS menggunakan Docker. Sistem ini akan terus berjalan di background dan menyimpan data sensor, serta mendeteksi alarm secara real-time.

---

## 🛠️ 1. Persiapan Awal Server

### OS: Ubuntu 22.04+ / 24.04

### Langkah Awal Konfigurasi:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker $USER
newgrp docker
```

### Install Git:
```bash
sudo apt install git -y
```

---

## 🧾 2. Clone Repository

```bash
git clone https://github.com/elsyanades/bgc-middleware.git
cd bgc-middleware
```

---

## ⚙️ 3. Struktur Folder

```
bgc-middleware/
├── bms-dummy/             # Server dummy penerima alarm
├── chirpstack-config/     # Konfigurasi decoder ChirpStack
├── dummy-sensor/          # Simulasi kirim data uplink sensor
├── middleware/            # Folder utama middleware
│   ├── controllers/       # Logic per kategori sensor
│   ├── routes/            # Routing API
│   ├── index.js           # Entry point middleware
│   ├── .env               # Konfigurasi DB dan port
├── mosquitto/             # Konfigurasi MQTT Broker
├── schema/                # Struktur database PostgreSQL
├── docker-compose.yml     # Docker orchestration file
```

---

## 📦 4. Isi File `.env`

```env
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=smartbuilding
MQTT_BROKER_URL=mqtt://mosquitto:1883
PORT=3000
BMS_ALERT_URL=http://bms-dummy:4000/alert
```

---

## 🐳 5. Jalankan Semua Layanan

```bash
docker compose up -d --build
```

Untuk menghentikan:
```bash
docker compose down
```

---

## 🧪 6. Endpoint API

### GET Sensor per Kawasan dan Tipe:
```
GET /api/sensor/:kawasan/:tipe
```
Contoh:
```
GET /api/sensor/west/kebencanaan
GET /api/sensor/precint/sampah
```

Response JSON:
```json
{
  "BGC_Response": {
    "Status": {
      "Message": "Sistem Pengelolaan Sampah",
      "Kawasan": "Rusun ASN1 West Residence",
      "_ErrorCode": "0",
      "_TimeStamp": "2025-04-23T06:40:24"
    },
    "Element": {
      "Sensor": {
        "Sensor": [
          {
            "Location": "Tower A-GF-Green",
            "Battery": "90%",
            "Distance": "52.83cm",
            "Temperature": "29.52 C",
            "BurnAlarm": "0",
            "Tilt": "0",
            "_id": "1"
          }
        ],
        "_Count": "1"
      }
    }
  }
}
```

---

## 🚨 7. Alarm BMS Dummy

Middleware akan otomatis mengirim alarm via POST ke `BMS_ALERT_URL` jika parameter sensor melebihi ambang batas (threshold).

Contoh payload alarm:
```json
{
  "device": "WEST/EM320-TILT #BM",
  "sensor": "Tilt_X",
  "value": "8.4",
  "threshold": "5",
  "unit": "°",
  "timestamp": "2025-04-23T06:00:00"
}
```

---

## 🔁 8. Auto Restart Service

Sudah include dalam Docker Compose `restart: always`, jadi jika server reboot, service akan otomatis menyala kembali.

---

## 🔐 9. Akses GitHub

Jika ingin push ke GitHub dari server:
```bash
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
git remote add origin https://github.com/elsyanades/bgc-middleware.git
git branch -M main
git push -u origin main
```

Gunakan **personal access token** sebagai password saat diminta login GitHub.

---

## 📚 10. Catatan Akhir

- Middleware ini menggunakan MQTT, PostgreSQL, dan Express.js
- Struktur database otomatis dibuat oleh skrip
- Endpoint responsif berdasarkan `kategoriMapping`
- Bisa digunakan untuk sistem real-time IoT skala besar.

---

📩 Hubungi: elsyana.saltanu@gmail.com untuk kolaborasi atau pertanyaan teknis.

---

🎉 **Selamat menggunakan middleware BGC!**

