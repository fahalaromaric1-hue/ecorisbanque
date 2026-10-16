module.exports = process.env.DATABASE_URL ? require('./pg-store') : require('./sqlite-store');
