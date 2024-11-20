const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Токен для доступа к Tinkoff API
const API_TOKEN = 't.OqqpSBrV7ymA93LZsizfGdefgMpONaHlXAnh1XghPiILSM8ZzzrMPQ7xbVqgGSEMOekNHNcF5L07AzOY06V8yw'; // Укажите свой токен здесь
const BASE_URL = 'https://invest-public-api.tinkoff.ru/rest';

app.use(cors()); // Разрешить запросы с любых доменов

// Прокси маршрут для работы с Tinkoff REST API
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

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Прокси-сервер запущен на порту ${PORT}`);
});
