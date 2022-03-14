const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path")

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

//express处理静态资源
//把public目录设置为静态资源
app.use(require('express').static(path.join(__dirname,'public')))
app.get('/', function(req, res) {
  res.redirect('/index.html')
})

var user = []
io.on("connection", (socket) => {
  console.log("连接成功")
  // 用户登录
  socket.on('login',function(data){
    var nameList = user.map(u=>u.username)
    if(nameList.indexOf(data.username)===-1){
      user.push(data)
      // 回复改用户登录成功
      socket.emit("loginSuccess",data)
      // 广播一条消息用户上线
      io.emit("addUser",data.username)
      // 返回新的用户列表
      io.emit("userList",user)
      socket.user = data
    }else{
      socket.emit("loginError","用户名已存在")
    }
  })
  // 用户离开
  socket.on("disconnect",()=>{
    user = user.filter(item=>{
      return item!==socket.user
    })
    io.emit("userList",user)
    io.emit("delUser",socket.user)
  })
  // 监听用户消息
  socket.on("sendMsg",data=>{
    io.emit("message",data)
  })
  // 监听用户图片消息
  socket.on("sendImg",data=>{
    io.emit("img",data)
  })

});

httpServer.listen(3000,()=>{
  console.log("3000端口启动成功")
});