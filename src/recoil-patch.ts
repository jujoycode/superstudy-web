import * as recoil from 'recoil'

// Recoil 내부 함수 패치
//@ts-ignore
const originalFn = recoil.__internal.currentRendererSupportsUseSyncExternalStore
//@ts-ignore
recoil.__internal.currentRendererSupportsUseSyncExternalStore = function() {
  return true
}
