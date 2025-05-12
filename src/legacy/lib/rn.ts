import FlareLane from '@flarelane/flarelane-web-sdk';

export enum RNAction {
  LOG = 'log',
  FLARE_LANE = 'flareLane',
}

function tryParseJSON(jsonString: any) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
}

export class RN {
  static postMessage(action: RNAction, value?: any) {
    const data = JSON.stringify({ action, value });
    (window as any).ReactNativeWebView?.postMessage(data);
  }

  static handleMessageEvent({ data }: MessageEvent) {
    const command = tryParseJSON(data) as HandlerCommand;
    if (command?.kind !== 'webview') return;
    if (!Handler[command.action]) return;
    Handler[command.action](command.value);
  }

  static flareLane(
    method: Exclude<keyof typeof FlareLane, 'prototype' | '_directInitializeFromProxy' | '_proxySubscribe'>,
    value?: any,
  ) {
    RN.postMessage(RNAction.FLARE_LANE, { method, value });
    return;
  }
}

interface HandlerCommand {
  kind?: 'webview';
  action: Exclude<keyof typeof Handler, 'prototype'>;
  value?: any;
}

class Handler {
  static init({ os }: any) {
    // os && osState.set(os);
  }
}

// @ts-ignore
document.addEventListener('message', RN.handleMessageEvent);
window.addEventListener('message', RN.handleMessageEvent);
