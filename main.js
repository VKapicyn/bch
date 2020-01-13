const TelegramBot = require('node-telegram-bot-api');
const mainBot = new TelegramBot(require('./config').mainToken, {polling: true});
const clientBot = new TelegramBot(require('./config').clientToken, {polling: true});

var url = require('./config').url;
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var db = mongoose.connect(url)//конектимсся к БД
var conn = mongoose.connection;


//var checkMenu = require('../models/menu.js').checkMenu;
//var admin = require('../controllers/admin.js');
const userModel = require('./models/userModel.js').userModel;

const mainMenu = {
    reply_markup: JSON.stringify({
        "keyboard": [/*[portfels.name, quotations.name], [news.name, alerts.name], [settings.name, '☎ О нас']*/], 
        "one_time_keyboard": true,
        "force_replay": true,
        "resize_keyboard": true
    })
}

const clientMenu = {
    reply_markup: JSON.stringify({
        "keyboard": [['Создать контракт', 'Баланс контракта'],['Записать в контракт', 'Читать контракт'],['Сменить пользователя']], 
        "one_time_keyboard": true,
        "force_replay": true,
        "resize_keyboard": true
    })
}

clientBot.on('message', function (msg) {
    clientOnStart(msg)
})

clientBot.on("polling_error", (err) => console.log(err));

function clientOnStart(msg){
    userModel.findOne({userId: msg.from.id}).then((user)=>{
        console.log(msg)
        if (true){//user != null){
            clientBot.sendMessage(msg.chat.id, msg.chat.first_name+', что будем делать?', clientMenu);
            /*if (checkMenu(msg, user, portfels)){
                portfels.portfelOnStart(msg, user)
            }
            else if (msg.text == '☎ О нас'){
                bot.sendMessage(msg.chat.id, 'Спасибо Вам за использование нашего бота!\n\n'
                +'📩 @VKapicyn, @MrGrigoryan Мы всегда готовы услышать отзывы и предложения\n'
                +'🗂 В данном разделе Вы всегда сможете увидеть ссылки на все наши проекты.\n'
                +'⚙ Также, мы разрабатываем серию ботов по финансовой сфере и готовы услышать ваши идеи.\n'
                +'📅 А пока, у нас готовы следующие проеты:\n\n'
                +'📜 @iis_alor_bot - консультант по счетам ИИС');
            }
            else if (checkMenu(msg, user, admin)){
                if (user.admin)
                    require('../controllers/admin.js').OnStart(msg, user)
                else
                    bot.sendMessage(msg.chat.id, 'Нет доступа')
            }
            else {
                bot.sendMessage(msg.chat.id, user.userName + ', что будем делать?', mainMenu)
                user.lastMenu = "General"
                user.save();
            }  */
        }
	    else if (msg.text=='/auth'){
            bot.sendMessage(msg.chat.id, 'Введите логин');
        } else {
            bot.sendMessage(msg.chat.id, 'Вы впервые воспользовались нашим ботом. Для того что бы начать работу, необходимо авториизоваться, для этого введите /auth в чате.')
        }
    })
}