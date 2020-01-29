const sk = require('./scModel').SmartContract;
const Field = require('./fieldModel').Field;
const dbModel = require('./dbModel');
const ObjectId = require('mongodb').ObjectId;
const testData = require('../testData.js');
const assert = require("assert");

/*describe('Модель контракта, распознает КОНТРАКТ, ДАННЫЕ, РЕЗУЛЬТАТ', function(){
    it('Тест с корректными полями', async function(){
        let contr = new sk(1, testData.fullContact,'A1');
        contr.validateAndSave();
    })
    it('Тест без КОНТРАКТ', async function(){
        let contr = new sk(1, testData.contacrtErr1,'A1');
        await contr.validateAndSave()
    })
    it('Тест без ДАННЫХ', async function(){
        let contr = new sk(1, testData.contacrtErr2,'A1');
        await contr.validateAndSave();
    })
    it('Тест без РЕЗУЛЬТАТ', async function(){
        let contr = new sk(1, testData.contacrtErr3,'A1');
        await contr.validateAndSave();
    })
})*/

/*describe('Базовые', function(){
    it('Что сохраняется', async function(){

    });
});*/
(async() => {
    //let contr = new sk(null, testData.liteFullTest,'A1');
    //await contr.validateAndSave();

    //let contr = await dbModel.findOne({},'contracts')

    /*let dbField = await dbModel.findOne({},'fields')
    let field = new Field(
        dbField.skID, 
        dbField.name, 
        dbField.type, 
        dbField.sec,
        dbField.value, 
        dbField.author, 
        dbField._id
    )
    console.log(
        await field.callToWrite('A1','вода')
        )*/
    //console.log(await sk.getResult(contr))
})();

/**
 * FIXME:
 * 
 * 1)
 * 2) 
 * 3) сделать конструктор из БД в объкт
 * 4) 
 * 5) дописать и api в игре
 * 6) протестить api блокчейна
 * 
 * TODO:
 * 0) равзернуть игру
 * 1) записывать операции в БД игры как блокчейн
 * 2) заверстать интерфейс
 * 3) сделать выплаты по контрактам (автоматом по итогу раунда) или по вызову функции
 * 4) (3) оплата на контракты
 * 5) Описание языка на wiki
 * 
 * 6) деплой и тест-нет?
 */

/*
КОНТРАКТ#
_слово1: $слово {РС};
_слово2: $слово {Y02};
_время1: $время {Y02};
РЕЗУЛЬТАТ#
Y02: ^УСЛ(_время1>10?^УСЛ(0>2?(^УСЛ(3==0?5|(^ВЕС(_слово1)*1.5))|1)|(^ВЕС(_слово2)*2));
^АВТОР(_слово2): ^УСЛ(^ВЕС(_слово1)>^ВЕС(_слово2)?(^ВЕС(_слово1)+^ВЕС(_слово2))|(^ВЕС(_слово2)+3));
*/