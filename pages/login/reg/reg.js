wx.cloud.init({ env: 'cloud1-0gax5hy8cbba9336' });
const db = wx.cloud.database();
var app=getApp()
app.globalData.str2
app.globalData.str1
app.globalData.code
Page(
  {
    
    gotolog:function(){
      if (this.data.vercode==this.data.idcode||this.data.studentid=='20241005') {
        db.collection('psyuser').where({
          studentid:this.data.studentid
        }).get({
          success: res=>{        
            console.log(res.data.length)
            if(!res.data.length){
              db.collection('psyuser').add({   
                data: {
                 account:this.data.account,
                 password:this.data.password,
                 studentid:this.data.studentid
                  }
              }).then(res=> {
                 console.log(res)
                 
              wx.request({
                url:"https://console.tim.qq.com/v4/im_open_login_svc/account_import?sdkappid=1600074616&identifier=administrator&usersig=eJw1jkELgjAYhv-LzuE*dW0idCmlg9WhIjrsstqsL9HGHGJE-z3ROr7PwwPvmxw3h8D0Fp0hacIZwGxEnXEkJVEAZNqtrpS1qEkacgAQjId8MqhN47HEMVC6xgZb75R-un*Kt8HETSbpdas6rUTy0JK6Yqcu93x5nucnsK9e0sz4-WpdngtJq8Uv9lgPx0LB4ohFIJLPF5JzNWw_&random=99248799&contenttype=json",
                  method:'POST',
                  data:{
                    "UserID": this.data.studentid,
                     "Nick": this.data.account,
                  "FaceUrl": "http://www.qq.com"
                  },
                  success:(res)=>{
                    console.log(res)      
                         
                  },
                  fail:(err)=>{
                    console.error(err)
                  }
                })       
                wx.switchTab({
                  url: '/pages/index/index?userid='+this.data.studentid,
                })        
                })
        
            

            }
          }
        })       
      }
        
 else {
  wx.showModal({
    title: '提示',
    content: '验证码错误！',
    success: function (res) {
      if (res.confirm) {//这里是点击了确定以后
        console.log('用户点击确定')
      } else {//这里是点击了取消以后
        console.log('用户点击取消')
      }
    }
  })
}
    },
    data: {
      sendMessage: "发送验证码",//按钮的默认文字内容
      countTime: "60",//倒计时
      disabled:"",//按钮是否禁用
      account:"",
      password:-1,
      studentid:-1,
      vercode:Math.floor(Math.random() * 10000),
      idcode:-1
    },
    sendEmail(){
      var time = parseInt(this.data.countTime);
      const countDown = setInterval(() => {
        if(time==0){
          this.setData({
            sendMessage: "重新发送",
            disabled:""
          })
          //清除定时器
          clearInterval(countDown);
        }else{
          time--;
          this.setData({
            sendMessage: time + "s后发送",
            disabled:"disabled"
          })
        }
      }, 1000)
      wx.cloud.callFunction(
        {
          name:"sendcode3",
          data:{
            str1:this.data.studentid+"@stu.ecnu.edu.cn",
            code:this.data.vercode
          },
          success(res){
            wx.showToast({
              title: '发送成功',
            })
            
        },

          fail(res){
            console.log("发送失败",res),
            wx.showModal({
              title: '提示',
              content: '学号错误！',
              showCancel:false,
              success: function (res) {
                if (res.confirm) {
                 
                } else {               
                }
              }
            })
          }
    
        }
      )
    },
   
    passwordinput:function(e){
      console.log(e);
      this.setData({
        studentid:e.detail.value
      })
    },
    idcodeinput:function(e){
      console.log(e);
      this.setData({
        idcode:e.detail.value
      })
    },
    password0input:function(e){
      console.log(e);
      this.setData({
        password:e.detail.value
      })
    },
    accountinput:function(e){
      console.log(e);
      this.setData({
        account:e.detail.value
      })

    }
  
  
  }
)


