var $ = require('jquery')
// // test get history chat 1-1
// $.ajax({
//     url: window.location.origin+'/get-history-one',
//     type:'POST',
//     data: {
//         id_user: 1,
//         id_friend : 2
//     },
//     success: function (data) {
//         console.log(data)
//     },
//     error: function (err) {
//         console.log(err)
//     }
// })
// //test get history group
// $.ajax({
//     url: window.location.origin+'/get-history-group',
//     type:'POST',
//     data: {
//         id_user: 1,
//         id_group: '5b06236fcd4fb1c86870ff9d'
//     },
//     success: function (data) {
//         console.log(data)
//     },
//     error: function (err) {
//         console.log(err)
//     }
// })
//
// // test get friend
// $.ajax({
//     url: window.location.origin+'/get-list-friend',
//     type:'POST',
//     data: {
//         id_user: 2,
//     },
//     success: function (data) {
//         console.log(data)
//     },
//     error: function (err) {
//         console.log(err)
//     }
// })
// var md5 = require(md5)

var io = require('socket.io-client')
var socket = io.connect(window.location.origin)

var ID_CLIENT = socket.io.engine.id

socket.on('friends-online',function (results) {
    console.log('Bạn bè của bạn' + results.id_user + 'Vừa online')
    console.log('Với client ID là: '+ results.id_client)
})
socket.on("receive-message-one",function (results) {
    console.log('Người dùng: '+ results.id_user+ ' Vừa nhắn cho bạn: '+results.message)
})
socket.on('sendMessage',function (data) {
    console.log('Người dùng '+data.id_user+ ' Vừa chát với bạn')
    console.log('Với nội dung là: '+data.message)
})

$("#gui_group").click(function () {
    var id_group = $('#id_group').val()
    var message = $('#noi_dung_group').val()
    socket.emit('chat-group',{
        id_group:id_group,
        message: message,
        id_user: 2
    })
})
socket.emit('online-user',2)
socket.on('receive-message-group-5b06236fcd4fb1c86870ff9d',function (value) {
    console.log(value)
})

