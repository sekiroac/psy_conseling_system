import constant from '../../utils/constant';
import useChatEngine from '../../utils/useChatEngine';
const db = wx.cloud.database()
// TUIKitWChat/Conversation/index.js
const app = getApp();

Component({
  /**
   * 组件的初始数据
   */
  data: {
    conversationList: [],
    currentConversationID: '',
    showSelectTag: false,
    array: [
      { id: 1, name: '客服号' },
      { id: 2, name: '发起会话' },
      { id: 3, name: '发起群聊' },
      { id: 4, name: '加入群聊' },
    ],
    index: Number,
    unreadCount: 0,
    conversationInfomation: {},
    transChenckID: '',
    userIDList: [],
    statusList: [],
    currentUserIDList: [],
    showConversationList: true,
    showCreateConversation: false,
    showCreateGroup: false,
    showJoinGroup: false,
    showContact: false,
    handleChangeStatus: false,
    storageList: [],
    showConversation: false,
    isInit: false,
    isExistNav: false,
    editMode: false,
    tempInfo: {},
    List:[],
    List2:[],
    name:"",
    account:""
  },
  lifetimes: {
    detached() {
      wx.$TUIKit.off(wx.TencentCloudChat.EVENT.CONVERSATION_LIST_UPDATED, this.onConversationListUpdated, this);
      wx.$TUIKit.off(wx.TencentCloudChat.EVENT.USER_STATUS_UPDATED, this.onUserStatusUpdate, this);
      this.setData({
        isInit: false,
      });
    },
    attached(){
    this.setData({
      name:app.globalData.name,
      account:app.globalData.account,
      ava:app.globalData.ava,
      showSelectTag:true

    })
    this.initData();
    var time1 =new Date().toJSON().substring(0, 4)+new Date().toJSON().substring(5, 7)+new Date().toJSON().substring(8, 10)
    console.log(time1)
    db.collection('con_arrangement').where({
      date: time1
    }).get({
      success: res => {
        const conIds = [...new Set(res.data.map(item => item.con_id))];
        const tempList = [];
        let completedCount = 0;
    
        conIds.forEach(conId => {
          db.collection('consultant').where({
            con_id: conId
          }).get({
            success: res => {
              tempList.push(...res.data); // 合并查询结果
              if (++completedCount === conIds.length) {
                this.setData({ List2: tempList });
              }
            },
            fail: err => {
              console.log('查询失败', conId, err);
              if (++completedCount === conIds.length) {
                this.setData({ List2: tempList });
              }
            }
          });
        });
      },
      fail: err => {
        console.log('排班表查询失败', err);
      }
    });
  




    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    gotologin:function(){
      wx.navigateTo({
        url: '/pages/login/login/login',
      })
    },
  
    initData() {
      const globalData = getApp().globalData;
      this.setData({
        tempInfo: {...globalData.userInfo}
      });
    },
  
    toggleEdit() {
      if (!this.data.editMode) {
        this.setData({ editMode: true });
      }
    },
  
    onInput(e) {
      const field = e.currentTarget.dataset.field;
      this.setData({
        [`tempInfo.${field}`]: e.detail.value
      });
    },
  
    saveInfo() {
      getApp().globalData.userInfo = {...this.data.tempInfo};
      this.setData({ editMode: false });
      wx.showToast({ title: '保存成功' });
    },
    init() {
      this.initEvent();
      this.setData({
        showConversation: true,
      });
      this.initUserStatus();
      this.setBackIcon();
      useChatEngine();
    },

    destroy() {
      this.setData({
        showConversation: false,
        isExistNav: false,
      });
    },

    initEvent() {
      if (!this.data.isInit) {
        wx.$TUIKit.on(wx.TencentCloudChat.EVENT.CONVERSATION_LIST_UPDATED, this.onConversationListUpdated, this);
        wx.$TUIKit.on(wx.TencentCloudChat.EVENT.USER_STATUS_UPDATED, this.onUserStatusUpdate, this);
        this.getConversationList();
        this.setData({
          isInit: true,
        });
      }
    },

    initUserStatus() {
      wx.getStorageInfo({
        success(res) {
          wx.setStorage({
            key: 'storageList',
            data: res.keys,
          });
        },
      });
      this.setData({
        handleChangeStatus: wx.getStorageSync(app?.globalData?.userInfo?.userID) ? wx.getStorageSync(app?.globalData?.userInfo?.userID) : true,
      }, () => {
        if (!wx.getStorageSync('storageList').includes('showOnlineStatus')) {
          this.handleChangeStatus();
        }
      });
    },

    setBackIcon() {
      const pages = getCurrentPages();
      const prevPages = pages[pages.length - 2];
      if (prevPages && prevPages.route) {
        this.setData({
          isExistNav: true,
        });
      }
    },

    goBack() {
      if (app.globalData && app.globalData.reportType !== constant.OPERATING_ENVIRONMENT) {
        wx.navigateBack();
      } else {
        wx.switchTab({
          url: '/pages/TUI-Index/index',
        });
      }
    },
    // 更新会话列表
    onConversationListUpdated(event) {
      this.handleConversationList(event.data);
    },
    getConversationList() {
      if (this.data.conversationList.length === 0) {
        wx.$TUIKit.getConversationList().then((imResponse) => {
          this.handleConversationList(imResponse.data.conversationList);
        });
      }
    },
    handleConversationList(conversationList) {
      this.setData({
        conversationList,
      });
      this.filterUserIDList(conversationList);
    },
    // 过滤会话列表，找出C2C会话，以及需要订阅状态的userIDList
    filterUserIDList(conversationList) {
      if (conversationList.length === 0) return;
      const userIDList = [];
      conversationList.forEach((element) => {
        if (element.type === wx.TencentCloudChat.TYPES.CONV_C2C) {
          userIDList.push(element.userProfile.userID);
        }
      });
      const currentUserID = wx.getStorageSync('currentUserID');
      if (currentUserID.includes(wx.$chat_userID)) {
        const currentStatus = wx.getStorageSync(wx.$chat_userID);
        if (currentStatus) {
          this.subscribeOnlineStatus(userIDList);
        }
      } else {
        this.subscribeOnlineStatus(userIDList);
      }
    },
    transCheckID(event) {
      this.setData({
        transChenckID: event.detail.checkID,
      });
    },
    // 更新状态
    onUserStatusUpdate(event) {
      event.data.forEach((element) => {
        const index = this.data.statusList.findIndex(item => item.userID === element.userID);
        if (index === -1) {
          return;
        }
        this.data.statusList[index] = element;
        this.setData({
          statusList: this.data.statusList,
        });
      });
    },
    // 跳转到子组件需要的参数
    handleRoute(event) {
      const flagIndex = this.data.conversationList.findIndex(item => item.conversationID === event.currentTarget.id);
      this.setData({
        index: flagIndex,
      });
      this.getConversationList();
      this.setData({
        currentConversationID: event.currentTarget.id,
        unreadCount: this.data.conversationList[this.data.index].unreadCount,
      });
      this.triggerEvent('createConversation', { currentConversationID: event.currentTarget.id,
        unreadCount: this.data.conversationList[this.data.index].unreadCount });
    },
    // 展示发起会话/发起群聊/加入群聊
    showSelectedTag() {
      this.setData({
        showSelectTag: !this.data.showSelectTag,
      });
    },
    handleOnTap(event) {
      console.log(event.currentTarget.dataset.userid)
      this.setData({
        showSelectTag: false,
      }, () => {
        console.log(event.currentTarget.dataset.id)
        this.triggerEvent('createConversation', {currentConversationID: `C2C${event.currentTarget.dataset.userid}`  });
      });
    },
    // 点击空白区域关闭showMore弹窗
    handleEditToggle() {
      this.setData({
        showSelectTag: false,
      });
    },
    toggleConversation() {
      this.setData({
        showConversationList: true,
        showCreateConversation: false,
        showCreateGroup: false,
        showJoinGroup: false,
        showContact: false,
      });
    },
    handleCreateConversation(event) {
      this.triggerEvent('createConversation', { currentConversationID: event.detail.currentConversationID });
    },
    // 处理当前登录账号是否开启在线状态
    handleChangeStatus() {
      const currentID = wx.$chat_userID;
      const cacheList = wx.getStorageSync('currentUserID');
      const nowList = [];
      nowList.push(wx.$chat_userID);
      if (cacheList.length === 0 || !cacheList.includes(wx.$chat_userID)) {
        wx.setStorage({
          key: 'currentUserID',
          data: wx.getStorageSync('currentUserID').concat(nowList),
        });
      }
      wx.setStorage({
        key: currentID,
        data: this.data.handleChangeStatus,
      });
    },
    // 订阅在线状态
    subscribeOnlineStatus(userIDList) {
      wx.$TUIKit.getUserStatus({ userIDList }).then((imResponse) => {
        const { successUserList } = imResponse.data;
        this.setData({
          statusList: successUserList,
        });
      })
        .catch((imError) => {
          console.warn('开启在线状态功能,' + '\n'
          + '1. 需要您开通旗舰版套餐：https://buy.cloud.tencent.com/avc ;' + '\n'
          + '2. 进入 IM 控制台开启“用户状态查询及状态变更通知”开关: https://console.cloud.tencent.com/im/login-message');
        });
      wx.$TUIKit.subscribeUserStatus({ userIDList });
    },
    learnMore() {
      if (app.globalData && app.globalData.reportType !== constant.OPERATING_ENVIRONMENT) return;
      wx.navigateTo({
        url: '/pages/TUI-User-Center/webview/webview?url=https://cloud.tencent.com/product/im',
      });
    },
  },
});
