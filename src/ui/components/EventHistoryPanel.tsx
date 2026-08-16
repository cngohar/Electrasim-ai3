import {
  AlertTriangle,
  CheckCircle,
  Clock,
  OctagonAlert,
  ShieldAlert,
  Thermometer,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { useUiStore } from '../../store';

export function EventHistoryPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const eventHistory = useUiStore((s) => s.eventHistory);

  if (!isOpen) return null;

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'component_tripped':
        return <OctagonAlert className="size-3 text-orange-500" />;
      case 'wire_overheated':
      case 'wire_melted':
        return <Thermometer className="size-3 text-red-500" />;
      case 'component_blown':
        return <AlertTriangle className="size-3 text-red-600" />;
      case 'fault_cleared':
        return <CheckCircle className="size-3 text-emerald-500" />;
      case 'component_repaired':
        return <Wrench className="size-3 text-blue-500" />;
      case 'regulatory_violation':
        return <ShieldAlert className="size-3 text-red-500" />;
      case 'manual_intervention':
        return <Wrench className="size-3 text-indigo-500" />;
      default:
        return <Zap className="size-3 text-yellow-500" />;
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <aside
      aria-label="Event history"
      className="fixed right-4 top-20 z-40 flex max-h-[min(32rem,calc(100vh-7rem))] w-80 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-slate-700">
        <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          <Clock className="inline size-3 mr-1" />
          Event History
        </h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          type="button"
        >
          <X className="size-3" />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto p-2">
        {eventHistory.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400">No events recorded yet</p>
        ) : (
          <ul className="space-y-1">
            {eventHistory.map((event) => (
              <li
                key={event.id}
                className="rounded border border-slate-100 p-2 text-[10px] dark:border-slate-800"
              >
                <div className="flex items-start gap-2">
                  {getEventIcon(event.eventType)}
                  <div className="flex-1">
                    <div className="font-medium text-slate-700 dark:text-slate-200">
                      {event.description}
                    </div>
                    <div className="text-[9px] text-slate-500">{formatTime(event.timestamp)}</div>
                    {event.componentName && (
                      <div className="text-[9px] text-slate-400">
                        Component: {event.componentName}
                      </div>
                    )}
                    {event.details?.currentAmps && (
                      <div className="text-[9px] text-slate-400">
                        Current: {event.details.currentAmps.toFixed(1)}A
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
