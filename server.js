const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const API_TOKEN = 't.OqqpSBrV7ymA93LZsizfGdefgMpONaHlXAnh1XghPiILSM8ZzzrMPQ7xbVqgGSEMOekNHNcF5L07AzOY06V8yw'; // Замените на ваш токен
const BASE_URL = 'https://api-invest.tinkoff.ru/openapi';

app.use(cors()); // Разрешить запросы с любых доменов
 
// Прокси маршрут
app.get('/api/:endpoint', async (req, res) => {
    const { endpoint } = req.params;
    const params = req.query;

    try {
        const response = await axios.get(`${BASE_URL}/${endpoint}`, {
            headers: { Authorization: `Bearer ${API_TOKEN}` },
            params,
        });
        res.json(response.data);
    } catch (error) {
        console.error('Ошибка в прокси:', error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Прокси-сервер запущен на порту ${PORT}`);
});
