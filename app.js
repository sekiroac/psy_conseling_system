
App({
 
  onLaunch: function () {
   
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
env:'cloud1-0gax5hy8cbba9336',
traceUser:true
        
      });
    }

  
    this.globalData={
      str2:"",
      str1:"",
      code:Math.floor(Math.random() * 10000),
      userName:"",
      gender:"",
      institute:"",
      number:"",
      phonenumber:"",
      date:20241018, 
      name: "",       
      account: "",     
      ava:"cloud://cloud1-0gax5hy8cbba9336.636c-cloud1-0gax5hy8cbba9336-1324233855/1712477262943.png"
    }
  },
  
});
