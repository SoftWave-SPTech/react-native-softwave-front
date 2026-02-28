interface TagStatusProps {
  status: 'pago' | 'pendente' | 'atrasado' | 'em-dia';
}

export function TagStatus({ status }: TagStatusProps) {
  const styles = {
    pago: 'bg-green-100 text-green-700',
    pendente: 'bg-yellow-100 text-yellow-700',
    atrasado: 'bg-red-100 text-red-700',
    'em-dia': 'bg-blue-100 text-blue-700',
  };

  const labels = {
    pago: 'Pago',
    pendente: 'Pendente',
    atrasado: 'Atrasado',
    'em-dia': 'Em dia',
    reprovado: 'Reprovado'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
