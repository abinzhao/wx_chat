import Vue from 'vue'
import Vuex from 'vuex'
import ws from '@/net/socket'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    // 用户信息
    user: {
      username: '',
      uid: ''
    },
    // 在线用户
    userList: [],
    // 当前窗口信息
    currentChat: {
      who: 'all',
      name: '群聊'
    },
    // 输入名称控制
    mask: true,
    isNeedPush: 0, // 控制了解界面刷新显示消息
    // 未读信息记录, 数组简单处理 
    noRead: []
  },
  getters: {
  },
  mutations: {
    // 初始化连接 注册
    initConn (state, callback) {
      const u = {
        event: 'reg',
        from: state.user.uid,
        username: state.user.username,
        to: 'all',
        data: state.user.username + '上线啦'
      }
      ws.open(u);
      ws.message((msg)=>{
        msg = JSON.parse(msg);
        if (msg.event == 'msg') {
          // 消息
          callback(msg);
        }
        else if (msg.event == 'user') {
          //用户列表信息
          if (state.userList != msg.data) {
            state.userList = msg.data;
          }
          
        }
      }); 
    },

    // 消息推送
    send (state, conf) {
      let _conf = {
        event: 'msg',
        from: state.user.uid,
        username: state.user.username,
        to: 'all',
        data: ''
      };
      _conf = Object.assign(_conf, conf);
      ws.send(_conf);
    },

    // 保存聊天记录 sessionStorage.historyChat
    addChatStorage(state, info) {
      let hc = (sessionStorage.historyChat && JSON.parse(sessionStorage.historyChat)) || {};
      const _ct = {
        sendobj: info.sendobj,   // 谁发的
        content: info.content,  // 发送内容
        username: info.username, //发送人名称
        // 聊天窗口对象
        window: info.window,
        date: Number(new Date())
      }
      // 聊天记录对应某个聊天窗口对象
      if (!hc[_ct.window]) {
        hc[_ct.window] = [];
      }
      hc[_ct.window].push(_ct);
      sessionStorage.historyChat = JSON.stringify(hc);
    },

    /**
     * 新消息提示
     */
    newMsg (state, cwindow) {
       // 先判断 如果是当前窗口，直接更新 无需加入新消息提示数组
       if (cwindow == state.currentChat.who) {
        state.isNeedPush++; //改变即可
       } else {
        // 没有则加入提示数组
        if (!state.noRead.includes(String(cwindow))) {
          state.noRead.push(String(cwindow));
        }
       }
    },

    /**
     * 取消某个消息提示红点
     */
    deleteNewMsg (state, cwindow) {
      cwindow = String(cwindow);
      const index = state.noRead.indexOf(cwindow);
      if (index > -1) {
          state.noRead.splice(index, 1);
      }
    }
  },
  actions: {
  }
});

export default store;
