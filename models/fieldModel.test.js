const Field = require('./fieldModel').Field;
const testData = require('../testData.js');
const assert = require("assert");

describe('Валидность полей', function(){
    it('Все валидное', async () => {
        let _field = new Field(1);
        await _field.validateAndSave(testData.fullFields[0]);
        //console.log(_field)
    })
    it('Некорректный тип', async function(){
        let _field = new Field(1);
        await _field.validateAndSave(testData.errFields[0]);
        //console.log(_field)
    })
    it('Некорректный уровень доступа', async function(){
        let _field = new Field(1);
        await _field.validateAndSave(testData.errFields[1]);
        //console.log(_field)
    })
})