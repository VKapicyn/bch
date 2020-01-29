const request = require('async-request');
const config = require('../config');

exports.logins = async () => {
    let _logins = await request(`${config.api}logins`, {
        method: 'GET', 
      })
    
    return JSON.parse(_logins.body);
}
exports.lics = async () => {
    let _lics = await request(`${config.api}lics`, {
        method: 'GET', 
      })
    return JSON.parse(_lics.body);
};

exports.compare = async (author, lic) => {
    let _comp = await request(`${config.api}lic/has`, {
        method: 'POST', 
        data: {
            lic,
            login: author
        }
      })
    return JSON.parse(_comp.body);
}

exports.getTimeNow = async () => {
    let time = await request(config.api + 'time/now', {
        method: 'GET', 
      })
    return Number(time.body);
}

exports.getRoundEnd = async () => {
    let time = await request(config.api + 'time/end', {
        method: 'GET', 
      })
    return Number(time.body);
}

exports.hasLogin = async (data) => {
   let logins = await exports.logins();
   let flag = false;
   for(let i=0; i<logins.length; i++) {
       if (logins[i] === data) {
           flag = true;
           break;
       }
   }
   
   return flag;
}

exports.hasLoginOrLic = async (data) => {
    let lics = await exports.lics();
    let logins = await exports.logins();
    let flag = false;
    for(let i=0; i<lics.length; i++) {
        if (lics[i] === data) {
            flag = true;
            break;
        }
    }
    if (flag) 
        return flag;

    for(let i=0; i<logins.length; i++) {
        if (logins[i] === data) {
            flag = true;
            break;
        }
    }
    
    return flag;
}

exports.clean = (text) => {
    let result = {};
 
    text = text.split('');
    for (let i=0; i<text.length; i++) {
       if (text[i] == ' ' ||
          text[i] == ' ' ||
          text[i] == '\n' ||
          text[i] == '\r' ||
          text[i] == '\t' ||
          text[i] == '\b' ||
          text[i] == '\f' ||
          text[i] == '\v'
       ) {
          text.splice(i, 1);
          --i;
       }
    }
    text = text.join('');
 
    let startPole = text.indexOf('КОНТРАКТ#'),
       startData = text.indexOf('ДАННЫЕ#'),
       startRes = text.indexOf('РЕЗУЛЬТАТ#');
 
    if (startPole !== -1 && startRes !== -1) {
       if (startData !== -1) {
          result.fieldsArray = text.slice(startPole, startData);
          result.fieldsArray = result.fieldsArray.split(';');
          result.fieldsArray[0] = result.fieldsArray[0].replace('КОНТРАКТ#', '');
          result.fieldsArray.splice(result.fieldsArray.length-1, 1);
 
          result.dataArray = text.slice(startData, startRes);
          result.dataArray = result.dataArray.split(';');
          result.dataArray[0] = result.dataArray[0].replace('ДАННЫЕ#', '');
          result.dataArray.splice(result.dataArray.length-1, 1);
 
          result.resArray = text.slice(startRes, text.length);
          result.resArray = result.resArray.split(';');
          result.resArray[0] = result.resArray[0].replace('РЕЗУЛЬТАТ#', '');
          result.resArray.splice(result.resArray.length-1, 1); 
       } else {
          result.fieldsArray = text.slice(startPole, startRes);
          result.fieldsArray = result.fieldsArray.split(';');
          result.fieldsArray[0] = result.fieldsArray[0].replace('КОНТРАКТ#', '');
          result.fieldsArray.splice(result.fieldsArray.length-1, 1);
 
          result.dataArray = [];
 
          result.resArray = text.slice(startRes, text.length);
          result.resArray = result.resArray.split(';');
          result.resArray[0] = result.resArray[0].replace('РЕЗУЛЬТАТ#', ''); 
          result.resArray.splice(result.resArray.length-1, 1);
       }
    } else
       throw new Error('Не удалось обнаружить КОНТРАКТ# или РЕУЗЛЬТАТ#');
 
    return result;
 }

 exports.isNumber = (text) => {
    if (text.length <= 6) {
        items = text.split('');
        let dot = 0;
        for (let i=0; i<items.length; i++) {
            if (dot > 1)
                return false;
            if (
                (+items[i] == 0) || 
                (+items[i] == 1) ||
                (+items[i] == 2) ||
                (+items[i] == 3) ||
                (+items[i] == 4) ||
                (+items[i] == 5) ||
                (+items[i] == 6) ||
                (+items[i] == 7) ||
                (+items[i] == 8) ||
                (+items[i] == 9) ||
                (items[i] == '.' && i>0)
            ) {
                if (items[i] == '.' && i>0)
                    ++dot;
            } else {
                return false;
            }
        }
    }
    else false;

    return true
 }