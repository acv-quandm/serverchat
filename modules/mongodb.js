var mongo = require('mongodb')
var mongoClient = mongo.MongoClient
var database = 'databasechat'
var URL_CONNECT ="mongodb://localhost:27017"


// Tạo collection
// insert
// update
// delete
// tìm kiếm
module.exports = {
    createCollection: function(nameCollection){
        mongoClient.connect( URL_CONNECT,function (err,db) {
            if (err) throw err;
            var dbo = db.db(database);
            dbo.createCollection(nameCollection, function(err, res) {
                if (err) throw err;
                console.log("Collection created!");
                db.close();
            });
        })
    },
    insertOne: function (nameCollection,valueInsert,callback,errorCallback) {
        mongoClient.connect( URL_CONNECT,function (err,db) {
            if (err) {
                errorCallback(err)
            };

            var dbo = db.db(database);
            dbo.collection(nameCollection).insertOne(valueInsert, function(err, res) {
                if (err) {
                    errorCallback(err)
                };
                console.log("inserted");
                callback(res)
                db.close();
            });
        })
    },
    insertMany: function (nameCollection,valueInsert) {
        mongoClient.connect( URL_CONNECT,function (err,db) {
            if (err) throw err;
            var dbo = db.db(database);
            dbo.collection(nameCollection).insertMany(valueInsert, function(err, res) {
                if (err) throw err;
                console.log("Number of documents inserted: " + res.insertedCount);
                db.close();
            });
        })
    },
    find: function (nameCollection,query,fields,callback) {
        mongoClient.connect( URL_CONNECT,function (err,db) {
            if (err) throw err;
            var dbo = db.db(database);
            dbo.collection(nameCollection).find(query).project(fields).toArray(function (err,result) {
                if (err) throw err;
                callback(result)
                db.close();
            });
        })
    },
    findOne: function (nameCollection,query,callback) {


        mongoClient.connect( URL_CONNECT,function (err,db) {
            if (err) throw err;
            var dbo = db.db(database);
            dbo.collection(nameCollection).findOne(query,function (err,result) {
                if (err) throw err;
                callback(result)
                db.close();
            });
        })
    },
    findMany: function (nameCollection,query,callback) {
        mongoClient.connect( URL_CONNECT,function (err,db) {
            if (err) throw err;
            var dbo = db.db(database);
            dbo.collection(nameCollection).find(query).toArray(function (err,result) {
                if (err) throw err;
                callback(result)
                db.close();
            });
        })
    },
    sort: function (nameCollection,query,fields,callback,mysort) {
        mongoClient.connect( URL_CONNECT,function (err,db) {
            if (err) throw err;
            var dbo = db.db(database);
            dbo.collection(nameCollection).find(query).project(fields).sort(mysort).toArray(function (err,result) {
                if (err) throw err;
                callback(result)
                db.close();
            });
        })
    },
    deleteOne: function (nameCollection,query,callback) {
        mongoClient.connect( URL_CONNECT,function (err,db) {
            if (err) throw err;
            var dbo = db.db(database);
            dbo.collection(nameCollection).deleteOne(query, function(err, obj) {
                if (err) throw err;
                console.log("1 document deleted");
                callback(obj)
                db.close();
            });
        })
    },
    deleteMany: function (nameCollection,query) {
        mongoClient.connect( URL_CONNECT,function (err,db) {
            if (err) throw err;
            var dbo = db.db(database);
            dbo.collection(nameCollection).deleteMany(query, function(err, obj) {
                if (err) throw err;
                console.log(obj.result.n + " document(s) deleted");
                db.close();
            });
        })
    },
    dropColection: function (nameCollection,query) {
        mongoClient.connect( URL_CONNECT,function (err,db) {
            if (err) throw err;
            var dbo = db.db(database);
            dbo.dropCollection(nameCollection, function(err, delOK) {
                if (err) throw err;
                if (delOK) console.log("Collection deleted");
                db.close();
            });
        })
    },
    updateOne: function (nameCollection,query,value) {
        mongoClient.connect( URL_CONNECT,function (err,db) {
            if (err) throw err;
            var dbo = db.db(database);
            dbo.collection(nameCollection).updateOne(query, {$set: value}, function(err, res) {
                if (err) throw err;

                console.log("1 document updated");
                db.close();
            });
        })
    },
    updateMany: function (nameCollection,query,value) {
        mongoClient.connect( URL_CONNECT,function (err,db) {
            if (err) throw err;
            var dbo = db.db(database);
            dbo.collection(nameCollection).updateMany(query, {$set: value}, function(err, res) {
                if (err) throw err;
                console.log(res.result.nModified + " document(s) updated");
                db.close();
            });
        })
    },
    createIndex: function(nameCollection,index_option,callback,errorCallback){
        mongoClient.connect( URL_CONNECT,function (err,db) {
            if (err){
                errorCallback(err)
            };
            var dbo = db.db(database);
            dbo.collection(nameCollection).createIndex(index_option,function (err,result) {
                if (err) throw  err;
                callback(result)
                db.close();
            })
        })
    },
    createOptionIndex: function(nameCollection,index,option,callback,errorCallback){
        mongoClient.connect( URL_CONNECT,function (err,db) {
            if (err) {
                errorCallback(err)
            };
            var dbo = db.db(database);
            dbo.collection(nameCollection).createIndex(index,option,function (err,result) {
                if (err) throw  err;
                callback(result)
                db.close();
            })
        })
    },
    getIndex: function(nameCollection,callback){
        mongoClient.connect( URL_CONNECT,function (err,db) {
            if (err) throw err;
            var dbo = db.db(database);
            callback(dbo.collection(nameCollection).getIndexes())
            db.close()
        })
    },
    MONGO: mongo
}