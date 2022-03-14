// const { Socket } = require("socket.io")
var socket = io('http://localhost:3000')
var user;
// 选择头像
$("#login_avatar li").on("click", function () {
  $(this)
    .addClass("now")
    .siblings()
    .removeClass("now")
})

// 点击登录
$("#loginBtn").on("click", function () {
  var username = $("#username").val().trim()
  if (username) {
    var img = $("#login_avatar .now img").attr("src")
    socket.emit("login", {
      username,
      img
    })
  } else {
    alert("请输入用户名")
  }
})

socket.on("loginSuccess", data => {
  console.log(data)
  user = {...data}
  $(".login_box").fadeOut()
  $(".container").fadeIn()
  $(".avatar .avatar_url").attr("src", data.img)
  $(".info .username").text(data.username)
})
socket.on("loginError", data => {
  console.log(data)
})
// 监听广播的系统消息
socket.on("addUser", username => {
  $(".box-bd").append(`
    <div class="system">
      <p class="message_system">
        <span class="content">${username}加入了群聊</span>
      </p>
    </div>
  `)
  scrollBottom()
})
// 监听广播消息用户列表
socket.on("userList", user => {
  $(".user-list ul").html("")
  user.forEach(item => {
    $(".user-list ul").append(`<li class="user">
      <div class="avatar"><img src="${item.img}" alt="" /></div>
      <div class="name">${item.username}</div>
    </li> `)
  });
  $("#userCount").text(user.length)
})
// 用户离开
socket.on("delUser",data=>{
  $(".box-bd").append(`
    <div class="system">
      <p class="message_system">
        <span class="content">${data.username}离开了群聊</span>
      </p>
    </div>
  `)
  scrollBottom()
})
// 用户发送消息
$("#btn-send").on("click",()=>{
  var content = $("#content").html()
  $("#content").html("")
  if (!content) return alert("请输入消息")
  socket.emit("sendMsg",{
    ...user,
    msg:content
  })
})
// 接收消息
socket.on("message",data=>{

  if (data.username == user.username){
    $(".box-bd").append(`
      <div class="message-box">
        <div class="my message">
          <img class="avatar" src="${data.img}" alt="" />
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">${data.msg}</div>
            </div>
          </div>
        </div>
      </div>
    `)
  }else{
    $(".box-bd").append(`
      <div class="message-box">
        <div class="other message">
          <img class="avatar" src="${data.img}" alt="" />
          <div class="content">
            <div class="nickname">${data.username}</div>
            <div class="bubble">
              <div class="bubble_cont">${data.msg}</div>
            </div>
          </div>
        </div>
      </div>
    `)
  }
  scrollBottom()
})
// 滚动到底部
function scrollBottom(){
  $(".box-bd").children(":last").get(0).scrollIntoView(false)
}
// 发送图片
$("#file").on("change",function(){
  let file = this.files[0]
  console.log(file)
  let fr = new FileReader()
  fr.readAsDataURL(file)
  fr.onload = function(){
    // 向服务器发送图片数据
    socket.emit("sendImg",{
      ...user,
      imgData:fr.result
    })
  }
})
// 监听图片消息
socket.on("img",function(data){
  if (data.username == user.username){
    $(".box-bd").append(`
      <div class="message-box">
        <div class="my message">
          <img class="avatar" src="${data.img}" alt="" />
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">
                <img src="${data.imgData}" />
              </div>
            </div>
          </div>
        </div>
      </div>
    `)
  }else{
    $(".box-bd").append(`
      <div class="message-box">
        <div class="other message">
          <img class="avatar" src="${data.img}" alt="" />
          <div class="content">
            <div class="nickname">${data.username}</div>
            <div class="bubble">
              <div class="bubble_cont">
                <img src="${data.imgData}" />
              </div>
            </div>
          </div>
        </div>
      </div>
    `)
  }
  $(".box-bd img:last").on("load",()=>{
    scrollBottom()
  })
})
