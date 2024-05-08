const mysql = require('mysql2')
require('dotenv').config()

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "tgschema",
    password: process.env.PASSWORD_TO_ADMIN
  });


// connection.connect(function(err){
//   if (err) {
//     return console.error("Ошибка: " + err.message);
//   }
//   else{
//     console.log("Подключение к серверу MySQL успешно установлено");
//   }
// });


// connection.end(function(err) {
//   if (err) {
//     return console.log("Ошибка: " + err.message);
//   }
//   console.log("Подключение закрыто");
// });
  
module.exports = connection

