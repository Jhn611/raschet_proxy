const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const API_URL = 'https://invest-public-api.tinkoff.ru/rest/market/search/by-ticker';
const TOKEN = 't.OqqpSBrV7ymA93LZsizfGdefgMpONaHlXAnh1XghPiILSM8ZzzrMPQ7xbVqgGSEMOekNHNcF5L07AzOY06V8yw'; // Замените на ваш реальный токен

// Разрешаем запросы с любых доменов
app.use(cors());

// Маршрут для получения информации об облигации
app.get('/api/get-bond-info', async (req, res) => {
    const { ticker } = req.query;

    if (!ticker) {
        return res.status(400).json({ error: 'Тикер обязателен' });
    }

    try {
        // Отправляем запрос к Tinkoff API для получения данных об облигации
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
            },
            params: {
                ticker: ticker, // Тикер облигации
            },
        });

        const bond = response.data.instruments?.find((inst) => inst.instrumentType === 'Bond');

        if (!bond) {
            return res.status(404).json({ message: 'Облигация не найдена' });
        }

        return res.json(bond); // Отправляем информацию об облигации клиенту
    } catch (error) {
        console.error('Ошибка при запросе к Tinkoff API:', error.message);
        return res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Сервер работает на порту ${PORT}`);
});
