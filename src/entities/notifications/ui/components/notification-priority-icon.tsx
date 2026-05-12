import { AlertTriangle, Info } from 'lucide-react';

interface NotificationPriorityIconProps {
  priority?: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
}

export const NotificationPriorityIcon = ({ priority }: NotificationPriorityIconProps) => {
  if (priority === 'HIGH') {
    return (
      <span title="High Priority" className="shrink-0">
        <AlertTriangle
          size={11}
          className="text-red-400 animate-pulse"
        />
      </span>
    );
  }
  if (priority === 'LOW') {
    return (
      <span title="Low Priority" className="shrink-0">
        <Info size={11} className="text-neutral-500" />
      </span>
    );
  }
  return null;
};
