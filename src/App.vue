<style>
  @import "./assets/font/iconfont.css";
.topnav_box::-webkit-scrollbar
{  
  width: 5px; 
  height:10px;
  background-color:#aaa;
}
.topnav_box::-webkit-scrollbar-track
{  
  -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
  border-radius: 10px; 
  background-color:#eee;
}
.topnav_box::-webkit-scrollbar-thumb
{  
  border-radius: 10px;  
  -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
  background-color:#aaa;
}
</style>
<style lang="less" scoped>
  @import "./assets/css/app";
</style>

<template lang="pug">
div(id="app")
  div(id="mask" v-if="$store.state.mask")
    div(class="panel")
      div 快帮自己取个名字吧。
      div
        input(type="text" v-model="$store.state.user.username" maxlength="6")
      div(class="ok")
        span(@click="ok") 确定
  div(class="main")
    div(class="main-inner")
      // 左边栏
      div(class="sd")
        // 头部
        div(class="m-hd")
          div(class="header")
            div(class="avatar")
              img(src="@/assets/img/default_hd.jpg")
            div(class="info")
              div(class="name") {{ $store.state.user.username }}
              div(class="menu")
                i(class="iconfont icon-menu")
          div(class="search")
            i(class="iconfont icon-sousuo u-search")
            input(type="text" placeholder="搜索")
          ul(class="m-tab")
            li(class="current")
              i(class="iconfont icon-liaotian")
            li
              i(class="iconfont icon-yuedu")
            li
              i(class="iconfont icon-tongxunlu")
        // 列表
        div(class="m-lst-box topnav_box")
          div(class="m-lst")
            template
              ChatItem(:id="'all'" @click.native="tapChat('all', '群聊')") 群聊
            template(v-for="x in activeUsers")
              chat-item(:id="x.uid" @click.native="tapChat(x.uid, x.username)") {{ x.username }}
      div(class="chat-box")
        router-view
</template>

<script>
import ChatItem from '@/components/ChatItem'

export default {
  name: 'App',
  components: {
    ChatItem
  },

  mounted () {
    //初始化用户信息
    let user = localStorage.user;
    if (user) {
      this.$store.state.user = JSON.parse(user);
      // 有历史直接初始化
      this.$store.commit('initConn', this.msgCallback)
      this.$store.state.mask = false;
    } else {
      this.$store.state.user.uid = Number(new Date());
    }
  },

  computed: {
    // 写成计算属性 排除本身 效率更高
    activeUsers () {
      return this.$store.state.userList.filter( user=> {
        return user.uid != this.$store.state.user.uid;
      })
    }
  },

  methods : {
    /**
     * 服务器msg消息返回处理回调函数
     */
    msgCallback(msg) {
      // console.log(msg)
      // 直接将聊天记录存储
      const ct = {
        sendobj: msg.from,
        content: msg.data,
        username: msg.username,
        window: msg.to == 'all' ? 'all' : msg.from,
      };
      this.$store.commit('addChatStorage', ct);
      // 之后更新新消息提示
      this.$store.commit('newMsg', ct.window);
    },

    /**
     * 未有在服务器注册过的输入名称注册
     */
    ok () {
      this.$store.state.user.username = this.$store.state.user.username.replace(/^\s*/g,'').replace(/\s*$/g, '').substr(0, 8);
      if (this.$store.state.user.username == '') {
        return;
      }
      const u = {
        'uid': this.$store.state.user.uid,
        'username': this.$store.state.user.username
      }
      localStorage.user = JSON.stringify(u);
      // 初始化连接信息 msg类型信息接收函数注册
      this.$store.commit('initConn', this.msgCallback)
      this.$store.state.mask = false;
    },

    /**
     * 选择聊天对象
     */
    tapChat (who, name) {
      this.$store.state.currentChat = {
        who: who,
        name: name
      };
      // 如果有新消息红点 则取消
      this.$store.commit('deleteNewMsg', who);
    }
  }
}
</script>
