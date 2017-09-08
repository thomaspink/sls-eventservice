export interface OnInit { onInit(): void; }
export interface OnDestroy { onDestroy(): void; }

export function callLifecycleHook(component: any, hook: string, ...args: any[]) {
  const fn = component[hook];
  if (typeof fn === 'function') {
    fn.apply(component, args);
  }
}
