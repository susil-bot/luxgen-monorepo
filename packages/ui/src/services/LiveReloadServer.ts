// eslint-disable-next-line import/no-extraneous-dependencies
const Hapi = require('@hapi/hapi');
const config = require('./liveReloadConfig.json');

class LivereloadServer {
  private io: any;
  private server: any;

  constructor() {
    // eslint-disable-next-line global-require
    this.io = require('socket.io')(config.socket_port);
    this.server = Hapi.server({
      port: config.server_port,
      host: 'localhost'
    });
  }

  async start() {
    this.server.route({
      method: 'GET',
      path: '/refresh',
      handler: () => {
        this.io.sockets.emit('refresh');
        return { success: true };
      }
    });
    await this.server.start();
    console.log(`Livereload server running on port ${config.server_port}`);
  }
}

module.exports = { LivereloadServer };
