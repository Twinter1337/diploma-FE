import Icon from '../ui/Icon';
import Avatar from './Avatar';
import type { AdminAssignee } from '../../types';

export default function AssigneeChip({ assignee }: { assignee: AdminAssignee | null }) {
  if (!assignee) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: '#9CA3AF',
          fontWeight: 500,
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            border: '1.5px dashed #CBD5E1',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9CA3AF',
          }}
        >
          <Icon d="M12 5v14 M5 12h14" size={11} stroke={2.4} />
        </span>
        Не призначено
      </span>
    );
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12.5,
        color: '#3F4651',
        fontWeight: 500,
      }}
    >
      <Avatar name={assignee.fullName} avatarUrl={assignee.avatarUrl} size={22} />
      {assignee.fullName.split(' ')[0]}
    </span>
  );
}
