/**
 * @Author: Jet.Chan
 * @Date:   2016-11-15T18:01:59+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2016-11-29T19:31:38+08:00
 */
import $ from 'jquery'
import 'babel-polyfill'
import aj from "../../util/ajaxHelper";

import "../../components/ueditor";

$(function() {
    //const ue = UE.getEditor('testdiv');
    console.log('document',this);
    $('#testdiv').click((eve) => {
        console.log(eve);
    })
})
// height: 100px;
// display: block;
// width: 100px;
// background-color: red;
// }


let a = "cao nima ",
    b = {
        sb: "enenenen",
        hello() {
            console.log('我的名字是', this.name);
        }
    }
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    say() {
        return `我是${this.name},我今年${this.age}岁了。`;
    }
}

$('#test').on('click', (event) => {
    alert('cao ni da ye')
})

const person = new Person("asd", "bbbb")
person.say()


//array class extends
class Random {
    constructor(...args) {
        const arr = Array.from([...args]);
        Object.setPrototypeOf(arr, this.constructor.prototype);
        return arr;
    }
    shuffle() {
        for (let i = this.length - 1; i >= 0; i--) {
            let randomIndex = Math.floor(Math.random() * (i + 1));
            let itemAtIndex = this[randomIndex];
            this[randomIndex] = this[i];
            this[i] = itemAtIndex;
        }
        return this
    }
}
const random = new Random(1, 2, 3, 4, 5, 6, 7, 8, 9);

console.log('random', random.shuffle().shuffle());


const sortRandom = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort((a, b) => Math.random() > .5 ? -1 : 1);
console.log('sortRandom', sortRandom)

//优化
function abc() {
    return Array.prototype.slice.call(arguments).map(function(item) {
        return item > 0 ? item + 10 : item = 1
    })
}

console.log(abc(1, 2, 3, 4, 5, 6, 7));

//工厂模式

function factory(a, b) {
    var obj = new Object();
    obj.a = a;
    obj.b = b;
    obj.loadNum = function functionName() {
        var Range = this.b - this.a;
        var Rand = Math.random();
        return (this.a + Math.round(Rand * Range));
    }
    return obj;
}
var test = new factory(1, 10);
console.log('loadNum', test.loadNum());

//递归

// function f(n) {
//     if (n == 1) return 0;
//
//     if (n == 2) return 1;
//
//     if (n == 3) return 2;
//
//     else return f(n - 1) + f(n - 2) + f(n - 3);
//
// }
// console.log(f(10));


//合并
// function testhebing(obj) {
//     var a = [{
//         key: 'a',
//         value: 1
//     }, {
//         key: 'b',
//         value: 2
//     }]
//     var res = new Object();
//     a.forEach((item) => {
//         res[item.key] = item.value
//     })
//     console.log('res', res);
// }
// testhebing();
// //数组合并
// var arrHebing = [
//     [4, 6, 5, 9],
//     ['2', '0', '8', '4'],
//     [1, 4, 0, 8],
//     ['2', '0', '8', '4', '6'],
// ]
//
// function merge(arr) {
//     var res = [];
//     var sortMerge =  Array.prototype.slice.call(arr).sort(function(a, b) {
//         return a.length
//     })
//     console.log('sortMerge[0].length', sortMerge);
//     for (var i = 0; i < sortMerge[0].length; i++) {
//         var itemArr = [];
//         for (var j = 0; j < arr.length; j++) {
//             itemArr.push(arr[j].length >= i ? arr[j][i] : 'undefind')
//         }
//         res.push(itemArr);
//     }
//     return res
// }
// merge(arrHebing)


const f = (n) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(123);
        }, n);
    });
};

const testAsync = async() => {
    const t = await f(10000);
    console.log(t);
    return t;
};

let t = testAsync();
// (async() => {
//     const resultaj = await aj.get({
//         url: '/api'
//     })
//     console.log("1",resultaj);
//     const resultaj1 = await aj.get({
//         url: '/api'
//     })
//     console.log("2",resultaj1);
//     const resultaj2 = await aj.get({
//         url: '/api'
//     })
//     console.log("3",resultaj2);
// })()
