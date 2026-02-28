interface BarraProgressoProps {
  percentage: number;
}

export function BarraProgresso({ percentage }: BarraProgressoProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div 
          className="bg-yellow-500 h-2 rounded-full transition-all"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span className="text-xs text-gray-600 w-10 text-right">{percentage}%</span>
    </div>
  );
}
