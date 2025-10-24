import config from './liveReloadConfig.json';

export class LiveReloadClient {
  public static listenForReload(): any {
    if (process.env.ENABLE_LIVE_RELOAD === 'true') {
      // eslint-disable-next-line global-require
      const openSocket = require('socket.io-client');
      this.socket = openSocket(this.url);
      this.socket.on('refresh', () => window.location.reload());
    }
  }

  private static socket: any;
  private static url: string = `http://localhost:${config.socket_port}`;
}
