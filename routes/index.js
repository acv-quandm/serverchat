var express = require('express');
var router = express.Router();
// Retrieve
var MongoClient = require('mongodb').MongoClient;
var mongodb = require('./../modules/mongodb')

/* GET home page. */
router.get('/', function(req, res, next) {

    // lấy ra danh sách chat rom
    // set chat rom
    // chat
    // them vao lich sử
    // Connect to the db
    res.render('index', { title: 'Chat chít'});

});

router.post('/create-group',function (req,res,next) { // tạo mới group
    console.log(req.body)
    if(req.body.name_group == undefined)
    {
        res.send({
            message: "can phai co ten group"
        })
    }
    else{

        mongodb.insertOne('chatgroup',{namegroup: req.body.name_group,history: [],list_id_user_join: [req.headers.id_user]},function (docsInserted) {
            res.send(docsInserted.ops[0]._id) // trả về id group vừa tạo
        },function (err) {
            console.log(err)
        })
    }
})
router.post('/get-in-group',function (req,res,next) {
    // console.log(req.headers.id_user)

    mongodb.find('chatgroup',{list_id_user_join: (req.headers.id_user)},{_id:1,namegroup:1},function (results) {
        res.send(results)
    })
})
router.post('/get-out-group',function (req,res,next) {

    mongodb.find('chatgroup',{_id:mongodb.MONGO.ObjectId(req.body.id_group)},{list_id_user_join:1,_id:0},function (results) {

        if(results == null)
        {
            results = []
        }
        else{
            results = results[0]
        }

        var result = results.list_id_user_join.map(function (value) {

            if((value) != (req.headers.id_user))
            {
                return (value)
            }
        })
        result = result.filter(function (value) {
            return value != null && value != undefined
        })
        // console.log(result)
        mongodb.updateOne('chatgroup',{_id:mongodb.MONGO.ObjectId(req.body.id_group)},{list_id_user_join:result})
        res.send({

            status : 1,
            message: "Thanh cong"
        })
    })
})
router.post('/get-history-one',function (req,res,next) {
    mongodb.findOne("chatone",{$or: [{$and:[{id_user:(req.headers.id_user)},{id_friend:(req.body.id_friend)}]},{$and:[{id_friend:(req.headers.id_user)},{id_user:(req.body.id_friend)}]}]},function (results) {

        if(results != null)
        {
            res.send(results)
        }
        else
        {
            res.send(null)
        }
    })
})
router.post('/get-history-group',function (req,res,next) {
    // console.log(req.body)
    mongodb.findOne('chatgroup',{
        list_id_user_join: (req.headers.id_user),
        _id: mongodb.MONGO.ObjectId(req.body.id_group)
    },function (result) {
        res.send(result)
        // console.log(result)
    })
})
router.post('/get-list-friend',function (req,res,next) {

    mongodb.find('friends',{$or:[{id_friend_1: (req.headers.id_user)},{id_friend_2: (req.headers.id_user)}]},{id_friend_1:1,id_friend_2:1,_id:0},function (results) {
        var id_user = req.headers.id_user
        var result = []
        results.forEach(function (value) {
            if(value.id_friend_1 != id_user)
            {
                result.push(value.id_friend_1)
            }else
            {
                result.push(value.id_friend_2)
            }
        })
        res.send(result)
    })
})
router.post('/add-friend',function (req,res,next) {
    var id_user = req.headers.id_user
    if(req.body.id_friend == undefined || req.body.id_friend == null)
    {
        res.send({
            status:0,
            message: "Khong co id friend"
        })
    }
    else {
        var id_friend = req.body.id_friend.toString()
        mongodb.find('friends',{$or: [{$and: [{id_friend_1: id_user.toString()},{id_friend_2: id_friend}]},{$and: [{id_friend_2: id_user.toString()}]}]},{},function (results) {
            console.log(results)
            if(results .length == 0)
            {
                mongodb.insertOne('friends',{id_friend_1: id_user.toString(),id_friend_2: req.body.id_friend.toString(),id_invite: id_user.toString(),accepted: "0"},function (result) {
                    res.send({
                        status: 1,
                        message: "gui loi moi thanh cong"
                    })
                },function (err) {
                    res.send(err)
                })
            }
            else{
                res.send({
                    status: 0,
                    message: "Gui loi moi that bai | Hai nguoi da la ban be hoac da co loi moi duoc gui truoc do"
                })
            }
        })
    }
})
router.post('/get-list-invite',function (req,res,next) {
    var id_user = req.headers.id_user.toString()
    mongodb.find('friends',{$and: [{$or: [{id_friend_1: id_user.toString()},{id_friend_2: id_user.toString()}]},{id_invite: id_user.toString()},{accepted: "0"}]},{},function (results) {
        console.log(results)
        var list_id_friend = []
        results.forEach(function (value) {
            if(value.id_friend_1.toString() == id_user.toString())
            {
                list_id_friend.push(value.id_friend_2.toString())
            }else{
                list_id_friend.push(value.id_friend_1.toString())
            }
        })
        res.send(list_id_friend)
    })
})
router.post('/accept-friend',function (req,res,next) {
    var id_user = req.headers.id_user
    var id_friend = req.body.id_friend
    if(id_friend == undefined || id_friend == null)
    {
        res.send({
            status: 0,
            message: "Khong co id friend"
        })
    }else{

        id_friend = id_friend.toString()
        mongodb.updateOne('friends',{$and: [{$or: [{id_friend_1: id_friend},{id_friend_2: id_friend}]},{id_invite: id_user.toString()},{accepted: "0"}]},{accepted: "1"})
        res.send({
            status: 1,
            message: "Them ban thanh cong"
        })
    }
})
router.post('/un-friend',function (req,res,next) {
    var id_friend = req.body.id_friend
    var id_user = req.headers.id_user
    if(id_friend == undefined || id_friend == null)
    {
        res.send({
            status: 0,
            message: "Khong co id_friend"
        })
    }else{
        mongodb.findOne('friends',{$or: [{$and: [{id_friend_1: id_user.toString()},{id_friend_2: id_friend}]},{$and: [{id_friend_2: id_user.toString()}]}]},function (result) {
            if(result != null || result != undefined)
            {
                var _id = result._id
                mongodb.deleteOne('friends',{_id: mongodb.MONGO.ObjectId(_id)},function (obj) {
                    res.send({
                        status: 1,
                        message: "xoa ban be thanh cong"
                    })
                })
            }
            else{
                res.send({
                    status: 0,
                    message: "Hai nguoi chua la ban be"
                })
            }
        })
    }
})
router.post('/post-status',function (req,res,next) {
    var content_post = req.body.content_post
    var date_time = new Date().toLocaleString();
    var id_user = req.headers.id_user.toString()
    var comments= []
    var likes= []
    var shares= []

    if(content_post == null || content_post == undefined)
    {
        res.send({
            status: 0,
            message: "Nội dung trống"
        })
    }
    else if((content_post.images == undefined || content_post.images == []) &&
        (content_post.text == undefined || content_post.text == '') &&
        (content_post.videos == undefined || content_post.videos == [])

    )
    {
        res.send({
            status: 0,
            message: "Nội dung trống"
        })
    }
    //Tìm xem người dùng đó đã đăng bài nào chưa
    // Nếu đăng rồi thì thêm vào
    // Nếu chưa đăng thì tạo mới

    else{
        mongodb.findOne('posts',{id_user: id_user},function (data) {
            if(data != null)
            {
                var _id = data._id
                var posts = data.posts

                var images = typeof content_post.images == 'array'? content_post.images: []
                var videos = typeof content_post.videos == 'array'? content_post.videos: []
                var text = typeof content_post.text == 'string'? content_post.text: ''
                posts.push({
                    _id: new mongodb.MONGO.ObjectId(),
                    content_post:{

                        images: images,
                        videos: videos,
                        text: text
                    },
                    date_time:date_time,
                    comments:comments,
                    likes: likes,
                    share:shares
                })
                // res.send(_id)
                mongodb.updateOne('posts',{_id: mongodb.MONGO.ObjectId(_id)},{posts: posts})
                res.send({
                    status: 1,
                    message: 'Đăng bài thành công'
                })
            }
            else{
                var posts = []
                posts.push({
                    _id: new mongodb.MONGO.ObjectId(),
                    content_post:content_post,
                    date_time:date_time,
                    comments:comments,
                    likes: likes,
                    share:shares
                })
                mongodb.insertOne('posts',{
                    posts: posts,
                    id_user: id_user,

                },function () {
                    res.send({
                        status: 1,
                        message: 'Đăng bài thành công'
                    })
                },function (err) {
                    res.send(err)
                })
            }
        })
    }

})
router.post('/delete-status',function (req,res,next) {

    var id_user = req.headers.id_user.toString()
    var _id = req.body._id

    if(_id == null || _id == undefined)
    {
        res.send({
            status: 0,
            message: "Không tìm thấy bài viết"
        })
    }



    else{
        mongodb.findOne('posts',{id_user: id_user},function (data) {
            if(data != null)
            {
                var posts = data.posts
                var countOld = posts.length
                posts = posts.filter(function (value) {

                    return value._id != _id
                })
                var countNew = posts.length
                if(countNew == countOld)
                {
                    res.send({
                        status: 0,
                        message: 'Không tìm thấy bài đăng'
                    })

                }else{

                    mongodb.updateOne('posts',{_id: mongodb.MONGO.ObjectId(data._id)},{posts: posts})
                    res.send({
                        status: 1,
                        message: 'Xóa bài thành công'
                    })
                }
                // res.send(_id)

            }
            else{
                res.send({
                    status: 0,
                    message: 'Không tìm thấy bài viết'
                })
            }
        })
    }

})
router.post('/edit-status',function (req,res,next) {
    try{

        var id_user = req.headers.id_user.toString()
        var _id = req.body._id
        var text = req.body.text
        if(_id == null || _id == undefined || text == null || text == undefined)
        {
            res.send({
                status: 0,
                message: 'Không tìm thấy bài viết'
            })
        }
        else{
            mongodb.findOne('posts',{id_user:id_user},function (data) {
                if(data != null)
                {
                    var posts = data.posts
                    var edited = false;
                    posts = posts.map(function (value) {

                        if(value._id == _id)
                        {
                            value.content_post.text = text
                            edited = true
                        }
                        return value
                    })

                    if(edited == false)
                    {
                        res.send({
                            status: 0,
                            message: 'Không tìm thấy bài viết'
                        })

                    }else{

                        mongodb.updateOne('posts',{_id: mongodb.MONGO.ObjectId(data._id)},{posts: posts})
                        res.send({
                            status: 1,
                            message: 'Update thành công'
                        })
                    }
                }
                else{
                    res.send({
                        status: 0,
                        message: 'Không tìm thấy bài viết'
                    })
                }
            })
        }
    }catch (e) {
        res.send({
            status: 0,
            message: 'Không tìm thấy bài viết'
        })
    }


})
router.post('/get-all-status',function (req,res,next) {
    try{

        var id_user = req.headers.id_user.toString()
        var _id = req.body._id

        if(_id == null || _id == undefined)
        {
            res.send({
                status: 0,
                message: 'Không tìm thấy bài viết'
            })
        }
        else{
            mongodb.findOne('posts',{id_user:id_user},function (data) {
                return res.send(data)
            })
        }
    }catch (e) {
        res.send({
            status: 0,
            message: 'Không tìm thấy bài viết'
        })
    }
})
router.post('/get-status',function (req,res,next) {
    try{

        var id_user = req.headers.id_user.toString()
        var id_user_post = req.body.id_user_post.toString()
        var _id = req.body._id

        if(_id == null || _id == undefined || id_user_post == null || id_user_post == undefined)
        {
            res.send({
                status: 0,
                message: 'Không tìm thấy bài viết'
            })
        }
        else{
            mongodb.findOne('posts',{id_user:id_user_post},function (data) {

                if(data != null)
                {
                    var posts = data.posts;
                    var post = null
                    post = posts.filter(function (value) {
                        return value._id == _id
                    })
                    if(post != null != post != undefined)
                    {
                        res.send(post)
                    }
                    else {
                        res.send({
                            status: 0,
                            message: 'Không tìm thấy bài viết'
                        })
                    }
                }
                else{
                    res.send({
                        status: 0,
                        message: 'Không tìm thấy bài viết'
                    })
                }
            })
        }
    }catch (e) {
        res.send({
            status: 0,
            message: 'Không tìm thấy bài viết'
        })
    }
})
router.post('/like',function (req,res,next) {
    try{
        var message = ''
        var id_user = req.headers.id_user.toString()
        var id_user_post = req.body.id_user_post.toString()
        var _id = req.body._id

        if(id_user_post == undefined || id_user_post == null || _id == null || _id == undefined)
        {
            res.send({
                status: 0,
                message: 'Không tìm thấy bài viết'
            })
        }
        else{
            mongodb.findOne('posts',{id_user:id_user_post},function (data) {
                if(data != null)
                {
                    var posts = data.posts

                    posts = posts.map(function (value) {
                        if(_id == value._id)
                        {
                            var index = value.likes.findIndex(function (item) {
                                return item == id_user
                            })

                            if(index != -1)
                            {
                                value.likes.splice(index,1)
                                message = 'Unlike thành công'
                            }
                            else{
                                value.likes.push(id_user)
                                message=' Like thành công'
                            }

                        }
                        return value
                    })

                    mongodb.updateOne('posts',{_id:mongodb.MONGO.ObjectId(data._id)},{posts: posts})
                    res.send({
                        status: 1,
                        message: message
                    })
                }
                else{
                    res.send({
                        status: 0,
                        message: 'Không tìm thấy bài viết'
                    })
                }
            })
        }
    }catch (e) {
        res.send({
            status: 0,
            message: 'Không tìm thấy bài viết'
        })
    }


})
router.post('/share',function (req,res,next) {
    try{
        var message = 'Share thành công'
        var id_user = req.headers.id_user.toString()
        var id_user_post = req.body.id_user_post.toString()
        var _id = req.body._id

        if(id_user_post == undefined || id_user_post == null || _id == null || _id == undefined)
        {
            res.send({
                status: 0,
                message: 'Không tìm thấy bài viết'
            })
        }
        else{
            mongodb.findOne('posts',{id_user:id_user_post},function (data) {
                if(data != null)
                {
                    var posts = data.posts

                    posts = posts.map(function (value) {
                        if(_id == value._id)
                        {
                            var index = value.shares.findIndex(function (item) {
                                return item == id_user
                            })

                            if(index == -1)
                            {
                                value.shares.push(id_user)

                            }


                        }
                        return value
                    })

                    mongodb.updateOne('posts',{_id:mongodb.MONGO.ObjectId(data._id)},{posts: posts})
                    res.send({
                        status: 1,
                        message: message,
                        data: data
                    })
                }
                else{
                    res.send({
                        status: 0,
                        message: 'Không tìm thấy bài viết'
                    })
                }
            })
        }
    }catch (e) {
        res.send({
            status: 0,
            message: 'Không tìm thấy bài viết'
        })
    }


})

module.exports = router;
