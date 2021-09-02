const defaultData = {
  event: 'msg',
  from: '',
  username: '',
  to: "all",
  type: 'text',
  data: ''
}

class WSocket {
  wss;

  constructor() {
    if (!"WebSocket" in window) {
      alert("您的浏览器不支持 WebSocket!");
    }
  }

  open (c) {
    // 貌似不在短时间内调用onopen 会自动调用，所以在此处new
    try {
      this.wss = new WebSocket("ws://localhost:18081");
    } catch( err ) {
      alert('连接服务器失败');
    }
    c = Object.assign(defaultData, c);
    this.wss.onopen = function() {
      this.send(JSON.stringify(c));
    };
  }

  message (f) {
    this.wss.onmessage = function(evt) {
      f(evt.data);
    };
  }
  
  send (c) {
    c = Object.assign(defaultData, c);
    this.wss.send(JSON.stringify(c));
  }

}

export default new WSocket();