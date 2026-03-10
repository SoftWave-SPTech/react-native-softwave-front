import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { CardKPI } from '../components/CardKPI';
import { BottomNav } from '../components/BottomNav';
import { 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  Activity,
  Calendar,
  Sparkles,
  FolderOpen,
  Upload,
  Download
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export function Relatorios() {
  const [periodo, setPeriodo] = useState('mes');
  const [insightAberto, setInsightAberto] = useState<string | null>(null);
  const navigate = useNavigate();

  const receitaDespesaData = [
    { mes: 'Jan', receita: 78000, despesa: 42000 },
    { mes: 'Fev', receita: 85400, despesa: 42900 },
    { mes: 'Mar', receita: 92000, despesa: 45000 },
  ];

  const receitaCategoriaData = [
    { name: 'Honorários', value: 65000 },
    { name: 'Consultoria', value: 15000 },
    { name: 'Assessoria', value: 5400 },
  ];

  const despesaCategoriaData = [
    { mes: 'Jan', aluguel: 15000, custas: 11000, outros: 16000 },
    { mes: 'Fev', aluguel: 15000, custas: 12000, outros: 15900 },
    { mes: 'Mar', aluguel: 15000, custas: 13500, outros: 16500 },
  ];

  const clientesRanking = [
    { nome: 'João Silva', valor: 25000 },
    { nome: 'Maria Santos', valor: 18000 },
    { nome: 'Carlos Oliveira', valor: 12000 },
    { nome: 'Ana Costa', valor: 8500 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const insights = {
    receitaDespesa: {
      titulo: 'Análise de Receita vs Despesa',
      pontos: [
        'Sua receita cresceu 17% de Janeiro a Março',
        'Despesas aumentaram apenas 7%, mantendo boa margem',
        'Tendência positiva: lucro líquido crescente'
      ]
    },
    receitaCategoria: {
      titulo: 'Concentração de Receita',
      pontos: [
        'Honorários representam 76% da receita total',
        'Consultoria está crescendo 12% ao mês',
        'Considere diversificar fontes de receita'
      ]
    },
    despesaCategoria: {
      titulo: 'Estrutura de Custos',
      pontos: [
        'Aluguel representa 35% das despesas fixas',
        'Custas judiciais com volume acima da média',
        'Oportunidade de reduzir custos operacionais em 15%'
      ]
    },
    maioresClientes: {
      titulo: 'Concentração de Clientes',
      pontos: [
        'Top 2 clientes representam 68% da receita',
        'João Silva é responsável por 40% do faturamento',
        'Risco: alta dependência de poucos clientes'
      ]
    }
  };

  const toggleInsight = (tipo: string) => {
    setInsightAberto(insightAberto === tipo ? null : tipo);
  };

  const InsightCard = ({ tipo }: { tipo: string }) => {
    const insight = insights[tipo as keyof typeof insights];
    
    return (
      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-sm">{insight.titulo}</h4>
          </div>
        </div>
        
        <div className="space-y-2">
          {insight.pontos.map((ponto, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">{ponto}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <Header title="Relatórios" showBack />
      
      <div className="px-5 py-4 space-y-4">
        {/* Filtro Período */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">Período</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriodo('mes')}
              className={`px-4 py-2 rounded-lg text-sm ${
                periodo === 'mes'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setPeriodo('semana')}
              className={`px-4 py-2 rounded-lg text-sm ${
                periodo === 'semestre'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Semestre
            </button>
            <button
              onClick={() => setPeriodo('ano')}
              className={`px-4 py-2 rounded-lg text-sm ${
                periodo === 'ano'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Ano
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <CardKPI
            icon={Activity}
            title="Margem de Lucro"
            value="49.8%"
            variation="+2.3%"
            variationType="positive"
          />
          <CardKPI
            icon={DollarSign}
            title="Ticket Médio"
            value="R$ 8.540"
            variation="+5%"
            variationType="positive"
          />
          <CardKPI
            icon={AlertCircle}
            title="Inadimplência"
            value="12%"
            variation="-3%"
            variationType="positive"
          />
          <CardKPI
            icon={TrendingUp}
            title="Crescimento"
            value="15%"
            variation="+8%"
            variationType="positive"
          />
        </div>

        {/* Banner Assistente IA */}
        <button 
          onClick={() => navigate('/assistente-ia')}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-4 text-white text-left hover:from-purple-600 hover:to-blue-600 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Assistente IA Personalizado</h3>
              <p className="text-sm text-purple-100">Faça perguntas e obtenha análises detalhadas</p>
            </div>
            <div className="text-2xl">→</div>
          </div>
        </button>

        {/* Card Importação/Exportação ETL */}
        <button 
          onClick={() => navigate('/importacao-exportacao')}
          className="w-full bg-white border-2 border-blue-200 rounded-2xl p-4 text-left hover:border-blue-400 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Importação & Exportação</h3>
              <p className="text-sm text-gray-600">Extratos bancários e dados</p>
            </div>
            <div className="flex gap-1">
              <Upload className="w-5 h-5 text-blue-600" />
              <Download className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </button>

        {/* Receita vs Despesa */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Receita vs Despesa</h3>
            <button
              onClick={() => toggleInsight('receitaDespesa')}
              className={`p-2 rounded-lg transition-colors ${
                insightAberto === 'receitaDespesa'
                  ? 'bg-amber-100'
                  : 'bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <Sparkles className="w-5 h-5 text-amber-600" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={receitaDespesaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="despesa" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          {insightAberto === 'receitaDespesa' && <InsightCard tipo="receitaDespesa" />}
        </div>

        {/* Receita por Categoria */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Receita por Categoria</h3>
            <button
              onClick={() => toggleInsight('receitaCategoria')}
              className={`p-2 rounded-lg transition-colors ${
                insightAberto === 'receitaCategoria'
                  ? 'bg-amber-100'
                  : 'bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <Sparkles className="w-5 h-5 text-amber-600" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={receitaCategoriaData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {receitaCategoriaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          {insightAberto === 'receitaCategoria' && <InsightCard tipo="receitaCategoria" />}
        </div>

        {/* Despesa por Categoria */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Despesa por Categoria</h3>
            <button
              onClick={() => toggleInsight('despesaCategoria')}
              className={`p-2 rounded-lg transition-colors ${
                insightAberto === 'despesaCategoria'
                  ? 'bg-amber-100'
                  : 'bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <Sparkles className="w-5 h-5 text-amber-600" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={despesaCategoriaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="aluguel" fill="#ef4444" />
              <Bar dataKey="custas" fill="#f59e0b" />
              <Bar dataKey="outros" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
          {insightAberto === 'despesaCategoria' && <InsightCard tipo="despesaCategoria" />}
        </div>

        {/* Ranking Maiores Clientes */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Maiores Clientes</h3>
            <button
              onClick={() => toggleInsight('maioresClientes')}
              className={`p-2 rounded-lg transition-colors ${
                insightAberto === 'maioresClientes'
                  ? 'bg-amber-100'
                  : 'bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <Sparkles className="w-5 h-5 text-amber-600" />
            </button>
          </div>
          <div className="space-y-3">
            {clientesRanking.map((cliente, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  <span className="text-gray-900">{cliente.nome}</span>
                </div>
                <span className="font-semibold text-blue-600">
                  R$ {cliente.valor.toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
          {insightAberto === 'maioresClientes' && <InsightCard tipo="maioresClientes" />}
        </div>

        <div className="h-4"></div>
      </div>
      <BottomNav />
    </div>
  );
}