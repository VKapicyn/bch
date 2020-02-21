const MongoClient = require("mongodb").MongoClient;
const ObjectId = require('mongodb').ObjectId;
const dbName = 'bchGameDb';
const url = "mongodb://localhost:27017/";

exports.save = async (obj, collectionName) => {
    //console.log(collectionName)
    const client = await MongoClient.connect(url, { useNewUrlParser: true , useUnifiedTopology: true });
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    if (!client) { return } 

    console.log('сохраняю...')
    try {
        let was = await (new Promise((resp, rejp)=>{
            //if (collectionName == 'contracts') 
                //console.log('объект\n'+JSON.stringify(obj))
            collection.findOne({_id: ObjectId(obj._id)}, async (err1, _res) => {
                if (!_res || err1) { 
                    resp(null);
                } else {
                    resp(_res);
                }
            })
        }));

        if (!was) { 
            return new Promise((resp1, rej1) => {
                collection.insertOne(obj, function(err, result){
                    if (err) {return null;}   
                    resp1(result.ops[0]._id);
                })
            })
        } else {
            return new Promise((resp2, rej2) => {
                collection.update({_id: ObjectId(was._id)}, obj, async function(err3, result1){
                    if (err3) {return null;}              
                    resp2(true);
                });
            })
        }
    }
    catch (e) { console.log(e) }
    finally { await client.close(); }
}

exports.find = async (params, collectionName) => {
    const client = await MongoClient.connect(url, { useNewUrlParser: true , useUnifiedTopology: true });
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    if (params['_id']) {
        params['_id'] = ObjectId(params['_id']);
    }
    if (params['skID']) {
        params['skID'] = ObjectId(params['skID']);
    }

    if (!client) { return } 

    try {
        return new Promise((resp, rejj) => {
            collection.find(params).toArray(function(err, result){
                if (err) { return null; }                
                resp(result);
            });
        });
    }
    catch (e) { console.log(e); return 'ok'}
    finally { await client.close(); }
}

exports.findOne = async (params, collectionName) => {
    const client = await MongoClient.connect(url, { useNewUrlParser: true , useUnifiedTopology: true });
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    if (params['_id']) {
        try {
            params['_id'] = ObjectId(params['_id']);
        } catch(e) { return null}
    }
    if (params['skID']) {
        try {
            params['skID'] = ObjectId(params['skID']);
        } catch(e) { return null}
    }

    if (!client) { return } 

    try {
        return new Promise((resolve, reject) => {

            collection.findOne(params, function(err, result){
                if (err) { return null; }                    
                resolve(result);
            });
        });
    }
    catch (e) { console.log(e) }
    finally { await client.close(); }
}