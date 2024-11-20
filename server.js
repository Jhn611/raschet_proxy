const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const API_TOKEN = 't.OqqpSBrV7ymA93LZsizfGdefgMpONaHlXAnh1XghPiILSM8ZzzrMPQ7xbVqgGSEMOekNHNcF5L07AzOY06V8yw';  // Ваш токен от Tinkoff API
const BASE_URL = 'https://invest-public-api.tinkoff.ru/rest/tinkoff.public.invest.api.contract.v1.InstrumentsService/BondBy';

app.use(cors());  // Разрешить запросы с любых доменов

// Прокси маршрут для получения информации по тикеру
app.get('/api/get-bond-info', async (req, res) => {
    
    console.log('Получен запрос на /api/get-bond-info');

    const { ticker } = req.query;  // Получаем тикер из параметров запроса

    if (!ticker) {
        return res.status(400).json({ error: 'Тикер обязателен' });
    }

    try {
        // Делаем запрос к Tinkoff API
        const response = await axios.get(`${BASE_URL}`, {
            headers: {
                Authorization: `Bearer ${API_TOKEN}`,
            },
            params: { idType: "INSTRUMENT_ID_TYPE_TICKER",
                        classCode: "TQCB",
                        id: ticker },
        });
        
        // Ищем облигацию среди полученных инструментов
        const bond = response.data.instruments?.find((inst) => inst.instrumentType === 'Bond');

        if (!bond) {
            return res.status(404).json({ message: 'Облигация не найдена' });
        }

        return res.json(bond);  // Отправляем информацию об облигации
    } catch (error) {
        console.error('Ошибка при запросе к Tinkoff API:', error.message);
        return res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Прокси-сервер запущен на порту ${PORT}`);
});
