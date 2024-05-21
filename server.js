const TelegramBot = require('node-telegram-bot-api')
const connection = require('./database.js')
const express = require('express')
const fs = require('fs')
const cors = require('cors')

const app = express()

require("dotenv").config()

//const site = fetch("https://lighthearted-selkie-d27699.netlify.app/").then(res => console.log(res))

const getData = async ()=>{
    try{
        const response = await fetch('https://lighthearted-selkie-d27699.netlify.app/', {
            method: 'GET',
            headers: {'Content-Type': 'text/html'}
        })
        const data = await response.text()
        console.log(data)  
    }catch(err){
        console.log(err)
    }
    
}
//getData()

const data = {
    name: 'test',
    age: 25
}
console.log(data + " просто json")
const strData = JSON.stringify(data)
const parseJson = JSON.parse(strData)
console.log(parseJson)

app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))

app.post('/', (req, res) => {
    
    const data = res.body
    const dataStr = JSON.stringify(data)
    const dataParse = JSON.parse(dataStr)
    
    console.log(dataParse)
    console.log('Hello Node')
    res.send('Hello Node')
});

// app.get('/', (req, res) => {
//     fs.readFile('./public/index.html', {encoding: 'utf-8', flag: 'r'}, (err, data) => {
//         if(err) throw err
        
//     })

//     res.sendFile(__dirname+'/public/index.html');
// })


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Example app listening on http://localhost:${PORT}`)
})



const bot = new TelegramBot(process.env.API_KEY, {polling:{
    interval: 300,
    autoStart: true
}})

const userId = function(user_id){
    return `SELECT user_id FROM users WHERE user_id = ${user_id}`
}

//const resultData = []

bot.on("text", async msg => {
    if(msg.text.startsWith("/start")) {
        try{
            await bot.sendMessage(msg.chat.id, "Бот запустился!👋🏻")
            connection.connect(function(err){
                if(err){
                    console.log(err)
                }else{
                    connection.query(`SELECT user_id FROM users`, (err, result) => {
                        if(err){
                            console.log(err)
                        } else{
                            console.log(msg.from.id + ' айди пользователя')
                            console.log(result[0].user_id + ' айди пользователя, но из базы')
                            
                            if(result[0].user_id == msg.from.id){
                                console.log('Такой пользователь есть в базе и можно доставать инфу о нем')
                                try{
                                    const mainKeyboard = {
                                        reply_markup: JSON.stringify({
                                            one_time_keyboard: true,
                                            resize_keyboard: true,
                                            inline_keyboard: [
                                                    [{text: 'Личный кабинет', callback_data: 'Личный кабинет'}, {text: 'Баланс', callback_data: 'Баланс'}],
                                                    [{text: 'Афиша', callback_data: 'Афиша'}, {text: 'Партнеры', callback_data: 'Партнеры'}]
                                                ]
                                        })
                                    }
                                    bot.sendMessage(msg.chat.id, 'Главное меню', mainKeyboard)
                                }catch(error){
                                    console.log(error)
                                } 
                            }else{
                                console.log('Такого пользователя нет в базе, ему надо авторизоваться')
                                const authKeyboard = {
                                    reply_markup: JSON.stringify({
                                        one_time_keyboard: true,
                                        resize_keyboard: true,
                                        keyboard: [
                                            [{text: 'Поделиться номером', request_contact: true}]
                                        ]
                                    })
                                }
                            bot.sendMessage(msg.chat.id, 'Вам надо авторизоваться и поделиться своим номером', authKeyboard )
                        }  
                    }
                })
            }
            })

            if(msg.text.length > 6){
                const refId = msg.text.slice(7)
                await bot.sendMessage(msg.chat.id, `Вы зашли по ссылке пользователя с ID ${refId}`)
            }
            
        }catch(error){
            console.log(error)
        }
    }
    else if (msg.text === "/ref"){
        try{
            await bot.sendMessage(msg.chat.id, `${process.env.URL_TO_BOT}?start=${msg.from.id}`);
        }catch(error){
            console.log(error)
        }
    }
    else if(msg.text === '/help') {
        await bot.sendMessage(msg.chat.id, 'Раздел помощи Markdown\n\n*Жирный Текст*\n_Текст Курсивом_\n`Текст с Копированием`\n~Перечеркнутый текст~\n``` код ```\n||скрытый текст||\n[Гиперссылка](t.me)', {
            
            parse_mode: "MarkdownV2"
            
        });
    }
    else if(msg.text === '/pay'){
        
        const chatId = msg.chat.id;
        const title = 'Название счета';
        const description = 'Описание счета';
        const payload = 'Пользовательские данные';
        const providerToken = process.env.PROVIDER_TOKEN;
        const currency = 'RUB';
        const prices = [{ label: 'Товар', amount: 10000 }];

        bot.sendInvoice(chatId, title, description, payload, providerToken, currency, prices)
        .then((sentInvoice) => {
            console.log('Счет успешно отправлен:', sentInvoice);
        })
        .catch((error) => {
            console.error('Ошибка при отправке счета:', error);
        });
    }else if(msg.text === '/site'){
        bot.sendMessage(msg.chat.id, 'Это кнопка для перехода на сайт',{
            reply_markup: JSON.stringify({
                keyboard: [[
                    {text: 'Кликай', web_app: {url: 'https://lighthearted-selkie-d27699.netlify.app/'}}
                ]]
            })
        })
        bot.sendMessage(msg.chat.id, 'Это кнопка для перехода на сайт',{
            reply_markup: JSON.stringify({
                inline_keyboard: [[
                    {text: 'Кликай', web_app: {url: 'https://lighthearted-selkie-d27699.netlify.app/'}}
                ]]
            })
        })
    }
    else{
        console.log(msg.text)
        
    }
})



bot.on('web_app_data', (msg) => {
    const data = msg.web_app_data.data
    console.log(data)
    bot.sendMessage(msg.chat.id, `Ваш ник: ${data}`)
    bot.answerWebAppQuery(msg.id, { type: 'text', text: 'Ваш ник: ' + data })
})

bot.on('pre_checkout_query', (query)=> {
    bot.answerPreCheckoutQuery(query.id, true)
})

bot.on('successful_payment', (msg) => {
    bot.sendMessage(msg.chat.id, 'Оплата прошла успешно')
})

bot.on('callback_query', async msg => {
    if(msg.data == 'Личный кабинет'){
        try{
            connection.query(`SELECT * FROM users WHERE user_id = ${msg.from.id}`, (err, result) => {

                if(err){
                    console.log(err)
                }else{
                    console.log(result[0].id + ' айди пользователя в коллбэке из таблицы пользователей')

                    const sql = `SELECT * FROM profile WHERE userId = '${result[0].id}'`
                    connection.query(sql, (err, result) => {
                        if(err){
                            console.log(err)
                        }else{
                            console.log(result[0])
                            if(result[0] === undefined){
                                console.log('Нету данных этого пользователя в базе')
                            }
                            else{
                                let str = result[0].birthday.toString()
                                let date = new Date(str)
                                bot.editMessageText(`Имя: ${result[0].name}, Возраст: ${result[0].age}, Дата рождения: ${date.toLocaleDateString('ru')}`, { chat_id: msg.message.chat.id, message_id: msg.message.message_id, reply_markup: {
                                    inline_keyboard: [
                                        [{text: 'Редактировать', callback_data: 'Редактировать'}, {text: "Реферальная система", callback_data: "Реферальная система"}],
                                        [{text: 'Назад', callback_data: 'Назад | меню'}]
                                    ]
                                }})
                            }
                            
                        }})
                }
            })

        }catch(error){
            console.log(error)
        }
    }

    if(msg.data == 'Редактировать'){
        const namePromt = await bot.sendMessage(msg.message.chat.id, "Впишите ваше имя:", {
            reply_markup: {
                force_reply: true
                }
            })
        bot.onReplyToMessage(msg.message.chat.id, namePromt.message_id, async msg => {
            const login = msg.from.id
            const name = msg.text
            var log
            connection.query(`SELECT * FROM users WHERE user_id = ${login}`, (err, result) => {
                if(err){
                    console.log(err)
                }else{
                    log = result[0].id
                    console.log(log)
                }
            })
            const agePromt = await bot.sendMessage(msg.chat.id, 'Впишите ваш возраст:',{
                reply_markup: {
                    force_reply: true
                }
            })
            bot.onReplyToMessage(msg.chat.id, agePromt.message_id, async msg => {
                const age = msg.text
                const birthdayPromt = await bot.sendMessage(msg.chat.id, 'Впишите вашу дату рождения:',{
                    reply_markup: {
                        force_reply: true
                    }
                })
                bot.onReplyToMessage(msg.chat.id, birthdayPromt.message_id, async msg => {
                    const birthday = msg.text
                    const sql = `SELECT * FROM profile WHERE userId = ${log}`
                    connection.query(sql, (err, result) => {
                        if(err){
                            console.log(err)
                        }else{
                            if(log == result[0].userId){
                                const sql = `UPDATE profile SET name = '${name}', age = '${age}', birthday = '${birthday}' WHERE userId = ${log}` 
                                connection.query(sql, (err, result) => {
                                    if(err){
                                        console.log(err)
                                    }else{
                                        console.log(result)
                                    }
                                })
                            }else if(log == undefined){
                                const insert = `INSERT INTO profile (profile.name,  profile.age, profile.birthday, profile.userId) VALUES ('${name}','${age}','${birthday}', ${log})`
                                connection.query(insert, (err, res) => {
                                    if(err){
                                        console.log(err)
                                    }else{
                                        console.log(res)
                                    }
                                })
                            }
                        }
                    })
                })
            }) 
        })
    }

    if(msg.data == 'Баланс'){
        const messageId = msg.message.message_id;
        bot.editMessageText('Баланс', {chat_id: msg.message.chat.id, message_id: messageId, reply_markup: JSON.stringify({
            one_time_keyboard: true,
            resize_keyboard: true,
            inline_keyboard: [[{text: "Назад", callback_data: "Назад | баланс"}]]
        })}
    )
    }

    if(msg.data == 'Реферальная система'){
        bot.editMessageText(`Рефералы: сколько-то\nРеферальная ссылка:\n ${process.env.URL_TO_BOT}?start=${msg.from.id}`, {
            chat_id: msg.message.chat.id, 
            message_id: msg.message.message_id, 
            reply_markup: JSON.stringify({
                    inline_keyboard: 
                    [
                        [{text: "Назад", callback_data: "Назад | рефералка"}]
                    ]
                }
            )})
    }

    if(msg.data == 'Назад | баланс'){
        try{
            const messageId = msg.message.message_id;
            bot.editMessageText('Личный кабинет', {chat_id: msg.message.chat.id, message_id: messageId, reply_markup: JSON.stringify({
                one_time_keyboard: true,
                resize_keyboard: true,
                inline_keyboard: [
                        [{text: 'Личный кабинет', callback_data: 'Личный кабинет'}, {text: 'Баланс', callback_data: 'Баланс'}],
                        [{text: 'Афиша', callback_data: 'Афиша'}, {text: 'Партнеры', callback_data: 'Партнеры'}]
                    ]
            })});
        }catch(err){
            console.log(err)
        }
    }else if(msg.data == 'Назад | меню'){
        try{
            const messageId = msg.message.message_id;
            bot.editMessageText('Личный кабинет', {chat_id: msg.message.chat.id, message_id: messageId, reply_markup: JSON.stringify({
                one_time_keyboard: true,
                resize_keyboard: true,
                inline_keyboard: [
                        [{text: 'Личный кабинет', callback_data: 'Личный кабинет'}, {text: 'Баланс', callback_data: 'Баланс'}],
                        [{text: 'Афиша', callback_data: 'Афиша'}, {text: 'Партнеры', callback_data: 'Партнеры'}]
                    ]
            })});
        }catch(err){
            console.log(err)
        }
    }else if(msg.data == 'Назад | рефералка'){
        try{
            const messageId = msg.message.message_id;
            connection.query(`SELECT * FROM users WHERE user_id = ${msg.from.id}`, (err, result) => {
                var id
                if(err){
                    console.log(err)
                }else{
                    id = result[0].id
                    console.log(id)
                }
                const sql = `SELECT * FROM profile WHERE userId = '${id}'`
                connection.query(sql, (err, result) => {
                    if(err){
                        console.log(err)
                    }else{
                        if(result[0].name == undefined || result[0].age == undefined|| result[0].birthday == undefined){
                            console.log('Ошибка поиска данных в базе, их просто нет')
                        }else{
                            let str = result[0].birthday.toString()
                            let date = new Date(str)
                            bot.editMessageText(`Имя: ${result[0].name}, Возраст: ${result[0].age}, Дата рождения: ${date.toLocaleDateString('ru')}`, {chat_id: msg.message.chat.id, message_id: messageId, reply_markup: JSON.stringify({
                                one_time_keyboard: true,
                                resize_keyboard: true,
                                inline_keyboard: [
                                        [{text: 'Редактировать', callback_data: 'Редактировать'}, {text: 'Реферальная система', callback_data: 'Реферальная система'}],
                                        [{text: 'Назад', callback_data: 'Назад | меню'}]
                                    ]
                                })})
                        }
                    }

            })
        })
        }catch(err){
            console.log(err)
        }
    }
})
            

bot.on('contact', async contact => {
    try {
        const id = connection.query(userId(contact.from.id))
        if(id.options.values == undefined){
            const sql = `INSERT INTO users (number,first_name,user_id) VALUES (${contact.contact.phone_number},'${contact.contact.first_name}',${contact.contact.user_id})`
            connection.query(sql, (err, result) => {
                if(err){
                    console.log(err)
                }else{
                    console.log(result)
                }
            })
        }else{
            bot.sendMessage(contact.chat.id, 'Ваш номер уже есть в базе.')
        }
    }catch(error){
        console.log(error)
    }
})

// bot.on('web_app_data', async webMsg => {
//     console.log(webMsg)
//     console.log(webMsg.web_app_data.data + ' то что мы передали в бота')
// })

const commands = [
    {
        command: "start",
        description: "Запуск бота"
    },
    {
        command: "ref",
        description: "Реферальная ссылка"
    },
    {
        command: "help",
        description: "Раздел помощи"
    }
]

bot.setMyCommands(commands)

// bot.on("text", async msg => {
//     if(msg.text == '/id' && authenticate_users(msg.from.id)){
//         bot.sendMessage(msg.chat.id, 'Your ID: ' + msg.from.id, keyboard)    
//     } else {
//         bot.sendMessage(msg.chat.id, 'Unauthorized User', keyboard)    
//     }
// })


// }else if(msg.text == "/contact"){
    //     if(msg.contact.user_id == msg.from.id){
        
        //     }
        
        // bot.on("text", async msg => {
            //     try {
                //         const msgWaitAsync = await bot.sendMessage(msg.chat.id, "Бот генерирует ответ...")
                //         setTimeout(async ()=> {
                    //             bot.deleteMessage(msgWaitAsync.chat.id, msgWaitAsync.message_id)
                    //             bot.sendMessage(msg.chat.id, msg.text)
                    
                    //         }, 5000)
//     }
//     catch(error){
//         console.log(error)
//     }
// })

// bot.on("text", async msg => {

// })
