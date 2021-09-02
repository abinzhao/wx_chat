<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@import "../assets/css/chat_area";
</style>

<template lang="pug">
div.chat-area
  div.box-hd
    div.title {{ whoName }}

  div.chat-bd.topnav_box(ref="chatbox")
    div.empty(v-if="currentChatList.length == 0") 暂时没有新消息
    //- div.msg-item.msg-item-left.clearfix(v-for="x in '123'")
    //-   div.nt-item
    //-     img.image(src="@/assets/img/default_hd.jpg")
    //-     div.content 可垃圾咯啦咯啦咯啦咯啦咯啦咯啦咯火辣辣啦啦啦啦啦啦啦啦芭芭拉巴巴爸爸火辣辣啦啦啦啦啦啦啦啦芭芭拉巴巴爸爸
    //- div.msg-item.msg-item-right.clearfix(v-for="x in '123'")
    //-   div.nt-item
    //-     div.content 可垃圾咯啦可垃圾咯啦咯啦咯啦咯啦咯啦咯啦咯火辣辣啦啦啦啦啦啦啦啦芭芭拉巴巴爸爸火辣辣啦啦啦啦啦啦啦啦芭芭拉巴巴爸爸
    //-     img.image(src="@/assets/img/default_hd.jpg")
    template(v-for="x in currentChatList")
      div.msg-item.clearfix.msg-item-left(v-if= "x.sendobj != 'me'")
        div.nt-item
          img.image(src="@/assets/img/default_hd.jpg")
          div 
            div.show-name(v-if="who=='all'") {{ x.username }}
            div.content(v-html="x.content")
      div.msg-item.msg-item-right.clearfix(v-else="")
        div.nt-item
          div.content(v-html="x.content")
          img.image(src="@/assets/img/default_hd.jpg")
  div.m-ft
    ul.tool-tab
      li
        i.iconfont.icon-face
      li
        i.iconfont.icon-cut
      li
        i.iconfont.icon-file
    div.content
      div.input(contenteditable="true" ref="input" @keyup.ctrl.enter="send")

    div.action
      span.notice 按ctrl+enter发送
      a.u-send(href="javascript:void(0)" @click="send") 发送
</template>

<script>
import ws from '@/net/socket'
export default {
  name: 'ChatArea',
  data () {
    return {
      currentChatList: [], // 聊天记录
    }
  },
  // 监听器 用于监听何时该刷新数据
  watch: {
    // 输入名称后刷新 貌似不需要 此时并没有聊天数据
    // '$store.state.mask':{
    //   handler(curVal,oldVal){
    //     //监听变量变化，发送请求
    //     this._resetCurrentChatStorage();
    //   },
    //   // deep:true
    // },
    // 改变聊天对象
    '$store.state.currentChat.who': {
      handler(curVal, oldVal) {
        this._resetCurrentChatStorage();
      }
    },
    // 控制刷新 新消息时
    '$store.state.isNeedPush': {
      handler(curVal, oldVal) {
        this._resetCurrentChatStorage();
      }
    }
  },
  // 增加两个计算属性 方便处理
  computed: {
    who () {
      return this.$store.state.currentChat.who;
    },
    whoName() {
      return this.$store.state.currentChat.name;
    }
  },
  methods: {
    /**
     * 发送消息
     */
    send () {
      let content = this.$refs.input.innerHTML;
      content = content.replace(/^\s*/g,'').replace(/\s*$/g, '').substr(0, 200); // max 最大发送200
      if (!content) {
        return;
      }
      const conf = {
        to: this.who, //发送给当前窗口聊天对象
        data: content,
      };
      this.$store.commit('send', conf)
      // 保存聊天记录 sessionStorage.historyChat
      this.$store.commit('addChatStorage', {
        content,
        sendobj: 'me', //代表自己发的
        username: this.$store.state.user.username, //发送人名称
        // 聊天窗口对象
        window: this.who
      });
      // 重新初始化 再清空输入框
      this._resetCurrentChatStorage();
      this.$refs.input.innerHTML = '';
    },

    /**
     * 重新初始化聊天界面 获取聊天记录
     */
    _resetCurrentChatStorage () {
      const hc = (sessionStorage.historyChat && JSON.parse(sessionStorage.historyChat)) || {};
      this.currentChatList = hc[this.who] ? hc[this.who] : [];
      // 同时将滚动条放置聊天底部 这里要延时才行，原因不明
      setTimeout(()=> {
        this.$refs.chatbox.scrollTop = this.$refs.chatbox.scrollHeight;
      }, 10);
    }
  },
  // 页面初始化
  mounted () {
    this._resetCurrentChatStorage();
  }
}
</script>
