<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: normal;
  font-weight: 400;
  font-size: 13px;
  color: #fff;
  line-height: 20px;
}
.current {
  background-color: #3a3f45;
}
.chat-item {
  display: flex;
  height: 40px;
  padding: 12px 18px; 
  cursor: pointer;
  .avatar {
    width: 50px;
    img {
      width: 40px;
      height: 40px;
      border-radius: 3px;
    }
  }
  .new-msg {
    position: relative;
    &:after {
      content: '';
      border: 5px solid red;
      position: absolute;
      top: -5px;
      right: 5px;
      border-radius: 50%;
    }
  }
  .name {
    &:extend(.text);
  }
}
</style>

<template lang="pug">
div.chat-item(:class="{'current': isCurrent}")
  div.avatar(:class="{'new-msg': isHasNewMsg}")
    img(src="@/assets/img/default_hd.jpg")
  div.name
    slot
</template>

<script>
export default {
  name: 'ChatItem',
  props: {
    id: String
  },
  data () {
    return {
    }
  },
  computed: {
    // 是否当前
    isCurrent() {
      return this.$store.state.currentChat.who == this.id;
    },
    // 是否显示消息小红点
    isHasNewMsg () {
      return this.$store.state.noRead.includes(String(this.id));
    }
  }
}
</script>
