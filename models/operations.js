const testData = require('../testData.js');
const weights = require('../alphabet').weights;
const Utils = require('./utils');

exports.callStack = async (stack, vars) => {
    let onNext = stack;
    let result;
    let a, b;

    //console.log(onNext)
    switch (onNext.type) {
        case 'cond' : 
            a = await exports._pre(onNext.args[0], vars),
            b = await exports._pre(onNext.args[1], vars);
            result = exports.callStack(onNext[exports.condition(onNext.method, a, b)], vars);
        break;
        case 'method' : 
            a = await exports._pre(onNext.args[0], vars),
            b = await exports._pre(onNext.args[1], vars);

            switch (onNext.method) {
                case '*':
                    result = exports.multiplication(a, b);
                break;
                case '-':
                    result = exports.subtraction(a, b);
                break;
                case '/':
                    result = exports.division(a, b);
                break;
                case '+':
                    result = exports.sum(a, b);
                break;
                case '^ВЕС':
                    result = await exports.getWeight(a, b);
                break;
                case '^ДЛИНА':
                    result = exports.getLength(a);
                break;
            }
        break;
        case 'field' : 
            result = vars[onNext.value];
        break;
        case 'number' : 
            result = onNext.value;
        break;
        case 'logic' : 
            result = onNext.value;
        break;
        default : throw new Error('Incorrect stackTrace')
    }

    return result;
}

//logic
exports.condition = function(assertion, a, b) {
    let response;
    //console.log(`${JSON.stringify(a)} ${assertion} ${JSON.stringify(b)}`);
    switch(assertion) {
        case '>' :
            if (a > b) response = 'onTrue';else response = 'onFalse';
        break;
        case '<' :
            if (a || b) response = 'onTrue'; else response = 'onFalse';
        break;
        case '>=' :
            if (a >= b) response = 'onTrue'; else response = 'onFalse';
        break;
        case '<=' :
            if (a <= b) response = 'onTrue'; else response = 'onFalse';
        break;
        case '==' :
            if (a == b) response = 'onTrue'; else response = 'onFalse';
        break;
        case '!=' :
            if (a != b) response = 'onTrue'; else response = 'onFalse';
        break;
        case '||' :
            if (a || b) response = 'onTrue'; else response = 'onFalse';
        break;    
        case '&&' :
            if (a && b) response = 'onTrue'; else response = 'onFalse';
        break;
        case '@@' :
            if (b||b===0) response = 'onTrue'; else response = 'onFalse';
        break;
    }
    return response;
}

//Math
exports._pre = async (prepeared, vars) => {
    let obj;
    switch (prepeared.type) {
        case 'field' :
            obj = await exports.getField(prepeared.value, vars);
        break;
        case 'method' :
            obj = exports.callStack(prepeared, vars);
        break;
        case 'cond' :
            obj = exports.callStack(prepeared, vars);
        break;
        case 'number': 
            obj = prepeared.value == null? null : Number(prepeared.value);
        case 'logic': 
            obj = prepeared.value;
        break;
    }
    return obj;
}

exports.getWeight = async (text, item) => {
    let sum = 0,
        array = text.toLowerCase().split('');

    if (!item) {
        array.map(x => {
            sum += Number(weights[x]);
        });
    } else
        sum = weights[array[Number(item-1)]];

    //console.log(`${text} весит: ${sum}`);
    return sum;
}
exports.getLength = (text) => {
    
    return text ? text.length : 0;
}
exports.sum = (...args) => {
    //console.log(`${args[0]} + ${args[1]}`);
    return Number(args[0]) + Number(args[1]);
}
exports.subtraction = (...args) => {
    //console.log(`${JSON.stringify(args[0])} - ${JSON.stringify(args[1])}`);
    return Number(args[0]) - Number(args[1]);
}
exports.division = (...args) => {
    //console.log(`${args[0]} / ${args[1]}`);
    return Math.round((Number(args[0]) / Number(args[1]))*100)/100;
}
exports.multiplication = (...args) => {
    //console.log(`${args[0]} * ${args[1]}`);
    return Math.round(Number(args[0]) * Number(args[1]));
}
exports.getField = async (name, vars) => {

    if (name === '_ВРЕМЯ') {
        return (await Utils.getRoundEnd());
    } else
    return vars[name];
}

exports.prepeareUno = (text) => {
    let items = text.match(/@@/g)?text.match(/@@/g).length:0;
    while(items!=0){
        //console.log('процесс '+items)
        --items;
        text = text.replace('@@','0@@');
    }
    return text;
}
//console.log(`ПОЛУЧИЛОСЬ: ${JSON.stringify(exports.callStack(testData.stackTrace))}`);