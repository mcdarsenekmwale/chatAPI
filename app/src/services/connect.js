'use strict'

var q          = require('q'),
    pool       = require('pg'),
    run        = require('debug')('connect:run');

var db_connection = new pool.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


var def = q.defer();
db_connection.connect((err) => {
    if (err) {
        def.reject(err);
        console.error(err)
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