const TYPES = ['$слово', '$буква', '$время', '$игрок', '$число'];
const Utils = require('./utils');
const dbModel = require('./dbModel');

class Field {
    constructor(id, name, type, sec, value, author, _id, date) {
        this._id = _id || null;
        this.skID = id;
        this.name = name || null;
        this.type = type || null;
        this.sec = sec || null;
        this.value = value || null;
        this.author = author || null;
        this.date = date || null;
    }

    async validateAndSave(text) {
        let startName = text.indexOf('_'),
            endName = text.indexOf(':');
        
        if (startName!==-1 && endName!==-1) {
            this.validateName(text.slice(startName, endName));
        }
        else 
            throw new Error('Поле должно начинаться со знака \'_\' и заканчиваться \':\''); 

        let startType = text.indexOf('$'),
            endType = text.indexOf('{');
        
        if (startType!==-1 && endType!==-1) {
            this.validateType(text.slice(startType, endType));
        }
        else 
            throw new Error('Тип должен начинаться со знака \'$\' и заканчиваться \'{\''); 

        let startSec = text.indexOf('{'),
            endSec = text.indexOf('}');
        
        if (startSec!==-1 && endSec!==-1) {
            await this.validateSec(text.slice(startSec+1, endSec));
        }
        else 
            throw new Error('Тип должен начинаться со знака \'$\' и заканчиваться \'{\''); 

        return (await this.updateDB());
    }

    validateName(name) {
        let regxp = new RegExp(/_[а-яА-ЯёЁ0-9]/);
        if (!regxp.test(name))
            throw new Error('Поле должно состоять только из кириллицы и цифр');
        else
            this.name = name;
    }

    validateType(type) {
        let flag = false;
        for (let i=0; i<TYPES.length; i++) {
            if (TYPES[i] == type) {
                flag = true;
                break;
            }
        }

        if (flag) {
            this.type = type;
        }
        else
            throw new Error(`Некорректный тип данных \"${type}\"`);
    }
    async validateSec(sec) {
        let subAuthor = sec.indexOf('^АВТОР(');
        if (subAuthor !== -1) {
            let subFieldName = sec.slice(subAuthor+6, sec.length),
                subField = await Field.getFieldByName(this.skID, subFieldName);
            if (!subField)
                throw new Error('Неудалось установить уровень доступа через ^АВТОР, не найдено поле с названием ' + subFieldName);
            else 
                this.sec = subField;
        } else  {
            if (sec == 'ВСЕ' || await Utils.hasLoginOrLic(sec))
                this.sec = sec;
            else {
                throw new Error('Некорректный уровень доступа. Нет такого логина или лицензии');
            }     
        } 
    }


    static async canWrite(author, sec) {
        let res = false;
        
        if (author === sec || sec === 'ВСЕ') {
            res = true;
        } else {
            //запрос к API, соответсвует ли author лицензии sec сейчас
            //если да - true;
            //заглушка
            res = await Utils.compare(author, sec);
        }

        return res;
    }

    async callToWrite(author, value) {
        if (this.value) {
            throw new Error(`Данное поле уже заполнено: ${this.value.data} (${this.value.author} at ${this.value.date})`);
        } else {
            let accept = await Field.canWrite(author, this.sec);
            if (accept) {
                let err = 0;
                this.value = {};
                this.author = author;
                this.date = new Date();

                if ((this.type === '$слово' || this.type === '$буква' || this.type === '$игрок') && value)
                    this.value = value;
                else
                    ++err;

                if (this.type === '$число' && isNumber(value)) 
                    this.value = value;
                else
                    ++err;

                if (this.type === '$время')
                    this.value = await Utils.getTimeNow();
                else
                    ++err;

                if (err === 3)
                    throw new Error('некорректный тип');

                await this.updateDB();
            }
            else 
                throw new Error('У Вас не достаточно прав для записи в данное поле');
        }
    }

    static async getAllFieldsByContract(id) {
        let contr = await dbModel.find({_id: id}, 'contracts');
        return contr.fields;
    }

    static async getFieldByName(contractID, field) {
        return (await dbModel.findOne({skID: contractID, name: field}, 'fields'));
    }

    async updateDB() {
        return await dbModel.save(this, 'fields');
    }
}

exports.Field = Field;