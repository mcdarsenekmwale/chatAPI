'use strict'

var db_config  = require('../utils/config'),
    q          = require('q'),
    pool       = require('pg'),
    run        = require('debug')('connect:run');

var db_connection = new pool.Client({
  user: db_config.DB_USER,
  host: db_config.DB_HOST,
  database: db_config.DB_NAME,
  password: db_config.DB_PASSWORD,
  port: db_config.DB_PORT,
});


var def = q.defer();
db_connection.connect((err) => {
    if (err) {
        throw err;
        def.reject();
    }
    def.resolve(db_connection);
    run('Connected established!');

    def.promise;
});


// db_connection.end((err) => {
//     if(err) throw err;
// });

// const { Pool } = require('pg')
// const isProduction = process.env.NODE_ENV === 'production'

// const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`

// const db_connection = new Pool({
//   connectionString: isProduction ? process.env.DATABASE_URL : connectionString
//   //ssl: isProduction,
// })
module.exports = db_connection;