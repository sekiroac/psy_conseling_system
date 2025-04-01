var app=getApp()
const db = wx.cloud.database();
Page({
  data:{
    password:"",
    str1:"",
    str2:"",
    account:"",
    userid:""
  },
  passwordinput:function(e){
    console.log(e);
    this.setData({
      str2:e.detail.value
    })
  },
  accountinput:function(e){
    console.log(e);
    this.setData({
      account:e.detail.value
    })
  },
  gotolog:function()
  {
    db.collection('psyuser').where({
      account:this.data.account
    }).get().then(res => {
      console.log('数据查询成功',res)//将返回值存到res里
      this.setData({
        password: res.data[0].password,
        userid:res.data[0].studentid
      })
      if(this.data.password==this.data.str2){
        app.globalData.name=this.data.userid
        app.globalData.account=this.data.account
        console.log(app.globalData.account)
        console.log(app.globalData.name)
        wx.switchTab({
          url: '/pages/index/index?userid='+this.data.userid,
        })

      }else{
        wx.showModal({
          title: '错误！',
          content: '账号或密码错误',
          complete: (res) => {
            if (res.cancel) {
              
            }
        
            if (res.confirm) {
              
            }
          }
        })
      }

    }).catch(err => {
      console.log('查询失败',err)//失败提示错误信息
      wx.showModal({
        title: '错误！',
        content: '账号或密码错误',
        complete: (res) => {
          if (res.cancel) {
            
          }
      
          if (res.confirm) {
            
          }
        }
      })
    })



  },
  gotoreg:function(){
    wx.navigateTo({
      url: '/pages/login/reg/reg',
    })
  }

});
