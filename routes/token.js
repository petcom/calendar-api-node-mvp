const express = require('express');
const os = require('os');
const router = express.Router();

function getMacSuffix() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (!config.internal && config.mac && config.mac !== '00:00:00:00:00:00') {
        return config.mac.replace(/:/g, '').slice(-4).toUpperCase();
      }
    }
  }
  return 'XXXX';
}

router.get('/token-prefix', (_req, res) => {
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const macSuffix = getMacSuffix();
  res.send(`${dateStr}-${macSuffix}`);
});

module.exports = router;
