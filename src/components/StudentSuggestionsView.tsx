import React, { useState } from 'react';
import { StudentSuggestion, AuthUser } from '../types';
import { BookMarked, Send, CheckCircle, Clock, ShieldCheck, Plus, Sparkles } from 'lucide-react';

interface StudentSuggestionsViewProps {
  suggestions: StudentSuggestion[];
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  onAddSuggestion: (suggestion: Omit<StudentSuggestion, 'id' | 'status' | 'date'>) => void;
  onUpdateSuggestionStatus?: (id: string, newStatus: 'Análise' | 'Aprovado para Compra' | 'Em Aquisição') => void;
}

export const StudentSuggestionsView: React.FC<StudentSuggestionsViewProps> = ({
  suggestions,
  currentUser,
  onOpenAuth,
  onAddSuggestion,
  onUpdateSuggestionStatus,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [reason, setReason] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestGrade, setGuestGrade] = useState('8º Ano A');
  const [submittedMessage, setSubmittedMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !reason.trim()) return;

    onAddSuggestion({
      title: title.trim(),
      author: author.trim(),
      studentName: currentUser?.name || guestName.trim() || 'Estudante',
      studentGrade:
        currentUser && currentUser.role === 'student'
          ? currentUser.grade
          : guestGrade.trim() || 'Ensino Fundamental',
      reason: reason.trim(),
    });

    setTitle('');
    setAuthor('');
    setReason('');
    setSubmittedMessage('Sua indicação foi registrada e será analisada na próxima reunião da biblioteca!');
    setTimeout(() => setSubmittedMessage(''), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Participação dos Alunos</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-editorial tracking-tight">
            Indicações &amp; Sugestões de Livros
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Diga qual livro você quer ver nas estantes da nossa escola. A coordenação avalia os títulos mais sugeridos!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Suggestion Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-1">
            <BookMarked className="w-5 h-5 text-emerald-700" />
            <h3>Indicar um Livro para a Escola Comprar</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Preencha os dados do livro que você gostaria de encontrar no acervo.
          </p>

          {submittedMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{submittedMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Livro *
              </label>
              <input
                type="text"
                placeholder="Ex: O Menino do Pijama Listrado"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Autor(a) da Obra *
              </label>
              <input
                type="text"
                placeholder="Ex: John Boyne"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {!currentUser && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Seu Nome
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Mariana"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
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
                    value={guestGrade}
                    onChange={(e) => setGuestGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Por que a escola deve adquirir este livro? *
              </label>
              <textarea
                rows={3}
                placeholder="Conte para a bibliotecária e para a direção por que este livro é importante para a leitura escolar..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Indicação de Livro</span>
            </button>
          </form>
        </div>

        {/* Existing Suggestions List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h3 className="font-bold text-slate-900 text-base">
              Livros Sugeridos pelos Alunos da Escola
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {suggestions.length} sugestões ativas
            </span>
          </div>

          <div className="space-y-3">
            {suggestions.map((sug) => (
              <div
                key={sug.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base leading-snug">
                      {sug.title}
                    </h4>
                    <span className="text-xs text-emerald-800 font-medium">
                      Autor: {sug.author}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                      sug.status === 'Aprovado para Compra'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : sug.status === 'Em Aquisição'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {sug.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                  &ldquo;{sug.reason}&rdquo;
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span>
                    Indicado por: <strong>{sug.studentName}</strong> ({sug.studentGrade})
                  </span>
                  <span>{sug.date}</span>
                </div>

                {/* Librarian Status Controls */}
                {currentUser?.role === 'librarian' && onUpdateSuggestionStatus && (
                  <div className="pt-2 flex items-center justify-end gap-1.5 border-t border-slate-100 text-xs">
                    <span className="text-[11px] text-amber-900 font-medium mr-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Definir Status:</span>
                    </span>
                    <button
                      onClick={() => onUpdateSuggestionStatus(sug.id, 'Análise')}
                      className={`px-2 py-0.5 rounded text-[11px] border cursor-pointer ${
                        sug.status === 'Análise' ? 'bg-amber-200 font-bold' : 'hover:bg-slate-100'
                      }`}
                    >
                      Em Análise
                    </button>
                    <button
                      onClick={() => onUpdateSuggestionStatus(sug.id, 'Aprovado para Compra')}
                      className={`px-2 py-0.5 rounded text-[11px] border cursor-pointer ${
                        sug.status === 'Aprovado para Compra'
                          ? 'bg-emerald-200 font-bold'
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      Aprovar Compra
                    </button>
                    <button
                      onClick={() => onUpdateSuggestionStatus(sug.id, 'Em Aquisição')}
                      className={`px-2 py-0.5 rounded text-[11px] border cursor-pointer ${
                        sug.status === 'Em Aquisição'
                          ? 'bg-blue-200 font-bold'
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      Em Aquisição
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
