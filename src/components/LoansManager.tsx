import React, { useState } from 'react';
import { Loan, Book, AuthUser, StudentUser } from '../types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Plus,
  Search,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FileText,
  User,
  MapPin,
  Filter,
  Check,
  AlertCircle,
  HelpCircle,
  ArrowUpDown,
} from 'lucide-react';
import { LoanReceiptModal } from './LoanReceiptModal';

interface LoansManagerProps {
  loans: Loan[];
  books: Book[];
  students: StudentUser[];
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  onRegisterLoan: (loanData: Omit<Loan, 'id' | 'status'>) => void;
  onReturnLoan: (loanId: string, notes?: string) => void;
  onRenewLoan: (loanId: string, additionalDays: number) => void;
  onMarkLost: (loanId: string) => void;
}

export const LoansManager: React.FC<LoansManagerProps> = ({
  loans,
  books,
  students,
  currentUser,
  onOpenAuth,
  onRegisterLoan,
  onReturnLoan,
  onRenewLoan,
  onMarkLost,
}) => {
  // Filters & Views
  const [filterType, setFilterType] = useState<
    'active' | 'today' | 'overdue' | 'returned' | 'all'
  >('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showOnlyMine, setShowOnlyMine] = useState<boolean>(currentUser?.role === 'student');

  // Modals state
  const [showNewLoanModal, setShowNewLoanModal] = useState(false);
  const [receiptLoan, setReceiptLoan] = useState<Loan | null>(null);
  const [returnConfirmLoan, setReturnConfirmLoan] = useState<Loan | null>(null);
  const [returnNotes, setReturnNotes] = useState('Devolvido em perfeito estado de conservação.');

  // New Loan Form state
  const [selectedBookId, setSelectedBookId] = useState<string>(
    books.find((b) => b.status === 'available')?.id || books[0]?.id || ''
  );
  const [selectedStudentMode, setSelectedStudentMode] = useState<'registered' | 'custom'>('registered');
  const [selectedStudentMatricula, setSelectedStudentMatricula] = useState<string>(
    students[0]?.matricula || ''
  );
  const [customStudentId, setCustomStudentId] = useState('');
  const [customStudentName, setCustomStudentName] = useState('');
  const [customStudentGrade, setCustomStudentGrade] = useState('9º Ano A');

  // Today reference is fixed to current simulated date: 2026-10-23
  const todayStr = '2026-10-23';
  const [checkoutDate, setCheckoutDate] = useState<string>(todayStr);
  const [dueDate, setDueDate] = useState<string>('2026-11-06'); // +14 days
  const [loanPeriodDays, setLoanPeriodDays] = useState<number>(14);
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Calculate days remaining or overdue relative to today (2026-10-23)
  const calculateDaysRemaining = (dueDateStr: string) => {
    const today = new Date(todayStr);
    const due = new Date(dueDateStr);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate how many days the book has been with the student
  const calculateDaysPossessed = (checkoutDateStr: string) => {
    const today = new Date(todayStr);
    const checkout = new Date(checkoutDateStr);
    const diffTime = today.getTime() - checkout.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Shortcut for setting quick due dates
  const handleQuickPeriodChange = (days: number) => {
    setLoanPeriodDays(days);
    const checkout = new Date(checkoutDate);
    const due = new Date(checkout);
    due.setDate(due.getDate() + days);
    setDueDate(due.toISOString().split('T')[0]);
  };

  // Filtered Loans
  const filteredLoans = loans.filter((loan) => {
    // If student mode active
    if (showOnlyMine && currentUser?.role === 'student') {
      if (loan.studentId !== currentUser.matricula) return false;
    }

    const daysRemaining = calculateDaysRemaining(loan.dueDate);
    const isDueToday = loan.status === 'active' && daysRemaining === 0;
    const isOverdue =
      loan.status === 'overdue' || (loan.status === 'active' && daysRemaining < 0);

    // Filter type
    if (filterType === 'active') {
      if (loan.status !== 'active') return false;
    } else if (filterType === 'today') {
      if (!isDueToday) return false;
    } else if (filterType === 'overdue') {
      if (!isOverdue) return false;
    } else if (filterType === 'returned') {
      if (loan.status !== 'returned') return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesStudent =
        loan.studentName.toLowerCase().includes(q) ||
        loan.studentId.toLowerCase().includes(q) ||
        loan.studentGrade.toLowerCase().includes(q);
      const matchesBook =
        loan.bookTitle.toLowerCase().includes(q) ||
        (loan.shelfLocation && loan.shelfLocation.toLowerCase().includes(q));
      if (!matchesStudent && !matchesBook) return false;
    }

    return true;
  });

  // KPI Metrics for the Librarian
  const totalActiveLoans = loans.filter((l) => l.status === 'active').length;
  const overdueLoansCount = loans.filter(
    (l) => l.status === 'overdue' || (l.status === 'active' && calculateDaysRemaining(l.dueDate) < 0)
  ).length;
  const loansDueTodayCount = loans.filter(
    (l) => l.status === 'active' && calculateDaysRemaining(l.dueDate) === 0
  ).length;
  const totalReturnedCount = loans.filter((l) => l.status === 'returned').length;

  // Handle Create Loan
  const handleCreateLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedBookId) {
      setFormError('Selecione um livro do acervo.');
      return;
    }

    const book = books.find((b) => b.id === selectedBookId);
    if (!book) {
      setFormError('Livro não encontrado no acervo.');
      return;
    }

    let studentMatriculaFinal = '';
    let studentNameFinal = '';
    let studentGradeFinal = '';

    if (selectedStudentMode === 'registered') {
      const regStudent = students.find((s) => s.matricula === selectedStudentMatricula);
      if (!regStudent) {
        setFormError('Selecione um aluno cadastrado.');
        return;
      }
      studentMatriculaFinal = regStudent.matricula;
      studentNameFinal = regStudent.name;
      studentGradeFinal = regStudent.grade;
    } else {
      if (!customStudentId.trim() || !customStudentName.trim()) {
        setFormError('Preencha a matrícula e o nome completo do aluno.');
        return;
      }
      studentMatriculaFinal = customStudentId.trim();
      studentNameFinal = customStudentName.trim();
      studentGradeFinal = customStudentGrade.trim() || 'Ensino Fundamental/Médio';
    }

    if (!checkoutDate || !dueDate) {
      setFormError('Informe a data que pegou e a data de devolução.');
      return;
    }

    onRegisterLoan({
      bookId: book.id,
      bookTitle: book.title,
      bookCover: book.coverUrl,
      shelfLocation: book.shelfLocation,
      studentId: studentMatriculaFinal,
      studentName: studentNameFinal,
      studentGrade: studentGradeFinal,
      checkoutDate,
      dueDate,
      librarianName: currentUser?.role === 'librarian' ? currentUser.name : 'Profª Helena Vasconcelos',
      notes: notes.trim(),
    });

    setShowNewLoanModal(false);
    setNotes('');
  };

  const handleConfirmReturn = () => {
    if (!returnConfirmLoan) return;
    onReturnLoan(returnConfirmLoan.id, returnNotes);
    setReturnConfirmLoan(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Librarian Header Focus Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Mesa de Controle do Balcão da Biblioteca</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-editorial text-white">
              Qual Livro Ele Pegou · Data que Pegou · Data de Devolução
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Painel operacional da equipe da biblioteca para gerenciar a circulação dos livros físicos: controle de quem pegou cada exemplar, prazos de devolução, renovações e comprovantes de balcão.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {currentUser?.role === 'student' && (
              <button
                onClick={() => setShowOnlyMine(!showOnlyMine)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                  showOnlyMine
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-white/10 text-slate-200 border-white/20 hover:bg-white/20'
                }`}
              >
                {showOnlyMine ? 'Exibindo: Apenas Meus Livros' : 'Exibindo: Todos os Alunos'}
              </button>
            )}

            <button
              onClick={() => setShowNewLoanModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Empréstimo no Balcão</span>
            </button>
          </div>
        </div>

        {/* 4 Librarian Operational KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div
            onClick={() => setFilterType('active')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              filterType === 'active'
                ? 'bg-white/15 border-emerald-400'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Empréstimos em Andamento</span>
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
              {totalActiveLoans}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">Exemplares com alunos</span>
          </div>

          <div
            onClick={() => setFilterType('today')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              filterType === 'today'
                ? 'bg-amber-500/20 border-amber-400'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-amber-200 mb-1">
              <span>Devoluções para Hoje</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-400">
              {loansDueTodayCount}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">23 de Outubro de 2026</span>
          </div>

          <div
            onClick={() => setFilterType('overdue')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              filterType === 'overdue'
                ? 'bg-rose-500/20 border-rose-400'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-rose-200 mb-1">
              <span>Exemplares Atrasados</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-rose-400">
              {overdueLoansCount}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">Requer cobrança</span>
          </div>

          <div
            onClick={() => setFilterType('returned')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              filterType === 'returned'
                ? 'bg-white/15 border-blue-400'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-blue-200 mb-1">
              <span>Já Devolvidos</span>
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-blue-400">
              {totalReturnedCount}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">Histórico completo</span>
          </div>
        </div>
      </div>

      {/* Control Strip: Search & Filter Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input for Librarian */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome do aluno, matrícula ou livro emprestado..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Segmented Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterType('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'active'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Ativos ({totalActiveLoans})
          </button>
          <button
            onClick={() => setFilterType('today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'today'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Vencem Hoje ({loansDueTodayCount})
          </button>
          <button
            onClick={() => setFilterType('overdue')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'overdue'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Atrasados ({overdueLoansCount})
          </button>
          <button
            onClick={() => setFilterType('returned')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'returned'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Devolvidos ({totalReturnedCount})
          </button>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todos ({loans.length})
          </button>
        </div>

        {/* View mode toggle (Cards vs Table) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fichas Grandes
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tabela Balcão
          </button>
        </div>
      </div>

      {/* Results Count & Action Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div>
          Exibindo <span className="font-bold text-slate-900 font-mono">{filteredLoans.length}</span> registros de circulação
          {searchQuery && (
            <span> correspondentes à busca &ldquo;<strong className="text-slate-800">{searchQuery}</strong>&rdquo;</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">
            Data de Referência da Biblioteca: <strong>23/10/2026</strong>
          </span>
        </div>
      </div>

      {/* VIEW MODE 1: CARDS (DETALHADO FOCADO NO BIBLIOTECÁRIO) */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {filteredLoans.length > 0 ? (
            filteredLoans.map((loan) => {
              const daysRemaining = calculateDaysRemaining(loan.dueDate);
              const daysPossessed = calculateDaysPossessed(loan.checkoutDate);
              const isDueToday = loan.status === 'active' && daysRemaining === 0;
              const isOverdue =
                loan.status === 'overdue' || (loan.status === 'active' && daysRemaining < 0);
              const bookInfo = books.find((b) => b.id === loan.bookId);

              return (
                <div
                  key={loan.id}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-xs hover:shadow-md ${
                    isOverdue
                      ? 'border-rose-300 ring-1 ring-rose-200'
                      : isDueToday
                      ? 'border-amber-400 ring-1 ring-amber-200 bg-amber-50/20'
                      : loan.status === 'returned'
                      ? 'border-slate-200 bg-slate-50/40 opacity-80'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                    {/* SECTION 1: QUAL LIVRO ELE PEGOU (4 cols) */}
                    <div className="lg:col-span-4 flex items-start gap-3.5">
                      <div className="w-16 sm:w-20 aspect-3/4 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-xs relative">
                        {loan.bookCover ? (
                          <img
                            src={loan.bookCover}
                            alt={loan.bookTitle}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white p-1 text-center">
                            <BookOpen className="w-6 h-6 text-slate-400 mb-1" />
                            <span className="text-[9px] leading-tight font-medium">Acervo</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                          Qual Livro Ele Pegou:
                        </span>
                        <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                          {loan.bookTitle}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="font-medium truncate">
                            {loan.shelfLocation || bookInfo?.shelfLocation || 'Estante Principal'}
                          </span>
                        </div>
                        {bookInfo?.author && (
                          <span className="text-[11px] text-slate-500 block">
                            Autor: {bookInfo.author}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* SECTION 2: QUEM PEGOU (ALUNO) (3 cols) */}
                    <div className="lg:col-span-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Aluno Responsável:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {loan.studentName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500 font-mono text-[11px]">
                          Matrícula: <strong className="text-emerald-900">{loan.studentId}</strong>
                        </span>
                        <span className="text-slate-600 font-medium text-[11px]">
                          {loan.studentGrade}
                        </span>
                      </div>
                    </div>

                    {/* SECTION 3: DATA QUE PEGOU & DATA DE DEVOLUÇÃO (3 cols) */}
                    <div className="lg:col-span-3 grid grid-cols-2 gap-2">
                      {/* Data que pegou */}
                      <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
                        <span className="text-[9px] uppercase font-bold text-emerald-800 block tracking-wider leading-tight">
                          Data que Pegou:
                        </span>
                        <span className="text-xs sm:text-sm font-bold font-mono text-emerald-950 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          {formatDateDisplay(loan.checkoutDate)}
                        </span>
                        <span className="text-[10px] text-emerald-800 block mt-0.5">
                          Há {daysPossessed} {daysPossessed === 1 ? 'dia' : 'dias'}
                        </span>
                      </div>

                      {/* Data de Devolução */}
                      <div
                        className={`p-2.5 rounded-xl border ${
                          isOverdue
                            ? 'bg-rose-50 border-rose-300'
                            : isDueToday
                            ? 'bg-amber-50 border-amber-300'
                            : 'bg-slate-100/90 border-slate-200'
                        }`}
                      >
                        <span
                          className={`text-[9px] uppercase font-bold block tracking-wider leading-tight ${
                            isOverdue
                              ? 'text-rose-800'
                              : isDueToday
                              ? 'text-amber-800'
                              : 'text-slate-600'
                          }`}
                        >
                          Data de Devolução:
                        </span>
                        <span
                          className={`text-xs sm:text-sm font-bold font-mono flex items-center gap-1 mt-0.5 ${
                            isOverdue
                              ? 'text-rose-900'
                              : isDueToday
                              ? 'text-amber-900'
                              : 'text-slate-900'
                          }`}
                        >
                          <Calendar
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isOverdue
                                ? 'text-rose-600'
                                : isDueToday
                                ? 'text-amber-600'
                                : 'text-slate-500'
                            }`}
                          />
                          {formatDateDisplay(loan.dueDate)}
                        </span>
                        <span
                          className={`text-[10px] font-semibold block mt-0.5 ${
                            isOverdue
                              ? 'text-rose-700'
                              : isDueToday
                              ? 'text-amber-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {loan.status === 'returned'
                            ? `Devolvido`
                            : isOverdue
                            ? `Atrasado há ${Math.abs(daysRemaining)}d`
                            : isDueToday
                            ? `VENCE HOJE!`
                            : `Faltam ${daysRemaining} dias`}
                        </span>
                      </div>
                    </div>

                    {/* SECTION 4: AÇÕES DO BIBLIOTECÁRIO (2 cols) */}
                    <div className="lg:col-span-2 flex flex-col gap-1.5 shrink-0">
                      {loan.status !== 'returned' ? (
                        <>
                          <button
                            onClick={() => {
                              setReturnConfirmLoan(loan);
                              setReturnNotes(
                                `Devolvido no balcão da biblioteca em 23/10/2026 com ${
                                  currentUser?.name || 'Profª Helena'
                                }.`
                              );
                            }}
                            className="w-full py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Receber Livro</span>
                          </button>

                          <div className="grid grid-cols-2 gap-1">
                            <button
                              onClick={() => onRenewLoan(loan.id, 7)}
                              className="py-1 px-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-medium rounded-lg transition-colors flex items-center justify-center gap-0.5 cursor-pointer"
                              title="Prorrogar devolução em 7 dias"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>+7 dias</span>
                            </button>
                            <button
                              onClick={() => onRenewLoan(loan.id, 14)}
                              className="py-1 px-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-medium rounded-lg transition-colors flex items-center justify-center gap-0.5 cursor-pointer"
                              title="Prorrogar devolução em 14 dias"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>+14 dias</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setReceiptLoan(loan)}
                              className="flex-1 py-1 px-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 text-[11px] font-medium rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              title="Emitir Comprovante Escolar"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Comprovante</span>
                            </button>
                            <button
                              onClick={() => onMarkLost(loan.id)}
                              className="py-1 px-2 text-rose-700 hover:bg-rose-50 border border-rose-200 text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
                              title="Marcar exemplar como perdido"
                            >
                              Perdido
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-1 text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Devolvido em {formatDateDisplay(loan.returnDate || '')}</span>
                          </span>
                          <button
                            onClick={() => setReceiptLoan(loan)}
                            className="w-full py-1 text-xs text-slate-600 hover:text-slate-900 underline block"
                          >
                            Ver Comprovante
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {loan.notes && (
                    <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500 italic flex items-center gap-1.5">
                      <span className="font-semibold not-italic text-slate-600">Anotação do Balcão:</span>
                      <span>{loan.notes}</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Nenhum empréstimo encontrado</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Não há registros com os filtros atuais selecionados.
              </p>
              <button
                onClick={() => {
                  setFilterType('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Limpar Filtros e Ver Todos
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: TABELA DE CIRCULAÇÃO DO BIBLIOTECÁRIO */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Qual Livro Ele Pegou</th>
                  <th className="py-3 px-4">Quem Pegou (Aluno)</th>
                  <th className="py-3 px-4">Data que Pegou</th>
                  <th className="py-3 px-4">Data de Devolução</th>
                  <th className="py-3 px-4">Situação / Prazo</th>
                  <th className="py-3 px-4 text-right">Ações do Balcão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLoans.length > 0 ? (
                  filteredLoans.map((loan) => {
                    const daysRemaining = calculateDaysRemaining(loan.dueDate);
                    const isDueToday = loan.status === 'active' && daysRemaining === 0;
                    const isOverdue =
                      loan.status === 'overdue' ||
                      (loan.status === 'active' && daysRemaining < 0);

                    return (
                      <tr
                        key={loan.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isOverdue ? 'bg-rose-50/30' : isDueToday ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        {/* Qual Livro */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            {loan.bookCover && (
                              <img
                                src={loan.bookCover}
                                alt={loan.bookTitle}
                                referrerPolicy="no-referrer"
                                className="w-9 aspect-3/4 object-cover rounded border border-slate-200 shrink-0"
                              />
                            )}
                            <div>
                              <span className="font-bold text-slate-900 block leading-tight">
                                {loan.bookTitle}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {loan.shelfLocation || 'Estante Geral'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Quem Pegou */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">
                            {loan.studentName}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {loan.studentId} · {loan.studentGrade}
                          </span>
                        </td>

                        {/* Data que pegou */}
                        <td className="py-3 px-4 font-mono font-medium text-slate-800">
                          {formatDateDisplay(loan.checkoutDate)}
                        </td>

                        {/* Data de Devolução */}
                        <td className="py-3 px-4 font-mono font-bold">
                          <span
                            className={
                              isOverdue
                                ? 'text-rose-700'
                                : isDueToday
                                ? 'text-amber-700'
                                : 'text-emerald-800'
                            }
                          >
                            {formatDateDisplay(loan.dueDate)}
                          </span>
                        </td>

                        {/* Situação / Prazo */}
                        <td className="py-3 px-4">
                          {loan.status === 'returned' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              Devolvido
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded">
                              Atrasado ({Math.abs(daysRemaining)}d)
                            </span>
                          ) : isDueToday ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                              Vence Hoje!
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              No prazo ({daysRemaining}d)
                            </span>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="py-3 px-4 text-right">
                          {loan.status !== 'returned' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setReturnConfirmLoan(loan);
                                  setReturnNotes('Devolvido em perfeitas condições no balcão.');
                                }}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold cursor-pointer"
                              >
                                Receber
                              </button>
                              <button
                                onClick={() => onRenewLoan(loan.id, 7)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[11px] cursor-pointer"
                                title="Prorrogar 7 dias"
                              >
                                +7d
                              </button>
                              <button
                                onClick={() => setReceiptLoan(loan)}
                                className="p-1 text-slate-600 hover:text-slate-900 bg-slate-100 rounded cursor-pointer"
                                title="Comprovante"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setReceiptLoan(loan)}
                              className="text-[11px] text-slate-600 hover:underline"
                            >
                              Comprovante
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CONFIRMAR DEVOLUÇÃO COM NOTA */}
      {returnConfirmLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-sm">Confirmar Recebimento de Devolução</h3>
              </div>
              <button
                onClick={() => setReturnConfirmLoan(null)}
                className="text-white/80 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Livro a ser recebido:
                </span>
                <span className="font-bold text-slate-900 text-sm block">
                  {returnConfirmLoan.bookTitle}
                </span>
                <span className="text-slate-600 block">
                  Devolvido por: <strong>{returnConfirmLoan.studentName}</strong> (
                  {returnConfirmLoan.studentId})
                </span>
                <span className="text-slate-500 block text-[11px]">
                  Guardar de volta em: <strong>{returnConfirmLoan.shelfLocation || 'Estante do acervo'}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data Efetiva de Entrega:
                </label>
                <input
                  type="text"
                  disabled
                  value="23/10/2026 (Hoje)"
                  className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estado do Exemplar / Observação da Bibliotecária:
                </label>
                <textarea
                  rows={2}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnConfirmLoan(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReturn}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Confirmar Devolução na Estante
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTRAR NOVO EMPRÉSTIMO NO BALCÃO */}
      {showNewLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/30">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Novo Empréstimo no Balcão</h3>
                  <p className="text-xs text-slate-300">
                    Registre qual livro ele pegou, a data de retirada e o prazo de devolução
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewLoanModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLoanSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {formError}
                </div>
              )}

              {/* QUAL LIVRO ELE PEGOU */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  1. Qual Livro Ele Pegou? *
                </label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} — {b.shelfLocation} (
                      {b.status === 'available'
                        ? 'Está aqui'
                        : b.status === 'borrowed'
                        ? 'Emprestado'
                        : b.status === 'reserved'
                        ? 'Reservado'
                        : 'Perdido'}
                      )
                    </option>
                  ))}
                </select>

                {(() => {
                  const currBook = books.find((b) => b.id === selectedBookId);
                  if (!currBook) return null;
                  return (
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        Localização física na estante: <strong>{currBook.shelfLocation}</strong>
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* QUEM PEGOU (ALUNO) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    2. Quem Pegou (Identificação do Aluno) *
                  </label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentMode('registered')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        selectedStudentMode === 'registered'
                          ? 'bg-emerald-700 text-white font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Aluno Cadastrado
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStudentMode('custom')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        selectedStudentMode === 'custom'
                          ? 'bg-emerald-700 text-white font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Digitar Novo
                    </button>
                  </div>
                </div>

                {selectedStudentMode === 'registered' ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Selecione o Aluno pelo Nome ou Matrícula:
                    </label>
                    <select
                      value={selectedStudentMatricula}
                      onChange={(e) => setSelectedStudentMatricula(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    >
                      {students.map((s) => (
                        <option key={s.matricula} value={s.matricula}>
                          Matrícula {s.matricula} — {s.name} ({s.grade})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Matrícula *
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 202415"
                          value={customStudentId}
                          onChange={(e) => setCustomStudentId(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-amber-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Série / Turma
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 8º Ano C"
                          value={customStudentGrade}
                          onChange={(e) => setCustomStudentGrade(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Nome Completo do Aluno *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Amanda Santos"
                        value={customStudentName}
                        onChange={(e) => setCustomStudentName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* DATAS: DATA QUE PEGOU & DATA DE DEVOLUÇÃO */}
              <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    3. Datas do Empréstimo
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-amber-800 font-medium mr-1">Prazo Rápido:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickPeriodChange(7)}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        loanPeriodDays === 7 ? 'bg-amber-600 text-white font-bold' : 'bg-white text-amber-900 border border-amber-200'
                      }`}
                    >
                      7 dias
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPeriodChange(14)}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        loanPeriodDays === 14 ? 'bg-amber-600 text-white font-bold' : 'bg-white text-amber-900 border border-amber-200'
                      }`}
                    >
                      14 dias (Padrão)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPeriodChange(21)}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        loanPeriodDays === 21 ? 'bg-amber-600 text-white font-bold' : 'bg-white text-amber-900 border border-amber-200'
                      }`}
                    >
                      21 dias
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Data que Pegou:
                    </label>
                    <input
                      type="date"
                      value={checkoutDate}
                      onChange={(e) => setCheckoutDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Data de Devolução:
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações do Balcão (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Retirado para pesquisa escolar no laboratório de ciências"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowNewLoanModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Confirmar Empréstimo no Balcão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECIBO / COMPROVANTE OFICIAL */}
      <LoanReceiptModal
        loan={receiptLoan}
        book={books.find((b) => b.id === receiptLoan?.bookId)}
        isOpen={Boolean(receiptLoan)}
        onClose={() => setReceiptLoan(null)}
      />
    </div>
  );
};
