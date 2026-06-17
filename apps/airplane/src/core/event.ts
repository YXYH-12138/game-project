type EventHandler = (data: any) => void | boolean;

export class EventBus<Events extends Record<string, EventHandler>> {
  private listeners: Map<keyof Events, Set<EventHandler>> = new Map();
  private onceListeners: Map<keyof Events, Set<EventHandler>> = new Map();

  on<K extends keyof Events>(event: K, handler: Events[K]) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  once<K extends keyof Events>(event: K, handler: Events[K]) {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }
    this.onceListeners.get(event)!.add(handler);
  }

  off<K extends keyof Events>(event: K, handler: Events[K]) {
    this.listeners.get(event)?.delete(handler);
    this.onceListeners.get(event)?.delete(handler);
  }

  emit<K extends keyof Events>(event: K, data?: Parameters<Events[K]>[0]): boolean {
    // 1. 先执行普通监听器
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of handlers) {
        const result = handler(data);
        if (result === false) return false; // 立即停止，阻止后续执行
      }
    }

    // 2. 再执行一次性监听器
    const onceHandlers = this.onceListeners.get(event);
    if (onceHandlers) {
      for (const handler of onceHandlers) {
        const result = handler(data);
        onceHandlers.delete(handler); // 执行后移除
        if (result === false) return false; // 立即停止
      }
    }

    return true; // 没有被阻止
  }

  clear() {
    this.listeners.clear();
    this.onceListeners.clear();
  }
}
