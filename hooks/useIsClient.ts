import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * True after hydration on the client, false during server rendering.
 * Used for values that only exist in the browser (today's date, localStorage)
 * so the server HTML and the first client render always match.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
