var express = require('express');
var router = express.Router();
require('./../util/util')
var User = require('./../models/user')

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get("/test", function (req, res, next) {
  res.send('test')
})

router.post("/login", function (req, res, next) {
  var param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }
  //登录接口  查找某一个用户，根据用户密码   doc 是用户文档  
  User.findOne(param, function (err, doc) {
    if (err) {
      res.json({
        status: "1",
        msg: err.message
      });
    } else {
      if (doc) {
        // 写cookie
        res.cookie("userId", doc.userId, {
          path: "/",
          maxAge: 1000 * 60 * 60
        });
        res.cookie("userName", doc.userName, {
          path: "/",
          maxAge: 1000 * 60 * 60
        })
        // 存到session  需要安装插件才能用的 express-session
        // req.session.user = doc
        res.json({
          status: "1",
          msg: "",
          result: {
            userName: doc.userName
          }
        })
      }
    }

  })
})


// 登出接口
router.post("/logout", function (req, res, next) {
  // 清除cookie
  res.cookie("userId", "", {
    path: "/",
    maxAge: -1
  })
  res.json({
    status: "0",
    msg: "",
    result: ""
  })
})

// 校验是否登录  通过判断请求头里面是否有userId来确定是否登录
router.get("/checkLogin", function (req, res, next) {
  if (req.cookies.userId) {
    res.json({
      status: "0",
      msg: "",
      result: req.cookies.userName
    })
  } else {
    res.json({
      status: "1",
      msg: "",
      result: "未登录"
    })
  }
})

// 查询当前用户购物车数据
router.get("/cartList", function (req, res, next) {
  var userId = req.cookies.userId;
  User.findOne({
    userId: userId
  }, function (err, doc) {
    if (err) {
      res.json({
        status: "1",
        msg: err.message,
        result: ""
      });
    } else {
      if (doc) {
        res.json({
          status: "0",
          msg: "",
          result: doc.cartList
        })
      }
    }
  })
})


// 购物车删除
router.post("/cartDel", function (req, res, next) {
  var userId = req.cookies.userId,
    productId = req.body.productId;
  User.update({ //通过update和$pull 来删除,查询某个用户的某个商品id，进行删除
    'userId': userId
  }, {
    $pull: {
      'cartList': {
        "productId": productId
      }
    }
  }, function (err, doc) {
    if (err) {
      res.json({
        status: "1",
        msg: err.message,
        result: ""
      });
    } else {
      if (doc) {
        res.json({
          status: "0",
          msg: "删除成功",
          result: 'suc'
        })
      }
    }

  })
})

//修改商品数量
router.post("/cartEdit", function (req, res, next) {
  var userId = req.cookies.userId,
    productId = req.body.productId,
    productNum = req.body.productNum,
    checked = req.body.checked;
  User.update({
    'userId': userId,
    'cartList.productId': productId
  }, {
    "cartList.$.productNum": productNum,
    "cartList.$.checked": checked
  }, function (err, doc) {
    if (err) {
      res.json({
        status: "1",
        msg: err.message,
        result: ""
      });
    } else {
      res.json({
        status: "0",
        msg: "编辑成功",
        result: 'suc'
      })

    }

  })
})

//修改全部商品
router.post("/editCheckAll", function (req, res, next) {
  var userId = req.cookies.userId,
    checkAll = req.body.checkAll
  User.findOne({
    userId: userId
  }, function (err, user) {
    if (err) {
      res.json({
        status: "1",
        msg: err.message,
        result: ""
      });
    } else {
      if (user) {
        user.cartList.forEach(item => {
          item.checked = checkAll;
        });
        user.save(function (err1, doc) {
          if (err1) {
            res.json({
              status: "1",
              msg: err1.message,
              result: ""
            })
          } else {
            res.json({
              status: "0",
              msg: "",
              result: 'suc'
            })
          }
        })
      }
    }
  })
})

// 查询用户地址
router.get("/addressList", function (req, res, next) {
      var userId = req.cookies.userId
      User.findOne({
          userId: userId
        }, function (err, doc) {
          if (err) {
            res.json({
              status: "1",
              msg: err.message,
              result: ""
            });
          } else {
            res.json({
              status: "0",
              msg: "",
              result: doc.addressList
            })
          }
        })
      })

// 设置默认地址接口
router.post("/setDefault", function (req, res, next) {
  var userId = req.cookies.userId,
  addressId = req.body.addressId;
  if(!addressId){
    res.json({
      status: "1003",
      msg: 'addressId is null',
      result: ""
    });
  }else{
    User.findOne({
      userId: userId
    }, function (err, doc) {
      if (err) {
        res.json({
          status: "1",
          msg: err.message,
          result: ""
        });
      } else {
        var addressList = doc.addressList;
        addressList.forEach((item)=>{
          if(item.addressId == addressId){
            item.isDefault = true;
          }else{
            item.isDefault = false;
          }
        });
        doc.save(function(err1,doc1){
          if (err1) {
            res.json({
              status: "1",
              msg: err1.message,
              result: ""
            });
          }else{
            res.json({
              status: "0",
              msg: '',
              result: "设置默认地址成功"
            });
          }
        })
        // res.json({
        //   status: "0",
        //   msg: "",
        //   result: doc.addressList
        // })
      }
    })
  }
  
  })

// 地址删除
router.post("/delAddress", function (req, res, next) {
  var userId = req.cookies.userId,
  addressId = req.body.addressId;
  User.update({
    'userId': userId
  }, {
    $pull: {
      'addressList': {
        "addressId": addressId
      }
    }
  }, function (err, doc) {
    if (err) {
      res.json({
        status: "1",
        msg: err.message,
        result: ""
      });
    } else {
        res.json({
          status: "0",
          msg: "删除成功",
          result: 'suc'
        })
    }

  })
})

// 订单确认
router.post("/payMent", function (req, res, next) {
  var userId = req.cookies.userId,
  orderTotal = req.body.orderTotal,
  addressId = req.body.addressId;
  User.findOne({
    userId: userId
  }, function (err, doc) {
    if (err) {
      res.json({
        status: "1",
        msg: err.message,
        result: ""
      });
    } else{
      // 获取用户地址信息
      var address = "",goodsList=[]
      doc.addressList.forEach((item)=>{
        if(addressId==item.addressId){
          address = item;
        }
      })
      // 获取用户购物车购买的商品
      doc.cartList.forEach((item)=>{
        if(item.checked == '1'){
          goodsList.push(item)
        }
      })

      var platform = '622';//设置平台码
      var r1 = Math.floor(Math.random()*10);
      var r2 = Math.floor(Math.random()*10);
      var sysDate = new Date().Format('yyyyMMddmmss');//系统时间
      var createDate = new Date().Format('yyyyMMddmmss');//订单生成时间
      var orderId = platform + r1 + sysDate+r2


      var order = {
        orderId:orderId,
        orderTotal:orderTotal,
        addressInfo:address,
        goodsList:goodsList,
        orderStatus:1,
        create:createDate
      }

      doc.orderList.push(order);
      doc.save(function(err1,doc1){
        if (err1) {
          res.json({
            status: "1",
            msg: err1.message,
            result: ""
          })
        }else{
          res.json({
            status: "0",
            msg: '',
            result: {
              orderId:order.orderId,
              orderTotal:order.orderTotal
            }
          })
        }
      })
    }
  })
})

// 根据订单id查询订单信息
router.get("/orderDetail", function (req, res, next) {
  var userId = req.cookies.userId,
  orderId = req.param("orderId"); //get请求的请求参数
  User.findOne({
    userId: userId
  }, function (err, userInfo) {
    if (err) {
      res.json({
        status: "1",
        msg: err.message,
        result: ""
      });
    } else {
      var orderList = userInfo.orderList;
      if(orderList.length>0){
        var orderTotal = '';
        orderList.forEach((item)=>{
          if(item.orderId == orderId){
            orderTotal = item.orderTotal
          }
        })
        if(orderTotal>0){
          res.json({
            status: "0",
            msg: '',
            result: {
              orderId:orderId,
              orderTotal:orderTotal
            }
          });
        }else{
          res.json({
            status: "120002",
            msg: '无此订单',
            result: ""
          });
        }
       

      }else{
        res.json({
          status: "120001",
          msg: '当前用户未创建订单',
          result: ""
        });
      }



    }
  })

})

    module.exports = router;
