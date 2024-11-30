const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const API_TOKEN = 't.OqqpSBrV7ymA93LZsizfGdefgMpONaHlXAnh1XghPiILSM8ZzzrMPQ7xbVqgGSEMOekNHNcF5L07AzOY06V8yw';
const BASE_URL = 'https://invest-public-api.tinkoff.ru/rest';

const corsOptions = {
  origin: '*', // Разрешить запросы с любых источников
  methods: ['GET', 'POST'], // Разрешённые HTTP-методы
  allowedHeaders: ['Content-Type', 'Authorization'], // Разрешённые заголовки
};

app.use(cors(corsOptions));
//app.use(cors());  // Разрешить запросы с любых доменов

app.get('/api', async (req, res) => {
  console.log('Получен запрос на /api');
  return "Сервер доступен!";
});

// Прокси маршрут для получения информации по тикеру
app.get('/api/get-bond-info', async (req, res) => {
    const URL = '/tinkoff.public.invest.api.contract.v1.InstrumentsService/BondBy';
    
    console.log('Получен запрос на /api/get-bond-info');

    const { ticker } = req.query;  // Получаем тикер из параметров запроса
    console.log(ticker);
    if (!ticker) {
        return res.status(400).json({ error: 'Тикер обязателен' });
    }
    let classCode = "TQCB";
    if (ticker.startsWith("RU")) {
      classCode = "TQCB";
    }else{
      classCode = "TQOB";
    }
    
    const data = {
        idType: "INSTRUMENT_ID_TYPE_TICKER",
        classCode: classCode,
        id: ticker
      };
      
      const config = {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      };
      
      axios.post(BASE_URL + URL, data, config)
        .then(response => {
          console.log('success!', response.data);
          return res.json(response.data);
        })
        .catch(error => {
          console.error('Ошибка при запросе:', error.message);
          res.status(error.response?.status || 500).json({
            error: error.response?.data || 'Ошибка при запросе к Tinkoff API',
          });
        });
});

app.get('/api/get-bond-coupon', async (req, res) => {
  const URL = '/tinkoff.public.invest.api.contract.v1.InstrumentsService/GetBondCoupons';
  console.log('Получен запрос на /api/get-bond-coupon');

  const { figi, from, to } = req.query;

    
  if (!figi || !from || !to) {
      return res.status(400).json({ error: 'Параметры figi, from и to обязательны' });
  }

  const data = {
      figi: figi,
      from: from,
      to: to,
      instrumentId: figi
    };
    
    const config = {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    axios.post(BASE_URL + URL, data, config)
      .then(response => {
        console.log('success!', response.data);
        return res.json(response.data);
      })
      .catch(error => {
        console.error('Ошибка при запросе:', error.message);
        res.status(error.response?.status || 500).json({
          error: error.response?.data || 'Ошибка при запросе к Tinkoff API',
        });
      });
});

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Прокси-сервер запущен на порту ${PORT}`);
});
