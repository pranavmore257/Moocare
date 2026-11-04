import type { HealthStatus } from '../types';

interface StatusBadgeProps {
  status: HealthStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const CONFIG = {
  healthy: {
    label: 'Healthy',
    bg: '#E8F3ED',
    text: '#2E7D5B',
    border: '#C3DFCE',
    icon: '✓',
  },
  review: {
    label: 'Needs Review',
    bg: '#FFF4D6',
    text: '#D99A2B',
    border: '#F0D88B',
    icon: '⚠',
  },
  concern: {
    label: 'Health Concern',
    bg: '#FDEAEA',
    text: '#C94C4C',
    border: '#F5BEBE',
    icon: '⚠',
  },
  critical: {
    label: 'Critical',
    bg: '#C94C4C',
    text: '#FFFFFF',
    border: '#C94C4C',
    icon: '🔴',
  },
};

const SIZE = {
  sm: { cls: 'text-xs px-2 py-0.5 gap-1', iconSize: '10px' },
  md: { cls: 'text-sm px-3 py-1 gap-1.5', iconSize: '12px' },
  lg: { cls: 'text-base px-4 py-1.5 gap-2', iconSize: '14px' },
};

export default function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const cfg = CONFIG[status];
  const sz = SIZE[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border flex-shrink-0 ${sz.cls}`}
      style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      {showIcon && <span style={{ fontSize: sz.iconSize }}>{cfg.icon}</span>}
      {cfg.label}
    </span>
  );
}
