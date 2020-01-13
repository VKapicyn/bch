const Utils = require('./utils');
const dbModel = require('./dbModel');
const tokenModel = require('./tokenModel');
const Field = require('./fieldModel').Field;
const operations = require('./operations');

class Result {
    constructor(id, text, stackTrace, fields, balance, user,_id) {
        this._id = _id || null;
        this.skID = id;
        this.text = text || null;
        this.stackTrace = stackTrace || {};
        this.fields = fields || [];
        this.balance = balance || 0;
        this.user = user || null;
    }

    async validateAndSave(text) {
        this.text = text;

        let user, methodsText, 
            startMethods = text.indexOf(':');
            
        if ( startMethods !== -1) {
            text = text.split('');
            user = text.slice(0, startMethods);
            await this.validateUser(user.join(''));

            methodsText = (text.slice(startMethods+1, text.length)).join('');
            this.getStackTrace(methodsText);
        } else
            throw new Error('Некорректное поле с результатами');

        return await this.updateDB();
    }

    async validateUser(sec) {
        let subAuthor = sec.indexOf('^АВТОР(');
        if (subAuthor !== -1) {
            let subFieldName = sec.slice(subAuthor+7, sec.length-1),
                subField = await Field.getFieldByName(this.skID, subFieldName);
            if (!subField)
                throw new Error('Неудалось установить пользователя через ^АВТОР, не найдено поле с названием ' + subFieldName);
            else 
                this.user = {fieldId: subField.name};
        } else  {
            if (await Utils.hasLogin(sec))
                this.user = sec;
            else {
                throw new Error('Некорректный уровень доступа. Нет такого логина. '+sec);
            }     
        } 
    }

    async getStackTrace(text) {
        this.stackTrace = tokenModel.getAST(text);
        this.fields = tokenModel.getFields(text);
    }

    async callResult() {
        let user = this.user.fieldId ? (await Field.getFieldByName(this.skID, this.user.fieldId)).author : this.user;
        let obj = {};
        let count = 0;
        for (let i=0; i<this.fields.length; i++) {
            //console.log(this.fields[i])
            let _field = await Field.getFieldByName(this.skID, this.fields[i]);
            //console.log(_field._id, this.skID, this.fields[i])
            obj[_field.name] = (_field.type=='$время'||_field.type=='$число') ? +_field.value : _field.value;
            if (_field.value || _field.value === 0)
                ++count;  
        }

        //проверяем, что есть все используемые поля
        if (count == this.fields.length && user)
            return {
                user, 
                balance: await operations.callStack(this.stackTrace, obj)
            };
        else
            return {user: null, balance: null};
    }

    async updateDB() {
        return await dbModel.save(this, 'results');
    }
}

exports.Result = Result;