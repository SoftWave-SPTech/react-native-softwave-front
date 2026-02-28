import { LucideIcon } from 'lucide-react';

interface CardKPIProps {
  icon: LucideIcon;
  title: string;
  value: string;
  variation?: string;
  variationType?: 'positive' | 'negative';
}

export function CardKPI({ icon: Icon, title, value, variation, variationType }: CardKPIProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
      {variation && (
        <span className={`text-xs ${variationType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
          {variation}
        </span>
      )}
    </div>
  );
}
