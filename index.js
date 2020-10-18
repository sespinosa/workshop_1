const net = require('net');
const readline = require('readline');

const messages = Array(50).fill('');

const simple_protocol = require('./simple_protocol');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: ''
});

const SERVER_PORT = 1234;
const SERVER_IP = 'boldo.io';

const console_out = (msg, save = true) => {
  console.clear();
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  messages.forEach(m => {
    console.log(m);
  });
  if(save) messages.push(msg);
  console.log(msg);
  rl.prompt(true);
}

// Here we call the socket 'client'.
const client = new net.Socket();

const connect = nick => {
  client.connect(SERVER_PORT, SERVER_IP, () => {
    client.write(simple_protocol.buildSetNick(nick));
  });
  
  client.on('error', e => {
    console.error('Error trying to connect: \n\r', e);
  })
  
  client.on('data', data => {
    simple_protocol.eventHandler(data.toString(), client, console_out);
  });

  client.on('end', () => {
    console_out('####################################');
    console_out('Disconnected from server');
    console_out('####################################');
  });

  client.on('close', hasError => {
    console_out('####################################');
    console_out('Connection closed locally');
    if(hasError) console_out('with errors :(');
    console_out('####################################');
  });
  
  rl.on('line', line => {
    if(line[0] === '/' && line.length > 1) {
      // The line was classified as a command, those start with a '/'.
      const [cmd, ...args] = line.trim().split(' ').filter(arg => arg !== "");
      simple_protocol.cmdHandler(cmd, args, console_out, client);
    }
    else { // Is not a command so is a message to all.
      if(line.trim().length > 0) {
        simple_protocol.message_all(line.trim(), client);
        console_out('', false);
      }
    }
  });
};

const start = () => {
  console_out('Ingresa tu nickname: ', false);
  rl.question('', nick => {
    if(nick && nick.trim().length > 0) {
      connect(nick);
      rl.setPrompt(`${nick} (Enter to send message or Ctrl + C to exit): `);
      rl.prompt(true);
      
    }
    else {
      return setNick();
    }
  });
};

start();
