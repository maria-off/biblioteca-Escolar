import React from 'react';
import { AuthUser } from '../types';
import { BookOpen, User, LogOut, ShieldCheck, GraduationCap, Mail } from 'lucide-react';

interface NavbarProps {
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  loanCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  activeSection,
  setActiveSection,
  loanCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button
            onClick={() => setActiveSection('catalogo')}
            className="flex items-center gap-2 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap block">
                Biblioteca Saber &amp; Aventura
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:block">
                Colégio Saber Integrado
              </span>
            </div>
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveSection('catalogo')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer border-b-2 ${
                activeSection === 'catalogo'
                  ? 'border-emerald-600 text-emerald-900 font-semibold'
                  : 'border-transparent'
              }`}
            >
              Catálogo de Livros
            </button>
            <button
              onClick={() => setActiveSection('emprestimos')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer border-b-2 flex items-center gap-1.5 ${
                activeSection === 'emprestimos'
                  ? 'border-emerald-600 text-emerald-900 font-semibold'
                  : 'border-transparent'
              }`}
            >
              <span>{currentUser?.role === 'librarian' ? 'Mesa do Bibliotecário (Empréstimos)' : 'Controle de Empréstimos'}</span>
              {loanCount > 0 && (
                <span className={`text-[11px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                  currentUser?.role === 'librarian' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {loanCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSection('novidades')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer border-b-2 ${
                activeSection === 'novidades'
                  ? 'border-emerald-600 text-emerald-900 font-semibold'
                  : 'border-transparent'
              }`}
            >
              Quando Chegam Novos
            </button>
            <button
              onClick={() => setActiveSection('sugestoes')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer border-b-2 ${
                activeSection === 'sugestoes'
                  ? 'border-emerald-600 text-emerald-900 font-semibold'
                  : 'border-transparent'
              }`}
            >
              Indicações de Leitura
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-900 leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {currentUser.role === 'librarian'
                      ? 'Bibliotecário(a)'
                      : `Aluno (${currentUser.matricula})`}
                  </span>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    currentUser.role === 'librarian' ? 'bg-amber-600' : 'bg-emerald-600'
                  }`}
                  title={currentUser.name}
                >
                  {currentUser.role === 'librarian' ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : (
                    <GraduationCap className="w-4 h-4" />
                  )}
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Sair da Conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Entrar (E-mail e Senha)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="md:hidden border-t border-slate-200 px-4 py-2 flex items-center justify-around text-xs font-medium text-slate-600 overflow-x-auto">
        <button
          onClick={() => setActiveSection('catalogo')}
          className={`py-1 px-2 whitespace-nowrap ${
            activeSection === 'catalogo' ? 'text-emerald-700 font-bold' : ''
          }`}
        >
          Catálogo
        </button>
        <button
          onClick={() => setActiveSection('emprestimos')}
          className={`py-1 px-2 whitespace-nowrap flex items-center gap-1 ${
            activeSection === 'emprestimos' ? 'text-emerald-700 font-bold' : ''
          }`}
        >
          <span>{currentUser?.role === 'librarian' ? 'Balcão' : 'Empréstimos'}</span>
          {loanCount > 0 && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded">
              {loanCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSection('novidades')}
          className={`py-1 px-2 whitespace-nowrap ${
            activeSection === 'novidades' ? 'text-emerald-700 font-bold' : ''
          }`}
        >
          Novos Livros
        </button>
        <button
          onClick={() => setActiveSection('sugestoes')}
          className={`py-1 px-2 whitespace-nowrap ${
            activeSection === 'sugestoes' ? 'text-emerald-700 font-bold' : ''
          }`}
        >
          Sugestões
        </button>
      </div>
    </header>
  );
};
