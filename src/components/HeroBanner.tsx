import React from 'react';
import { Search, MapPin, Sparkles, BookCheck, Clock, BookOpen } from 'lucide-react';
import { AuthUser } from '../types';

interface HeroBannerProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  availableCount: number;
  activeLoanCount: number;
  upcomingCount: number;
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  onAddNewBook?: () => void;
  onNavigateToLoans?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  setSearchQuery,
  availableCount,
  activeLoanCount,
  upcomingCount,
  currentUser,
  onOpenAuth,
  onAddNewBook,
  onNavigateToLoans,
}) => {
  return (
    <div className="relative bg-slate-900 text-white overflow-hidden border-b border-slate-800">
      {/* Background with library photo and measured scrim overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_biblioteca_escolar_1792594012748.jpg"
          alt="Espaço da biblioteca escolar com estantes de livros"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-25 filter blur-[0.5px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
              <MapPin className="w-4 h-4" />
              <span>Colégio Saber · Biblioteca Central - Bloco Cultural</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-editorial leading-tight">
              Pegue seu próximo livro físico na biblioteca da escola
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Consulte os livros que estão aqui na estante ou reservados, acompanhe o dia exato em que pegou e o dia de entregar, leia a opinião dos colegas e fique por dentro das datas de chegada dos novos lançamentos.
            </p>

            {/* Search Input */}
            <div className="pt-2 max-w-xl">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Pesquise por título do livro, autor ou código ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-slate-400 rounded-xl border border-white/20 focus:border-emerald-500 focus:outline-none transition-all text-sm backdrop-blur-md"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-xs text-slate-400 hover:text-white px-2 py-1"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Dica: Os livros são físicos! Você pesquisa aqui e retira no balcão da escola.</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics & User Action Card */}
          <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Status do Acervo Físico
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">Hoje: 21 de Outubro</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="block text-2xl font-bold font-mono text-emerald-400">
                  {availableCount}
                </span>
                <span className="text-[11px] text-slate-300 leading-tight block mt-1">
                  Estão Aqui (Prateleira)
                </span>
              </div>
              <div
                onClick={onNavigateToLoans}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-blue-400/40 transition-all cursor-pointer"
                title="Ver Mesa do Bibliotecário e Controle de Empréstimos"
              >
                <span className="block text-2xl font-bold font-mono text-blue-400">
                  {activeLoanCount}
                </span>
                <span className="text-[11px] text-slate-300 leading-tight block mt-1">
                  Empréstimos Ativos →
                </span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="block text-2xl font-bold font-mono text-amber-400">
                  {upcomingCount}
                </span>
                <span className="text-[11px] text-slate-300 leading-tight block mt-1">
                  Novos Chegando
                </span>
              </div>
            </div>

            {/* User status or action */}
            <div className="pt-2">
              {currentUser ? (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-emerald-200 block">Conectado como</span>
                    <span className="text-sm font-bold text-white block">{currentUser.name}</span>
                    <span className="text-[11px] text-emerald-300">
                      {currentUser.role === 'librarian' ? 'Equipe da Biblioteca' : `Aluno: ${currentUser.matricula}`}
                    </span>
                  </div>
                  {currentUser.role === 'librarian' && onAddNewBook && (
                    <button
                      onClick={onAddNewBook}
                      className="text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      + Novo Livro
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-slate-200 block">Acesso do Estudante / Equipe</span>
                    <span className="text-[11px] text-slate-400">Consulte seus prazos de devolução</span>
                  </div>
                  <button
                    onClick={onOpenAuth}
                    className="text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Entrar / Cadastrar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
