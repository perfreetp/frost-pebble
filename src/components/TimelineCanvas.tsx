import { useEffect, useRef } from 'react';
import { TimelineView, type TimelineHandlers, type TimelineState } from '../pixi/TimelineView';

export function TimelineCanvas({
  state,
  handlers,
  onReady,
}: {
  state: TimelineState;
  handlers: TimelineHandlers;
  onReady?: (view: TimelineView) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<TimelineView | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const view = new TimelineView({
      onSelectShip: (id) => handlersRef.current.onSelectShip(id),
      onSelectAssignment: (id) => handlersRef.current.onSelectAssignment(id),
      onPlace: (shipId, berthId, startMin) => handlersRef.current.onPlace(shipId, berthId, startMin),
      onMove: (id, berthId, startMin) => handlersRef.current.onMove(id, berthId, startMin),
      onHoverShip: (id) => handlersRef.current.onHoverShip?.(id),
      validate: (shipId, berthId, startMin, excludeId) =>
        handlersRef.current.validate(shipId, berthId, startMin, excludeId),
      onLayout: (geometry) => {
        const el = hostRef.current;
        if (el) el.dataset.geometry = JSON.stringify(geometry);
      },
    });
    viewRef.current = view;
    let cancelled = false;
    void view.mount(host).then(() => {
      if (cancelled) {
        view.destroy();
        return;
      }
      view.setState(stateRef.current);
      onReady?.(view);
    });
    return () => {
      cancelled = true;
      view.destroy();
      if (viewRef.current === view) viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    viewRef.current?.setState(state);
  }, [state]);

  return <div className="canvasHost" ref={hostRef} data-testid="canvas-host" />;
}
