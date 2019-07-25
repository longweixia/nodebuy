var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');//获取模型

// 连接mongodb数据库
mongoose.connect('mongodb://localhost:27017/demo',{useMongoClient:true})

mongoose.connection.on("connected",function(){
    console.log("mongodb连接成功")
})
mongoose.connection.on("error",function(){
    console.log("mongodb连接失败")
})
mongoose.connection.on("disconnected",function(){
    console.log("mongodb连接disconnected")
})
// 查询商品列表
router.get("/list",function(req,res,next){
    // 排序 
    // 获取请求参数
    let sort = req.param("sort");//排序标示
    let page = parseInt(req.param("page"));//第几页
    let pageSize = parseInt(req.param("pageSize"));//每页条数
    let priceLevel = req.param("priceLevel");//价格区间
    let skip = (page-1)*pageSize;//从第多少条数据查起
    var priceGT = '',priceLte = '';//定义mongodb的查询条件 
    let params = {};
    // 以价格来查询
    if(priceLevel!="all"){//如果是all的话，就不用处理，查所有的就行了
        switch (priceLevel){
            case '0': priceGT='0';priceLte=100;break;//传过来的价格位置0表示区间0-100
            case '1': priceGT='100';priceLte=500;break;//传过来的价格位置1表示区间100-500
            case '2': priceGT='500';priceLte=1000;break;
            case '3': priceGT='1000';priceLte=5000;break;
        }
        params = {
            salePrice:{
                $gt:priceGT,
                $lte:priceLte
            }
        }
    }
   
   
    // let goodsModel = Goods.find();//查找所有数据
    let goodsModel = Goods.find(params).skip(skip).limit(pageSize);//查哪页的数据
    goodsModel.sort({"salePrice":sort})



    goodsModel.exec({},function(err,doc){
        if(err){
            res.json({
                status:'1',
                msg:err.message
            });
        }else{
            res.json({
                status:'0',
                msg: '',
                result:{
                    count:doc.length,
                    list:doc
                }
            });
        }
    })
})

// 加入购物车
router.post("/addCart",function(req,res,next){
    var userId = "100000077",productId = req.body.productId //post请求需要这样拿数据
    var User = require('../models/user');//获取模型
    User.findOne({userId: userId},function(err,userDoc){//在数据库中查数据，查一个数据
        if(err){
            res.json({
                status:"1",
                msg:err.message
            })
        }else{
            console.log("userDoc:"+userDoc)
            if(userDoc){
                // 排除购物车重复的商品
                let goodsTtem="";
                userDoc.cartList.forEach(function(item){
                    if(item.productId==productId){
                        goodsTtem = item;
                        item.productNum ++;//相同的商品只需要把数量进行叠加就行了，不需要生成一条新的数据
                    }
                });
                if(goodsTtem){
                    userDoc.save(function(err2,doc2){
                        if(err2){
                            res.json({
                                status:"1",
                                msg:err2.message
                            })
                        }else{
                            res.json({
                                status:"0",
                                msg:"",
                                result:"suc"
                            })
                        }
                    })


                }else{//没有这个商品时，需要增加一条数据
                    Goods.findOne({productId:productId},function(err1,doc){//通过商品id查询商品
                        if(err1){
                            res.json({
                                status:"1",
                                msg:err1.message
                            })
                        }else{
                            if(doc){
                                doc.productNum = 1;//加一个字段
                                doc.checked = 1;//加一个字段
                                userDoc.cartList.push(doc);
                                userDoc.save(function(err2,doc2){
                                    if(err2){
                                        res.json({
                                            status:"1",
                                            msg:err2.message
                                        })
                                    }else{
                                        res.json({
                                            status:"0",
                                            msg:"",
                                            result:"suc"
                                        })
                                    }
                                })
                            }
                        }
    
    
                    });
                }
          
            }
        }
    })

})


module.exports = router;