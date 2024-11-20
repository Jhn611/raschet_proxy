const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const axios = require('axios');

// Загрузка .proto файла
const PROTO_PATH = './tinkoff_api.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const tinkoffProto = grpc.loadPackageDefinition(packageDefinition).tinkoff;

// Создание gRPC сервер
const server = new grpc.Server();

// URL и токен для Tinkoff API
const API_URL = 'https://invest-public-api.tinkoff.ru/rest/market/search/by-ticker';
const API_TOKEN = 't.OqqpSBrV7ymA93LZsizfGdefgMpONaHlXAnh1XghPiILSM8ZzzrMPQ7xbVqgGSEMOekNHNcF5L07AzOY06V8yw';  // Укажите свой токен для API

// Реализация метода для получения информации об облигации
const getBondInfo = async (call, callback) => {
    const ticker = call.request.ticker;

    if (!ticker) {
        callback({
            code: grpc.status.INVALID_ARGUMENT,
            details: 'Тикер обязателен'
        });
        return;
    }

    try {
        // Выполняем запрос к Tinkoff API
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${API_TOKEN}`
            },
            params: { ticker: ticker }
        });

        const bond = response.data.instruments?.find(inst => inst.instrumentType === 'Bond');
        
        if (!bond) {
            callback({
                code: grpc.status.NOT_FOUND,
                details: 'Облигация не найдена'
            });
            return;
        }

        // Ответ с данными о облигации
        callback(null, {
            figi: bond.figi,
            ticker: bond.ticker,
            name: bond.name,
            instrument_type: bond.instrumentType,
            price: bond.price || 0,  // Если цена не указана, то 0
            currency: bond.currency || 'RUB'  // Если валюта не указана, то RUB
        });
    } catch (error) {
        console.error('Ошибка при запросе к Tinkoff API:', error.message);
        callback({
            code: grpc.status.INTERNAL,
            details: 'Ошибка при запросе к Tinkoff API'
        });
    }
};

// Добавление метода к gRPC серверу
server.addService(tinkoffProto.TinkoffApiService.service, { GetBondInfo: getBondInfo });

// Запуск сервера на порту 50051
server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
console.log('gRPC сервер запущен на порту 50051');
