/**
 * This small library creates the messages in the correct format to be sent through the wire,
 * the idea is to create simple JSON objects, that get serialized as strings (stringyfied) and
 * those text messages will be encoded in binary and be sent (the socket itself takes care
 * of the binary encoding).
 */

let users = [];

const eventHandler = (ev, socket, console_out) => {
  let event = null;
  try {
    event = JSON.parse(ev);
    switch(event.type) {
      case 'user_joined':
        console_out(`\r\nUser <${event.payload.nick}> joined the chat.\n\r`);
        break;
      case 'list_users':
        users = event.payload;
        if(!event.silent) {
          console_out(`\r\n Users: \n${users.map(u => `\n\t- ${u.nick} (${u._id})`).join('')}`);
        }
        break;
      case 'user_disconnect':
        console_out(`\r\nUser <${event.payload.nick}> just disconnected.\n\r`);
        break;
      case 'got_public_message':
        console_out(`<${event.payload.nick}>: ${event.payload.message}`);
        break;
      default:
        console_out('Undefined event received.')
    }
  }
  catch(e) {
    console.error('Malformed event or some internal issue :s\n', e);
  }
}

const buildSetNick = nick => {
  return JSON.stringify({
    type: "set_nick",
    payload: nick
  });
};

const buildGetUserList = () => JSON.stringify({
  type: 'get_list_users'
});

const message_all = (msg, socket) => {
  const event = JSON.stringify({
    type: 'message_all',
    payload: msg
  });
  socket.write(event);
};

const cmdHandler = (cmd, args, console_out, socket) => {
  switch(cmd) {
    case '/users':
      const ev = buildGetUserList();
      socket.write(ev);
      break;
    default:
      console_out(`\r\n**Invalid command (${cmd})\n\r`);
  }
};

module.exports = {
  eventHandler,
  cmdHandler,
  buildSetNick,
  message_all
}