import { useState } from 'react';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { 
  Sparkles,
  ChevronDown,
  Calendar,
  Send,
  Clock,
  Filter
} from 'lucide-react';

interface HistoricoItem {
  id: number;
  tipo: string;
  periodo: string;
  pergunta: string;
  resposta: string;
  data: string;
}

export function AssistenteIA() {
  const [tipoAnalise, setTipoAnalise] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [respostaIA, setRespostaIA] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filtroHistorico, setFiltroHistorico] = useState('todos');

  const tiposAnalise = [
    { value: 'receita-despesa', label: 'Receita vs Despesa' },
    { value: 'receita-categoria', label: 'Receita por Categoria' },
    { value: 'despesa-categoria', label: 'Despesa por Categoria' },
    { value: 'maiores-clientes', label: 'Maiores Clientes' },
    { value: 'margem-lucro', label: 'Margem de Lucro' },
    { value: 'inadimplencia', label: 'Inadimplência' },
  ];

  const [historico, setHistorico] = useState<HistoricoItem[]>([
    {
      id: 1,
      tipo: 'Receita vs Despesa',
      periodo: '01/01/2024 - 31/03/2024',
      pergunta: 'Análise de receita e despesa',
      resposta: 'Sua receita cresceu 17% de Janeiro a Março. Despesas aumentaram apenas 7%, mantendo boa margem. Tendência positiva: lucro líquido crescente.',
      data: '22/02/2024 14:30'
    },
    {
      id: 2,
      tipo: 'Maiores Clientes',
      periodo: '01/02/2024 - 28/02/2024',
      pergunta: 'Concentração de clientes',
      resposta: 'Top 2 clientes representam 68% da receita. João Silva é responsável por 40% do faturamento. Risco: alta dependência de poucos clientes.',
      data: '20/02/2024 09:15'
    },
    {
      id: 3,
      tipo: 'Despesa por Categoria',
      periodo: '01/01/2024 - 31/01/2024',
      pergunta: 'Estrutura de custos',
      resposta: 'Aluguel representa 35% das despesas fixas. Custas judiciais com volume acima da média. Oportunidade de reduzir custos operacionais em 15%.',
      data: '15/02/2024 16:45'
    }
  ]);

  const respostasIA = {
    'receita-despesa': 'Analisando o período selecionado, sua receita apresentou crescimento consistente de 17%. As despesas aumentaram apenas 7%, indicando boa gestão de custos. A margem de lucro está em expansão, com tendência positiva para os próximos meses. Recomenda-se manter o controle rigoroso das despesas operacionais.',
    'receita-categoria': 'Os Honorários representam 76% da sua receita total, mostrando forte dependência desta fonte. Consultoria está crescendo 12% ao mês e pode ser uma boa oportunidade de diversificação. Considere desenvolver novos serviços para reduzir a concentração e aumentar a resiliência do negócio.',
    'despesa-categoria': 'O Aluguel representa 35% das suas despesas fixas. As Custas judiciais estão acima da média do setor, indicando possível otimização. Há uma oportunidade de reduzir custos operacionais em aproximadamente 15% através de renegociação de contratos e digitalização de processos.',
    'maiores-clientes': 'Seus top 2 clientes representam 68% da receita total. João Silva sozinho é responsável por 40% do faturamento. Esta alta concentração representa um risco significativo. Recomenda-se diversificar a carteira de clientes e desenvolver estratégias de retenção para clientes médios.',
    'margem-lucro': 'Sua margem de lucro atual está em 49.8%, acima da média do mercado jurídico (35-40%). O crescimento de 2.3% nos últimos meses indica tendência positiva. Mantenha o foco em serviços de maior valor agregado e controle rigoroso de custos para sustentar esta performance.',
    'inadimplencia': 'A taxa de inadimplência está em 12%, dentro da média do setor jurídico (10-15%). A redução de 3% indica melhoria nos processos de cobrança. Implemente políticas de pagamento antecipado com desconto e acompanhamento proativo de vencimentos para reduzir ainda mais este indicador.'
  };

  const handleGerarInsight = () => {
    if (!tipoAnalise || !dataInicio || !dataFim) {
      return;
    }

    setIsLoading(true);
    
    // Simula um delay de processamento da IA
    setTimeout(() => {
      const resposta = respostasIA[tipoAnalise as keyof typeof respostasIA] || 'Análise não disponível.';
      setRespostaIA(resposta);
      
      // Adiciona ao histórico
      const novoItem: HistoricoItem = {
        id: historico.length + 1,
        tipo: tiposAnalise.find(t => t.value === tipoAnalise)?.label || '',
        periodo: `${new Date(dataInicio).toLocaleDateString('pt-BR')} - ${new Date(dataFim).toLocaleDateString('pt-BR')}`,
        pergunta: `Análise de ${tiposAnalise.find(t => t.value === tipoAnalise)?.label}`,
        resposta: resposta,
        data: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      };
      
      setHistorico([novoItem, ...historico]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <Header title="Assistente IA" showBack />
      
      <div className="px-5 py-4 space-y-4">
        {/* Card Principal de Consulta */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Consultoria Inteligente</h2>
              <p className="text-sm text-gray-600">Obtenha insights personalizados</p>
            </div>
          </div>

          {/* Tipo de Análise */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Análise
            </label>
            <div className="relative">
              <select
                value={tipoAnalise}
                onChange={(e) => setTipoAnalise(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Selecione o tipo de análise</option>
                {tiposAnalise.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Período */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período de Análise
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Data início"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Data fim"
                />
              </div>
            </div>
          </div>

          {/* Botão Gerar Insight */}
          <button
            onClick={handleGerarInsight}
            disabled={!tipoAnalise || !dataInicio || !dataFim || isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Gerar Insight
              </>
            )}
          </button>
        </div>

        {/* Resposta da IA */}
        {respostaIA && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Análise Gerada</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{respostaIA}</p>
              </div>
            </div>
          </div>
        )}

        {/* Histórico de Insights */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Histórico de Insights</h3>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={filtroHistorico}
                onChange={(e) => setFiltroHistorico(e.target.value)}
                className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="todos">Todos</option>
                <option value="Receita vs Despesa">Receita vs Despesa</option>
                <option value="Receita por Categoria">Receita por Categoria</option>
                <option value="Despesa por Categoria">Despesa por Categoria</option>
                <option value="Maiores Clientes">Maiores Clientes</option>
                <option value="Margem de Lucro">Margem de Lucro</option>
                <option value="Inadimplência">Inadimplência</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {historico
              .filter(item => filtroHistorico === 'todos' || item.tipo === filtroHistorico)
              .map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-medium">
                        {item.tipo}
                      </span>
                      <span className="text-xs text-gray-500">{item.data}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{item.periodo}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{item.resposta}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-20"></div>
      </div>

      <BottomNav />
    </div>
  );
}