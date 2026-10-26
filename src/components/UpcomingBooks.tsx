import React, { useState } from 'react';
import { UpcomingArrival, StudentSuggestion, BookGenre, AuthUser } from '../types';
import { Sparkles, Calendar, ThumbsUp, Send, Plus, CheckCircle, Clock, BookMarked, User } from 'lucide-react';

interface UpcomingBooksProps {
  upcomingArrivals: UpcomingArrival[];
  suggestions: StudentSuggestion[];
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  onVoteUpcoming: (id: string) => void;
  onAddSuggestion: (suggestion: Omit<StudentSuggestion, 'id' | 'status' | 'date'>) => void;
  onAddUpcomingForecast: (upcoming: Omit<UpcomingArrival, 'id' | 'votes' | 'votedUserIds'>) => void;
}

export const UpcomingBooks: React.FC<UpcomingBooksProps> = ({
  upcomingArrivals,
  suggestions,
  currentUser,
  onOpenAuth,
  onVoteUpcoming,
  onAddSuggestion,
  onAddUpcomingForecast,
}) => {
  const [showAddForecastModal, setShowAddForecastModal] = useState(false);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);

  // Suggestion form
  const [sugTitle, setSugTitle] = useState('');
  const [sugAuthor, setSugAuthor] = useState('');
  const [sugReason, setSugReason] = useState('');
  const [sugStudentName, setSugStudentName] = useState(currentUser?.name || '');
  const [sugStudentGrade, setSugStudentGrade] = useState(
    currentUser && currentUser.role === 'student' ? currentUser.grade : '9º Ano A'
  );
  const [sugSuccess, setSugSuccess] = useState('');

  // Librarian add arrival forecast form
  const [foreTitle, setForeTitle] = useState('');
  const [foreAuthor, setForeAuthor] = useState('');
  const [foreGenre, setForeGenre] = useState<BookGenre>('Literatura Juvenil');
  const [foreDate, setForeDate] = useState('');
  const [forePublisher, setForePublisher] = useState('');
  const [foreDesc, setForeDesc] = useState('');

  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sugTitle.trim() || !sugAuthor.trim() || !sugReason.trim()) return;

    onAddSuggestion({
      title: sugTitle.trim(),
      author: sugAuthor.trim(),
      studentName: currentUser?.name || sugStudentName.trim() || 'Aluno',
      studentGrade:
        currentUser && currentUser.role === 'student'
          ? currentUser.grade
          : sugStudentGrade.trim() || 'Ensino Médio / Fundamental',
      reason: sugReason.trim(),
    });

    setSugTitle('');
    setSugAuthor('');
    setSugReason('');
    setSugSuccess('Sua sugestão foi enviada para a coordenação da biblioteca escolar!');
    setTimeout(() => {
      setSugSuccess('');
      setShowSuggestionForm(false);
    }, 2500);
  };

  const handleForecastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foreTitle.trim() || !foreAuthor.trim() || !foreDate.trim()) return;

    onAddUpcomingForecast({
      title: foreTitle.trim(),
      author: foreAuthor.trim(),
      genre: foreGenre,
      arrivalForecast: foreDate.trim(),
      description: foreDesc.trim() || 'Novo exemplar autorizado pela direção escolar.',
      publisher: forePublisher.trim() || 'Editora Parceira',
    });

    setForeTitle('');
    setForeAuthor('');
    setForeDate('');
    setForePublisher('');
    setForeDesc('');
    setShowAddForecastModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Previsões do Acervo Escolar</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-editorial tracking-tight">
            Quando Vai Chegar Livros Novos na Biblioteca?
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Acompanhe o cronograma oficial de aquisições da escola e vote nos títulos que você mais quer ler quando chegarem nas estantes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSuggestionForm(!showSuggestionForm)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Sugerir Livro para Compra</span>
          </button>

          {currentUser?.role === 'librarian' && (
            <button
              onClick={() => setShowAddForecastModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Previsão de Chegada</span>
            </button>
          )}
        </div>
      </div>

      {/* Suggestion Form Drawer / Card */}
      {showSuggestionForm && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 animate-fadeIn">
          <div className="max-w-2xl">
            <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-emerald-700" />
              <span>Qual livro você gostaria que a biblioteca trouxesse?</span>
            </h3>
            <p className="text-xs text-emerald-800 mt-1 mb-4">
              A equipe da biblioteca e os professores avaliam mensalmente os livros mais pedidos pelos alunos para compra!
            </p>

            {sugSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                <span>{sugSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSuggestionSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Título do Livro *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: O Menino que Descobriu o Vento"
                    value={sugTitle}
                    onChange={(e) => setSugTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Autor(a) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: William Kamkwamba"
                    value={sugAuthor}
                    onChange={(e) => setSugAuthor(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {!currentUser && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Seu Nome
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Amanda Ferreira"
                      value={sugStudentName}
                      onChange={(e) => setSugStudentName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sua Turma
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 8º Ano A"
                      value={sugStudentGrade}
                      onChange={(e) => setSugStudentGrade(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Por que a biblioteca deve comprar este livro? *
                </label>
                <textarea
                  rows={2}
                  placeholder="Explique o motivo (ex: ajuda nas aulas de ciências, é uma leitura muito pedida pelos colegas, etc.)"
                  value={sugReason}
                  onChange={(e) => setSugReason(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSuggestionForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Enviar Sugestão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upcoming Arrivals Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            Cronograma de Chegada de Novos Exemplares
          </h3>
          <span className="text-xs text-slate-500">
            {upcomingArrivals.length} títulos em processo de entrega
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {upcomingArrivals.map((item) => {
            const hasVoted =
              currentUser && currentUser.role === 'student'
                ? item.votedUserIds.includes(currentUser.matricula)
                : false;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Clean unboxed metadata */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-emerald-800">{item.genre}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.publisher}</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">Por {item.author}</p>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Arrival Date Highlight Box */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-800 block leading-tight">
                        Previsão de Chegada:
                      </span>
                      <span className="text-xs font-bold text-amber-950 font-mono">
                        {item.arrivalForecast}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onVoteUpcoming(item.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      hasVoted
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{hasVoted ? 'Você já votou' : 'Quero ler esse!'}</span>
                    <span className="font-mono bg-white/80 px-1.5 py-0.5 rounded text-[11px] font-bold">
                      {item.votes}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggestions List Section */}
      <div className="pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Sugestões Recentes Feitas Pelos Alunos
            </h3>
            <p className="text-xs text-slate-500">
              Livros indicados pela comunidade escolar para serem comprados pela escola.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {suggestions.map((sug) => (
            <div key={sug.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-900 text-sm">{sug.title}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    sug.status === 'Aprovado para Compra'
                      ? 'bg-emerald-100 text-emerald-800'
                      : sug.status === 'Em Aquisição'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {sug.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">Autor: {sug.author}</p>
              <p className="text-xs text-slate-500 italic mt-2">&ldquo;{sug.reason}&rdquo;</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                <span>
                  Sugerido por: <strong>{sug.studentName}</strong> ({sug.studentGrade})
                </span>
                <span>{sug.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Librarian Add Forecast Modal */}
      {showAddForecastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-amber-600 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Publicar Previsão de Novo Livro</h3>
                <p className="text-xs text-amber-100">
                  Informe aos alunos a data em que os novos exemplares chegarão
                </p>
              </div>
              <button
                onClick={() => setShowAddForecastModal(false)}
                className="text-white/80 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleForecastSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título do Livro *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Harry Potter e o Prisioneiro de Azkaban"
                  value={foreTitle}
                  onChange={(e) => setForeTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Autor(a) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: J. K. Rowling"
                    value={foreAuthor}
                    onChange={(e) => setForeAuthor(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gênero *
                  </label>
                  <select
                    value={foreGenre}
                    onChange={(e) => setForeGenre(e.target.value as BookGenre)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Literatura Juvenil">Literatura Juvenil</option>
                    <option value="Fantasia & Magia">Fantasia & Magia</option>
                    <option value="Ficção Científica">Ficção Científica</option>
                    <option value="Clássicos Brasileiros">Clássicos Brasileiros</option>
                    <option value="Mistério & Suspense">Mistério & Suspense</option>
                    <option value="História & Ciências">História & Ciências</option>
                    <option value="HQs & Mangás">HQs & Mangás</option>
                    <option value="Poesia & Teatro">Poesia & Teatro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Previsão de Chegada (Texto / Data) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 10 de Novembro de 2026"
                    value={foreDate}
                    onChange={(e) => setForeDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Editora
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Editora Rocco"
                    value={forePublisher}
                    onChange={(e) => setForePublisher(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detalhes / Quantidade de Cópias
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Remessa com 3 cópias adquiridas para a semana de leitura da escola."
                  value={foreDesc}
                  onChange={(e) => setForeDesc(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForecastModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  Publicar Previsão para os Alunos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
