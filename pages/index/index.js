import TencentCloudChat from '@tencentcloud/chat';
import TIMUploadPlugin from 'tim-upload-plugin';
import TIMProfanityFilterPlugin from 'tim-profanity-filter-plugin';
import { genTestUserSig }  from '../../TUIKit/debug/GenerateTestUserSig';
var app=getApp()
const db = wx.cloud.database();
Page({
    data: {
        config: {
            userID: app.globalData.name, //User ID
            SDKAPPID: 1600074616, // Your SDKAppID
            SECRETKEY: 'feddd069df90e49b8ac0d6fbe1dbe8efb282726e4361a802d70bde06a36b90a5', // Your secretKey
            EXPIRETIME: 604800,
        }
    },

    onLoad(query) {
      console.log(this.data.config.userID)
        const userSig = genTestUserSig(this.data.config).userSig 
        wx.$TUIKit = TencentCloudChat.create({
            SDKAppID: this.data.config.SDKAPPID
        })
        wx.$chat_SDKAppID = this.data.config.SDKAPPID;
        wx.$chat_userID = this.data.config.userID;
        wx.$chat_userSig = userSig;
        wx.TencentCloudChat = TencentCloudChat;
        wx.$TUIKit.registerPlugin({ 'tim-upload-plugin': TIMUploadPlugin });
        wx.$TUIKit.registerPlugin({ 'tim-profanity-filter-plugin': TIMProfanityFilterPlugin });
        wx.$TUIKit.login({
            userID: this.data.config.userID,
            userSig
        });
        wx.setStorage({
            key: 'currentUserID',
            data: [],
        });
        wx.$TUIKit.on(wx.TencentCloudChat.EVENT.SDK_READY, this.onSDKReady,this);
    },
    onUnload() {
        wx.$TUIKit.off(wx.TencentCloudChat.EVENT.SDK_READY, this.onSDKReady,this);
    },
    onSDKReady() {
        const TUIKit = this.selectComponent('#TUIKit');
        TUIKit.init();
    }
  });