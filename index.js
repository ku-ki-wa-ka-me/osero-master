const express = require("express");
const http = require("http");
const path = require("path");
const socketIO = require("socket.io");
const fs = require('fs')
const https = require('https')

const random = require('./modules/random');
const gamedate = require('./modules/gameclass');

const app = express();
const server = require('http').createServer(app);
const io = socketIO.listen(server);

const index = require('./routes/index');
const game = require('./routes/game');
const matting = require('./routes/matting');
const javascripts = require('./routes/javascripts');
const csses = require('./routes/csses');
    
app.use('/', index);
app.use('/game', game);
app.use('/matting', matting);
app.use('/js', javascripts);
app.use('/css', csses);


server.listen(3000, function () {
    console.log("Starting server on port 3000");
});

let games = {};//ゲーム管理用のオブジェクトを補完します
let matti = [];//待機中の人のsocket idを補完します。
let gameid = 0;
let temp;

io.on('connection', function (socket) {
    let id = socket.id;
    let room = '';
    socket.on('newgame', function () {//誰かがマッチングし始めたら
        matti.push(id);//待機中の人のsocket idを配列に追加します。

        if (matti.length == 2) {//二人そろったら
            gameid = random();//ゲームidを作成
            games[gameid] = new gamedate(gameid);//ゲーム管理用のクラスを作成
            io.to(matti[0]).emit('ready', gameid);//待機中の人にゲーム開始を知らせます。
            io.to(matti[1]).emit('ready', gameid);
            matti = [];//配列を初期化します
        }

    });

    socket.on('ready', function (id) {//プレイやーがじゅんびかんりょうした時

        let role;//英語で役
        room = id;
        if (!games[id].playerA) {//白がまだいなければ
            games[id].playerA = socket.id;//プレイヤーを白に設定
            role = "白";
        } else if (!games[id].playerB) {
            games[id].playerB = socket.id;
            role = "黒";
        } else {//すでに黒も白も埋まっていたら観戦者にする
            role = "観戦者";
        }

        games[id].users.push[id]
        var obj = {//プレイヤーに送信するデータを作成
            turn: games[id].turn,
            ban: games[id].ban,
            role: role,
            name: "name"
        }
        socket.join(room);//プレイヤーをルームに入れる
        io.to(socket.id).emit('ban', obj);//データを送信
    });

    socket.on('put', function (obj) {//プレイヤーから置く場所が送られてきたとき
        //明らかに駒を置けないデータをはじく
        if (!games[obj.gameid]) return;
        console.log("put," + obj)
        if (games[obj.gameid].playerA != id && games[obj.gameid].playerB != id) return;
        if (games[obj.gameid].playerA != id && games[obj.gameid].turn == -1) return;
        if (games[obj.gameid].playerB != id && games[obj.gameid].turn == 1) return;
        //
        var msg = games[obj.gameid].put(obj.y, obj.x);//駒を置いてメッセージを受け取る

        var date = {//プレイヤーに送信するデータを作成
            turn: games[obj.gameid].turn,
            ban: games[obj.gameid].ban,
            msg: msg
        }
        io.to(obj.gameid).emit('ban', date);//プレイヤーにデータを送信
    });
   
    socket.on('chat', function (msg) {
        if (msg) {
            io.to(room).emit('chat', socket.userName + ': ' + msg);
        }
    });

    socket.on('setUserName', function (userName) {
        if (!userName || userName == null) userName = '匿名';

        socket.userName = userName;
        socket.to(room).emit("chat", socket.userName + "が入ったようだ ");
    });

    socket.on("disconnect", function () {//待機中のプレイヤーが抜けたときの処理
        temp = matti.indexOf(id);
        if (temp > -1) matti.splice(temp, 1);
    });
});
