const express = require('express');
const router = express.Router();
const { getSensorByKawasanAndType } = require('../controllers/sensorController');

// INI YANG HARUS ADA
router.get('/:kawasan/:tipe', getSensorByKawasanAndType);

module.exports = router;
