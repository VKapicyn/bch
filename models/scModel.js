//Utils;
const Field = require('./fieldModel').Field;
const dbModel = require('./dbModel');
const Utils = require('./utils');
const Result = require('./resultModel').Result;

class SmartContract{
   constructor(id, text, author, status, resBalance, fields, vars, results, round) {
      this._id = id;
      this.round = round || 1;
      this.text = text || null;
      this.author = author || '';
      this.status = status || 0; //0 - onlyText, 1 - parsed, 2 - realised
      this.resBalance = resBalance || 0;
      this.fields = fields || []; 
      this.vars = vars || [];
      this.results = results || [];
   }

   async updateDB(){
      return await dbModel.save(this, 'contracts');
   }

   //TODO: Проверка на повторение имен
   async validateAndSave() {
      if (this.text) {
         this._id = await this.updateDB();
         try {
            let cleanText = Utils.clean(this.text);

            for (let i=0; i<cleanText.fieldsArray.length; i++) {
               let _field = new Field(this._id);
               await _field.validateAndSave(cleanText.fieldsArray[i]);
               this.fields.push(_field._id);
            }
               
            console.log('провалидировал поля')
            //await Data.validateAndSave(cleanText.dataArray);
            
            for (let i=0; i<cleanText.resArray.length; i++) {
               let _result = new Result(this._id);
               let newRes = await _result.validateAndSave(cleanText.resArray[i]);
               this.results.push(_result._id);
            }

            this.status = 1;
            await this.updateDB();
         } catch(e) {
            //удалить
            //по _id
            console.log(e)
            throw e;
         }
      }
      else
         throw new Error('Отсутствуют поля');
   }
    
   static async getResult(sc) {
      //find sc
      let results = [];
      for (let i=0; i<sc.results.length; i++) {
         console.log(sc.results[i])
         try {
            sc.results[i] = await dbModel.findOne(sc.results[i], 'results');

            let result = new Result(
               sc._id, 
               sc.results[i].text, 
               sc.results[i].stackTrace, 
               sc.results[i].fields, 
               sc.results[i].balance, 
               sc.results[i].user, 
               sc.results[i]._id);
            results.push(await result.callResult());
         }
         catch(e) {
            console.log(e)
            continue;
         }
      }
      return results;
   }
}

exports.SmartContract = SmartContract;