var mongodb = require('./mongodb')
function getToken (tok_1,tok_2) {
    return md5(tok_1+tok_2+'helloworld')
}
var md5 = require('md5')
module.exports = {
    findListFriend: function (id_user,callback) {
        id_user = parseInt(id_user)
        mongodb.find('friends',{$and: [{$or:[{id_friend_1: parseInt(id_user)},{id_friend_2: parseInt(id_user)}]},{accepted: "1"}]},{},function (results) {
            var listFriend = results.map(function (item) {
                if(item.id_friend_1 != id_user)
                {
                    return item.id_friend_1
                }
                else{
                    return item.id_friend_2
                }
            })
            callback(listFriend)
        })
    },
    findClientsId: function (sessionClient,list_idUser) {

        var list_idClient = list_idUser.map(function (idUser) {
            var idClient = sessionClient.find(function (item) {
                return item.id_user == idUser
            })

            if(idClient != undefined)
            {
                return idClient
            }
        })
        return list_idClient.filter(function (value) {
            return value!=undefined
        })


    },
    findClientId:function (sessionClient,idUser) {
        var listClient = []
        sessionClient.forEach(function (value) {
            if(value.id_user == idUser)
            {
                listClient.push(value.id_client)
            }
        })
        return listClient
    }
    ,
    checkToken:function (id_user,id_client,token) {
        console.log(getToken(id_user,id_client))
        return getToken(id_user,id_client) == token
    },
    findUserId: function (clientOnline,id_socket) {
        clientOnline.forEach(function (value) {
            if(value.id_client == id_socket)
            {
                return value.id_user
            }
        })
    }
}