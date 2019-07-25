Function.prototype.call = function () {
    // thisArg表示this绑定的对象,args表示参数
    let [thisArg,...args] = [...arguments];
    if(!thisArg) {
        //如果绑定的对象为null或者undefined
        thisArg = typeof window === 'undefined' ? global : window;
    } 
    //this(要执行的函数)的指向是当前函数 func (func.call)
    thisArg.func = this;
    //执行函数
    let result = thisArg.func(...args);
    delete thisArg.func;//thisArg上并没有 func 属性，因此要移除
    return result;
}

Function.prototype.applay = function (thisArg,rest) {
    // 函数返回结果
    let result;
    if(!thisArg) {
        //如果绑定的对象为null或者undefined
        thisArg = typeof window === 'undefined' ? global : window;
    } 
    //this(要执行的函数)的指向是当前函数 func (func.call)
    thisArg.func = this;
    if(!rest) {
        //第二个参数为null,undefined
        result = thisArg.func();
    }else {
        //把参数进行展开为数组的形式
        result = thisArg.func(...rest);
    }
    //thisArg上并没有 func 属性，因此要移除
    delete thisArg.func;
    return result;
}

const curry = (fn,...args) =>{
    args.length < fn.length ?
    //参数长度不足时，重新柯里化该函数，等待接收新参数
      (...arguments) =>{
          curry(fn,...args,...arguments)
      }:
    // 参数足够时，直接执行该函数  
      fn(...args)
}

function sumFn(a,b,c) {
    return a + b + c;
}
var sum = curry(sumFn);
console.log(sum(2)(3)(5));
console.log(sum(2,3,5));
console.log(sum(2),(3,5));
console.log(sum(2,3)(5));