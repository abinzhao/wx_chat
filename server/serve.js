const WebSocket = require('ws');

console.log('--------begin--------');
// 存储用户池
let clientList = {};
// 存储在线用户
let clientLive = [];

// 开启websocket 端口监听
const wss = new WebSocket.Server({
  port: 18081,
});

wss.on('connection', connection);
//监听连接 和 信息
function connection(ws) {
  ws.on('message', function incoming(data) {
    /**
     * 接收数据格式 json
     * {
     *   event: reg/msg,
     *   from: uid,
     *   to: uid/all,
     *   username: username,
     *   type: text,
     *   data: data
     * }
     */
    const msg = JSON.parse(data);
    //添加到用户池
    if (msg.event == 'reg') {
      console.log(msg.username+'上线');
      addclientList(ws, msg);
      broadcast(ws, sendFormatMsg(msg, 'reg'));
    }
    else if (msg.event == 'msg') {
      // 发送 所有人或者个人
      if (msg.to == 'all') {
        console.log('群发: '+msg.username+' 给所有人发送: '+ msg.data);
        broadcast(ws, sendFormatMsg(msg));
      } else {
        sendUser(msg);
      }
    }
  });
}

//添加到用户池
function addclientList (ws, msg) {
  const uid = {
    ws: ws,
    username: msg.username
  }
  clientList[msg.from] = uid;
}

/**
 * 发送给谁
 */
function sendUser(msg) {
  console.log('私聊: '+msg.username+' 给编号'+msg.to+'发送: '+ msg.data);
  const sendObj = clientList[msg.to];
  sendObj.ws.send( sendFormatMsg(msg) );
}

/**
 * 广播  貌似用到反射，此处为引用传递
 * @return mixed
 */
function broadcast (ws, msg, is_self=false) {
  wss.clients.forEach(function each(client) {
    // 判断是否是自己
    if (client === ws && client.readyState === WebSocket.OPEN) {
      //发给自己
      if (is_self) {
        client.send(msg);
      }
    } else {
      client.send(msg);
    }
  });
}
/**
 * 格式化发送信息格式
 */
function sendFormatMsg (msg, event='msg') {
  /**
   * 发送数据格式 json
   * {
   *   event: 'msg',
   *   from: uid,
   *   to: uid,
   *   username: username,
   *   type: text,
   *   data: data
   * }
   */
  msg.event = event;
  return JSON.stringify(msg);
}

/**
 * 计算还在线上的用户
 */
function computeLive() {
  let _temp = [];
  wss.clients.forEach(function each(client) {
    for (let x in clientList) {
      if (clientList[x]['ws'] == client) {
        if(client.readyState === WebSocket.OPEN) {
          _temp.push({
            uid: x,
            username: clientList[x]['username']
          });
        }else {
          delete(clientList[x]);
        }
      }
    }
  });
  clientLive = _temp;
}

/**
 * 在线用户列表信息分发
 */
function sendAllLive() {
  const msg = {
    event: 'user',
    from: 'server',
    to: 'all',
    username: 'server',
    type: 'text',
    data: clientLive  //将所有在线用户列表分发给所有在线用户，简便处理
  };
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send( sendFormatMsg(msg, 'user') );
    }
  });
}

// 每隔一段时间定时计算在线用户及分发在线数据
setInterval(computeLive,1000*5);
setInterval(sendAllLive,1000*5);