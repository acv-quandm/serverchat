var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var md5 = require('md5')
var src = require('./modules/src')

var mongo = require('./modules/mongodb')





var index = require('./routes/index');
var session = []

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// dường middle
// quy tắc đối chiếu token
// khi một người dùng muốn request
// phải cung cấp id_user + id_client + token
// hệ thống sẽ kiểm trả xem md5(id_user+id_client+"helloword") == token không
// Mục đích xác định người yêu cầu request là người dùng của hệ thống
// Hàm trên chỉ có server và client mới biết
// Vẫn chưa tối ưu -- rủi ro thấp -- chấp nhận được
app.use(function(req, res, next){
    // if(src.checkToken(req.headers.id_user,req.headers.id_client,req.headers.token))
    // {
    //     res.io = io;
    //     next()
    // }
    // else{
    //     var err = new Error('Not Found');
    //     err.status = 404;
    //     next(err);
    // }
    res.io = io;
    next();
});

// socket middle
// io.use(function (socket,next) {
//     console.log(socket.id)
// })
var clientOnline = []
io.on('connection', function (socket) {

    console.log('1 nguoi vua ket noi')
    socket.on('online-user',function (id_user) {
        // Thêm id client vừa online vào stack -- Gồm token và idclient


        // them nguoi dung vao clientOnline
        // id clien la id dong nen luon phai check idUser trong clientOnline

        // Thêm thông tin người đăng nhập vào stack


        clientOnline.push({
            id_user:id_user,
            id_client: socket.id
        })


        // check xem người dùng đang ở trong room nào để join vào

        mongo.find('chatgroup',{list_id_user_join: id_user},{_id:1},function (results) {
            if(results != undefined)
            {
                results.forEach(function (item) {

                    socket.join(item._id)

                })
            }
        })

        //khi ngắt kết nôi
        socket.on('disconnect',function () {
            console.log('client disconnected')
            clientOnline = clientOnline.filter(function (value) {
                return value.id_client != socket.id
            })
            console.log(clientOnline)
        })


        // gửi thông tin online đến bạn bè của người vừa đăng nhập
        src.findListFriend(id_user,function (results) {
            // result gom id_friend
            // tach list idFriend
            // tach idClient
            // console.log(clientOnline)
            var listIdClientFriend = src.findClientsId(clientOnline,results) // lay danh sach id clien ban be cua nguoi vua dang nhap

            listIdClientFriend.forEach(function (item) {
                socket.broadcast.to(item.id_client).emit('friends-online',{id_user: id_user,id_client: socket.id}) // gui den cac client ban be cuar nguoi vua dang nhap thong tin ve ban be vua online
            })

            var list_friend_online = []

            for (var i = 0;i<listIdClientFriend.length;i++)
            {
                for (j=0;j<clientOnline.length;j++)
                {
                    if(listIdClientFriend[i].id_user == clientOnline[j].id_user)
                    {
                        list_friend_online.push(clientOnline[j]);
                        break;
                    }
                }
            }
            socket.emit('list-friend-online',list_friend_online)
        })


        // ---
        // tu vao nhom chat
        socket.on('join-group',function (id_group) { // join vao room


            var id_user = src.findUserId(clientOnline,socket.id)
            if(id_user != undefined)
            {
                socket.join(id_group)

                // check xem nguoi dung da o trong group chưa
                // neu chua thi them nguoi nay vao group
                mongo.findOne('chatgroup',{$and: [{_id: mongo.MONGO.ObjectId(id_group)},{list_id_user_join: id_user}]},function (result) {
                    if(result == null)
                    {
                        var list_id_user_join = result.list_id_user_join
                        list_id_user_join.push(id_user.toString())
                        // them nguoi nay vao group
                        mongo.updateOne('chatgroup',{$and: [{_id: mongo.MONGO.ObjectId(id_group)},{list_id_user_join: id_user}]},{list_id_user_join:list_id_user_join})
                    }
                })
            }
        })


            // Them nguoi khac vao nhom

            socket.on('push-group',function (data) {
            if(data.id_group != undefined && data.id_friend != undefined)
            {

                mongodb.findOne('chatgroup',{_id: mongodb.MONGO.ObjectId(data.id_group)},function (result) {
                    if(result != null)
                    {
                        var list_id_user_join = result.list_id_user_join
                        list_id_user_join.push(data.id_friend)
                        mongodb.updateOne('chatgroup',{_id: mongodb.MONGO.ObjectId(data.id_group)},{list_id_user_join:list_id_user_join})
                        var list_idClient = src.findClientId(clientOnline,data.id_friend)
                        list_idClient.forEach(function (value) {
                            socket.broadcast.to(value).emit('push-on-group',data.id_group)
                        })
                    }
                })
            }
        })

        socket.on('chat-one',function (data) {// Trường hợp chát đơn 1-1 Dữ liệu gửi lên gồm idClient + tin nhắn

            var message = data.message
            var type = data.type
            var to_id_user = data.to_id_user
            // tìm id_user từ id_client
            var id_user = src.findUserId(clientOnline,socket.id)
            if(id_user != undefined)
            {
                var list_to_id_client = []
                clientOnline.forEach(function (value) {
                    if(value.id_user == to_id_user)
                    {
                        list_to_id_client.push(value.id_client)
                    }
                })
                // lay idClient
                var time = new Date()
                list_to_id_client.forEach(function (value) {
                    socket.broadcast.to(value).emit('receive-message-one',{
                        id_user: id_user,
                        message: message,
                        type: type,
                        time: time
                    }) // trả về tin nhắn cho client cần nhận
                })
                //tim xem 2 nguoi nay da chat voi nhau lan nao chua
                // neu roi thi update
                // neu chua thì insert
                mongodb.findOne("chatone",{$or: [{$and:[{id_user:(req.headers.id_user)},{id_friend:(req.body.id_friend)}]},{$and:[{id_friend:(req.headers.id_user)},{id_user:(req.body.id_friend)}]}]},function (results) {

                    if(results != null)
                    {
                        // da chat voi nhau truoc do
                        var history = results.history
                        history.push({
                            id_chat: to_id_user.toString(),

                            message: data.message,
                            type: type,
                            time: time
                        })
                        mongo.updateOne('chatone',{$or: [{$and:[{id_user:(req.headers.id_user)},{id_friend:(req.body.id_friend)}]},{$and:[{id_friend:(req.headers.id_user)},{id_user:(req.body.id_friend)}]}]},{history:history})
                    }
                    else // Chưa chat với nhau
                    {
                        mongo.insertOne('chatone',{id_user:id_user.toString(),id_friend: to_id_user.toString(),history: [
                                {
                                    id_chat:id_user.toString(),
                                    message: data.message,
                                    time: time,
                                    type: type
                                }
                            ]
                            },function (res) {
                            console.log(res)
                        },function (err) {
                            console.log(err)
                        })
                    }
                })
            }


        })
        socket.on('chat-group',function (data) { // trường hợp chat group // ví dụ khi chat group room 1

            //check xem nguoi do co trong group khong
            var id_user = src.findUserId(clientOnline,socket.id)
            if(id_user != undefined)
            {
                mongo.findOne('chatgroup',{$and:[{list_id_user_join: id_user},{_id:mongo.MONGO.ObjectId(data.id_group)}]},function (result) { // co trong nhom chat
                    if(result!= null)
                    {
                        var string_to = 'receive-message-group-'+data.id_group
                        var timeChat = new Date();
                        io.to(data.id_group).emit(string_to,{
                            id_chat: id_user,
                            message : data.message,
                            time: timeChat
                        })//chat den room
                        var history = results.history
                        history.push({
                            id_chat: id_user,
                            message: data.message,
                            time: timeChat
                        })
                        mongo.updateOne('chatgroup',{_id:mongo.MONGO.ObjectId(data.id_group)},{history: history})
                    }

                })
            }

            // dữ liệu gửi lên gồm tin nhắn
            // hiển thị tin nhắn lên tất cả client ở trong group
            // dữ liệu gửi lên gồm -- key room
        })
    })

    // io.emit('client-online',socket.id) // gửi đến tất cả client idclient vừa online
    //
})


app.use('/', index);


// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = {app: app, server: server};
