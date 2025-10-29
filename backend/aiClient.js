const axios = require("axios");
const ai = axios.create({
  baseURL: process.env.AI_SERVICE_URL || "http://127.0.0.1:8000",
  timeout: 900000,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  decompress: true,
  validateStatus: () => true
});
module.exports = ai;

