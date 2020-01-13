const dbModel = require('./models/dbModel');
const Field = require('./models/fieldModel').Field;
const SC = require('./models/scModel').SmartContract;
const ObjectID = require('mongodb').ObjectID;
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

//worked
exports.createContract = async (req, res) => {
    //TODO: убедиться что не более 6 контрактов на раунд
    let contr = new SC(null, req.body.text, req.body.user, null , null, null, null, null , Number(req.body.round));
    let sk = {};
    try {
        sk = await contr.validateAndSave();
        res.json({sk:sk._id})
    } catch (e) {
        //sk.err = e.toString();
        res.json({err: e.toString()})
    }
}

//worked
exports.getContractCode = async (req, res) => {
    let sc = await dbModel.findOne({_id: req.params.id},'contracts');
    res.json(
        (sc).text
    );
}

//worked
exports.callField = async (req, res) => {
    console.log('CALL FIELD')

    let dbField = await dbModel.findOne({
        skID: req.body.skId,
        _id: req.body.fieldId 
    }, 'fields');

    let field = new Field(
        dbField.skID, 
        dbField.name, 
        dbField.type, 
        dbField.sec,
        dbField.value, 
        dbField.author, 
        dbField._id
    )
    try{
        console.log(`${req.body.user},${req.body.data}`)
        await field.callToWrite(req.body.user, req.body.data);
        console.log('done'+field)
        res.json({field});
    } catch(e) {
        console.log('err'+e)
        res.json({err: e.toString()});
    }
}

//worked
exports.getFields = async (req, res) => {
    let fieldIds = (await dbModel.findOne({_id: req.params.skID}, 'contracts')).fields;
    let fields = [];

    for (let i=0; i<fieldIds.length; i++) {
        fields.push(
            (await dbModel.findOne(
                {_id: fieldIds[i]}, 'fields')
            ));
    }

    res.json(fields);
}

//worked
exports.getResults = async (req, res) => {
    let ctr = await dbModel.findOne({_id: req.params.id}, 'contracts');
    let ctrObject = new SC(ctr._id, ctr.text, ctr.author, ctr.status, ctr.resBalance, ctr.fields, ctr.vars, ctr.results, ctr.round);
    res.json({
        result: await SC.getResult(ctrObject)
    })
}

//worked
exports.getAllContracts = async (req, res) => {
    res.json(await dbModel.find({},'contracts'));
}

//worked
exports.getAllActualContracts = async (req, res) => {
    res.json(await allActualContracts(req.params.round));
}

async function allActualContracts(round) {
    let scs = await dbModel.find({round:Number(round), status: 1},'contracts');

    for (let j=0; j<scs.length; j++) {
        for (let i=0; i<scs[j].fields.length; i++) {
            scs[j].fields[i] = (await dbModel.findOne({_id: scs[j].fields[i]}, 'fields'))
        }
        scs[j].results = await SC.getResult(scs[j]);
    }

    return scs
}

//TODO: wont TEST
exports.closeAllByRound = async (req, res) => {
    const balances = req.body.balances;
    let contrs = await allActualContracts(req.body.round);
    for (let i=0; i<balances.length; i++) {
        for (let j=0; j<contrs.length; j++) {
            if (balances[i].id === contrs[j].id) {
                let results = await contrs[j].getResult();
                let sum = 0;
                results.map(x => {
                    sum += Number(x.balances);
                })
                if (sum >= balances[i].balance) {
                    balances[i].balance = true;
                }
        
                contrs[j].status = 2;
                contrs[j].updateDB();
            }
        }
    }
    res.json(
        balances
    )
}

app.use(    
    bodyParser(),
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true })
);

let router = express.Router();
router.post('/sk/create', exports.createContract);
router.post('/sk/close', exports.closeAllByRound);
router.post('/callField', exports.callField);
router.get('/sk/actual/:round', exports.getAllActualContracts);
router.get('/sk/all', exports.getAllContracts);
router.get('/sk/results/:id', exports.getResults);
router.get('/fields/:skID', exports.getFields);
router.get('/sk/code/:id', exports.getContractCode);
router.get('/err/:test', (req, res) => {
   
    try{
        if (req.params.test == '1') 
            throw Error('Ошибочка вышла');
        else
            res.json('все нормуль')
    }
    catch(e) {
        res.json({err:e.toString()})
    }  
});

app.use('/api/', router);
app.listen(9000);

console.log('Server started!');