const TokenizeThis = require('tokenize-this');
const testData = require('../testData.js');
const isStrNumber = require('is-string-a-number');

var tokenizer = new TokenizeThis();
//var str = '(((2*((3+4)-(1+2)))-_получилПродукт)+(^ВЕС(_чай,1)/^ВЕС(_чай,3)))';
//var str = '^УСЛ(1>2?(7+3),(9+2))';
//var str =  '^УСЛ(1>(2+4)?7:(9+3))';
// '^УСЛ((1+8)>(2+4)?(7+1):(9+3))';
//let str = `(((2-1)+(1+2))*3)`
//let str = `^УСЛ(0>1?^УСЛ(3<4?5|6)|^УСЛ(0==1?9|10))`;
//let str = `^УСЛ(0@@_тест1?5|10)`
//let str = `^УСЛ(_время1>_ВРЕМЯ?^УСЛ(0>2?(^ВЕС(_слово1)*1.5)|1)|(^ВЕС(_слово2)*2))`
//'(^УСЛ(((1+8)>2)?(7+1),11)-(((2*((3+4)-(1+2)))-_получилПродукт)+(^ВЕС(_чай,1)/^ВЕС(_чай,3))))';

//let str = testData.resultTest2;
// ((2+3)*^УСЛ(1>(2+4)?7:(9+3)));
/*var _tokens = [];
tokenizer.tokenize(str, function(token) {
    _tokens.push(token);
});*/

//console.log(_tokens)
enrichedTokens = [];
AST = {};
let viszovi;

function makeAST(tokens, AST) {
    ++viszovi;
    //console.log(viszovi, tokens, JSON.stringify(AST))
    if (viszovi > 2000)
        throw new Error('Контракт ЗАЦИКЛИВАЕТСЯ или привышен допустимый ЛИМИТ вычислений. Проверьте корректность расположения символов "(" и ")"<br>')
    if (!tokens)
        throw new Error('Некорректное использование встроенных методов')
    for(i=0; i<tokens.length; i++) {
        if (tokens[i] === '^' && tokens[i+1] === 'УСЛ' && tokens[i+2] === '(') {
            let result = findCond(tokens);
            AST.type = 'cond';
            AST.method = tokens[2+result.method];

            AST.args = [ {}, {} ];
            AST.onTrue = {};
            AST.onFalse = {};

            AST.args[0] = makeAST(result.a, AST.args[0]);
            AST.args[1] = makeAST(result.b, AST.args[1]);
            AST.onTrue =  makeAST(result.onTrue, AST.onTrue);
            AST.onFalse =  makeAST(result.onFalse, AST.onFalse);
            
            i = result.end;
        } else if (tokens[i] === '(' && (isFirstMethodMathOrLogic(tokens, true).on)) {
            let result = isFirstMethodMathOrLogic(tokens, true);
            AST.type = 'method';
            AST.method = tokens[result.method];

            AST.args = [ {}, {} ];

            AST.args[0] = makeAST(result.a, AST.args[0]);
            AST.args[1] = makeAST(result.b, AST.args[1]);
            
            i = result.end;
        } else if (tokens[i] === '(' && isFirstMethodMathOrLogic(tokens, false).on) {
            // логика
            console.log('раскладываю логику'+tokens)
            let result = isFirstMethodMathOrLogic(tokens);
            AST.type = 'cond';
            AST.method = tokens[result.method];

            AST.args = [ {}, {} ];

            AST.args[0] = makeAST(result.a, AST.args[0]);
            AST.args[1] = makeAST(result.b, AST.args[1]);
            AST.onTrue = {type:'logic', value: true};
            AST.onFalse = {type:'logic', value: false};
            
            i = result.end;
        } else if (tokens[i] === '^' && tokens[i+2] === '(' && tokens[i+1] !== 'УСЛ') {
            AST.type = 'method';
            AST.method = tokens[i]+tokens[i+1];
            AST.args = [{}, {}];
            end = findEnd(tokens, ')');
            argsSplit = findEnd(tokens, ',');

            AST.args[0] = makeAST([tokens[i+3]], AST.args[0]);
            if (argsSplit !== -1) {
                AST.args[1] = makeAST([tokens[argsSplit+1]], AST.args[1]);
            }

            i = end;
        } else if (isField(tokens[i])) {
            //terminal
            AST.type = 'field';
            AST.value = tokens[i];
        } else if (isStrNumber(tokens[i].toString())) {
            //terminal
            AST.type = 'number';
            AST.value = tokens[i];
        }
    }
    return AST;
}

function isMathMethod(token) {
    if (token === '*'|| token === '-' || token === '+' || token === '/') 
        return true;
    else
        return false;
}

//Аналогично с концовкой?
function isFirstMethodMathOrLogic(tokens, math) {
    let j = (tokens[0]==='(') ? 0 : 1;
    let result = {};
        result.a;
        result.b;
        result.end;
        result.on = false;
        result.method;

    let open = 0, close = 0;
    for (let i=j+1; i<tokens.length-1; i++) { 
        let method = math ? isMathMethod(tokens[i]) : isLogicMethod(tokens[i]);     
        if (open === close && method) {
            result.a = tokens.slice(j+1, i);
            result.b = tokens.slice(i+1, tokens.length);//здесь
            result.end = tokens.length;
            result.method = i;
            result.on = true;
            break;
        }
        if (tokens[i] == '(')
            ++open;
        if (tokens[i] == ')')
            ++close;
    }

    return result;
}

function findCond(tokens) {
    //FIX рекурсивно?
    let first, second,
        anotherQuestions = 0,
        anotherSep = 0;
    for (let i=0; i<tokens.length; i++) {
        if (tokens[i] === '?') {
            if (!first)
                first = i;
            else
                ++anotherQuestions;
        }
        if (tokens[i] === '|') {
            if (anotherQuestions === anotherSep)
                second = i; 
            else 
                ++anotherSep;
        } 
        if (first && second)
            break;     
    }

    let result = isFirstMethodMathOrLogic(tokens.slice(2,first), false);
        result.onTrue = tokens.slice(first+1, second);
        result.onFalse = tokens.slice(second+1, tokens.length-1);
        result.end = tokens.length;

    return result;
}

function findEnd(tokens, endSymbol) {
    for (let i=tokens.length-1; i>=0; --i) {
        if (tokens[i] === endSymbol)
            return i;
    }
    return -1;
}

function isTerminal(a) {
    if (isField(a) || isStrNumber(a.toString()))
        return true;
    else
        return false;
}

function isField(token) {
    if (token.toString().split('')[0] === '_')
        return true;
    else
        return false;
}

function isLogicMethod(token) {
    if (token === '@@' || token === '||' || token === '&&' || token === '>' || token === '>=' || token === '<' || token === '<=' || token == '==' || token == '!=')
        return true;
    else
        return false;
}

exports.getAST = (text) => {
    viszovi = 0;
    let _tokens = [];
    tokenizer.tokenize(text, function(token) {
        _tokens.push(token);
    });

    return makeAST(_tokens, {});
}

exports.getFields = (text) => {
    let _tokens = [];
    tokenizer.tokenize(text, function(token) {
        _tokens.push(token);
    });
    let fields = [];
    _tokens.map(t => {
        if (isField(t)&&t!=='_ВРЕМЯ')
            fields.push(t);
    })
    return fields;
}
/*viszovi = 0;
console.log(_tokens)
console.log(JSON.stringify(makeAST(_tokens, {})));
(async()=>console.log(
    await require('./operations').callStack(
            makeAST(_tokens, {}), 
            {'_тест1':0, '_себестоимостьСлов':null, '_получилПродукт':15}
        )
    ))()*/