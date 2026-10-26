/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Book,
  Loan,
  UpcomingArrival,
  StudentSuggestion,
  StudentUser,
  LibrarianUser,
  AuthUser,
  BookOpinion,
  BookStatus,
} from './types';
import {
  INITIAL_BOOKS,
  INITIAL_LOANS,
  INITIAL_UPCOMING_ARRIVALS,
  INITIAL_SUGGESTIONS,
  DEFAULT_STUDENTS,
  DEFAULT_LIBRARIANS,
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { BookCatalog } from './components/BookCatalog';
import { BookDetailModal } from './components/BookDetailModal';
import { LoansManager } from './components/LoansManager';
import { UpcomingBooks } from './components/UpcomingBooks';
import { StudentSuggestionsView } from './components/StudentSuggestionsView';
import { AuthModal } from './components/AuthModal';
import { LibrarianStatusModal } from './components/LibrarianStatusModal';
import { AddBookModal } from './components/AddBookModal';
import { LoginPage } from './components/LoginPage';
import { CheckCircle2, AlertCircle, BookOpen, Heart } from 'lucide-react';

export default function App() {
  // Persistence state in localStorage
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('biblioteca_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('biblioteca_loans');
    return saved ? JSON.parse(saved) : INITIAL_LOANS;
  });

  const [upcomingArrivals, setUpcomingArrivals] = useState<UpcomingArrival[]>(() => {
    const saved = localStorage.getItem('biblioteca_upcoming');
    return saved ? JSON.parse(saved) : INITIAL_UPCOMING_ARRIVALS;
  });

  const [suggestions, setSuggestions] = useState<StudentSuggestion[]>(() => {
    const saved = localStorage.getItem('biblioteca_suggestions');
    return saved ? JSON.parse(saved) : INITIAL_SUGGESTIONS;
  });

  const [students, setStudents] = useState<StudentUser[]>(() => {
    const saved = localStorage.getItem('biblioteca_students');
    return saved ? JSON.parse(saved) : DEFAULT_STUDENTS;
  });

  const [librarians, setLibrarians] = useState<LibrarianUser[]>(() => {
    const saved = localStorage.getItem('biblioteca_librarians');
    return saved ? JSON.parse(saved) : DEFAULT_LIBRARIANS;
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('biblioteca_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('biblioteca_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('biblioteca_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('biblioteca_upcoming', JSON.stringify(upcomingArrivals));
  }, [upcomingArrivals]);

  useEffect(() => {
    localStorage.setItem('biblioteca_suggestions', JSON.stringify(suggestions));
  }, [suggestions]);

  useEffect(() => {
    localStorage.setItem('biblioteca_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('biblioteca_librarians', JSON.stringify(librarians));
  }, [librarians]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('biblioteca_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('biblioteca_current_user');
    }
  }, [currentUser]);

  // UI state
  const [activeSection, setActiveSection] = useState<string>('catalogo');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLibrarianModalOpen, setIsLibrarianModalOpen] = useState<boolean>(false);
  const [bookToEditStatus, setBookToEditStatus] = useState<Book | null>(null);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState<boolean>(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(
    null
  );

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // User Actions
  const handleRegisterStudent = (newStudent: StudentUser) => {
    setStudents((prev) => [...prev, newStudent]);
    showToast(`Aluno ${newStudent.name} cadastrado com sucesso!`);
  };

  const handleRegisterLibrarian = (newLibrarian: LibrarianUser) => {
    setLibrarians((prev) => [...prev, newLibrarian]);
    showToast(`Bibliotecário(a) ${newLibrarian.name} cadastrado(a) com sucesso!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Você saiu da sua conta.', 'info');
  };

  // Book Status Modification by Librarian
  const handleSaveBookStatus = (
    bookId: string,
    status: BookStatus,
    shelfLocation: string,
    totalCopies: number,
    availableCopies: number
  ) => {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId
          ? {
              ...b,
              status,
              shelfLocation,
              totalCopies,
              availableCopies,
            }
          : b
      )
    );

    // If modal is currently opened for this book, sync it
    if (selectedBook && selectedBook.id === bookId) {
      setSelectedBook((prev) =>
        prev
          ? {
              ...prev,
              status,
              shelfLocation,
              totalCopies,
              availableCopies,
            }
          : null
      );
    }

    const statusNames: Record<BookStatus, string> = {
      available: 'Está aqui na estante',
      reserved: 'Reservado',
      borrowed: 'Emprestado',
      lost: 'Perdido / Extraviado',
    };

    showToast(`Status atualizado para "${statusNames[status]}"!`);
  };

  // Add Book Opinion
  const handleAddOpinion = (bookId: string, opinionData: Omit<BookOpinion, 'id'>) => {
    const newOpinion: BookOpinion = {
      ...opinionData,
      id: `op-${Date.now()}`,
    };

    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, opinions: [newOpinion, ...b.opinions] } : b))
    );

    if (selectedBook && selectedBook.id === bookId) {
      setSelectedBook((prev) =>
        prev ? { ...prev, opinions: [newOpinion, ...prev.opinions] } : null
      );
    }

    showToast('Sua avaliação sobre o livro foi salva!');
  };

  // Student Reserves Book
  const handleReserveBook = (book: Book) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      showToast('Por favor, faça login ou cadastre-se para reservar.', 'info');
      return;
    }

    const studentName = currentUser.name;
    const studentId = currentUser.role === 'student' ? currentUser.matricula : '000000';
    const now = new Date();
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()}`;

    setBooks((prev) =>
      prev.map((b) =>
        b.id === book.id
          ? {
              ...b,
              status: 'reserved',
              availableCopies: Math.max(0, b.availableCopies - 1),
              reservedBy: {
                studentId,
                studentName,
                date: dateFormatted,
              },
            }
          : b
      )
    );

    if (selectedBook && selectedBook.id === book.id) {
      setSelectedBook((prev) =>
        prev
          ? {
              ...prev,
              status: 'reserved',
              availableCopies: Math.max(0, prev.availableCopies - 1),
              reservedBy: {
                studentId,
                studentName,
                date: dateFormatted,
              },
            }
          : null
      );
    }

    showToast(`Exemplar reservado com sucesso! Retire no balcão da biblioteca hoje.`);
  };

  // Register New Loan
  const handleRegisterLoan = (loanData: Omit<Loan, 'id' | 'status'>) => {
    const newLoan: Loan = {
      ...loanData,
      id: `loan-${Date.now()}`,
      status: 'active',
    };

    setLoans((prev) => [newLoan, ...prev]);

    // Update book copies and status
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === loanData.bookId) {
          const nextAvail = Math.max(0, b.availableCopies - 1);
          return {
            ...b,
            availableCopies: nextAvail,
            status: nextAvail === 0 ? 'borrowed' : b.status,
          };
        }
        return b;
      })
    );

    showToast(`Empréstimo registrado com sucesso! Devolução prevista para ${loanData.dueDate}.`);
  };

  // Confirm Loan Return
  const handleReturnLoan = (loanId: string, notes?: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    const todayStr = '2026-10-23';

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              status: 'returned',
              returnDate: todayStr,
              notes: notes || l.notes,
            }
          : l
      )
    );

    // Free up book copy and set status to available
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === loan.bookId) {
          return {
            ...b,
            availableCopies: Math.min(b.totalCopies, b.availableCopies + 1),
            status: 'available',
          };
        }
        return b;
      })
    );

    showToast('Devolução confirmada! O livro voltou a estar disponível na estante.');
  };

  // Renew Loan (+7 or +14 days)
  const handleRenewLoan = (loanId: string, additionalDays: number) => {
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id === loanId) {
          const currentDue = new Date(l.dueDate);
          currentDue.setDate(currentDue.getDate() + additionalDays);
          const newDueDate = currentDue.toISOString().split('T')[0];
          return {
            ...l,
            dueDate: newDueDate,
            status: 'active',
            renewalsCount: (l.renewalsCount || 0) + 1,
            notes: (l.notes ? `${l.notes} | ` : '') + `Renovado por +${additionalDays} dias no balcão.`,
          };
        }
        return l;
      })
    );
    showToast(`Prazo de devolução prorrogado com sucesso por mais ${additionalDays} dias!`);
  };

  // Mark Book as Lost
  const handleMarkLost = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    setLoans((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, status: 'overdue' } : l))
    );

    setBooks((prev) =>
      prev.map((b) => (b.id === loan.bookId ? { ...b, status: 'lost' } : b))
    );

    showToast('Exemplar marcado como perdido/extraviado no sistema da biblioteca.', 'info');
  };

  // Add New Book to Catalog (Librarian)
  const handleAddNewBook = (newBookData: Omit<Book, 'id' | 'opinions'>) => {
    const newBook: Book = {
      ...newBookData,
      id: `book-${Date.now()}`,
      opinions: [],
    };

    setBooks((prev) => [newBook, ...prev]);
    showToast(`Livro "${newBook.title}" cadastrado com sucesso no acervo!`);
  };

  // Vote on Upcoming Book
  const handleVoteUpcoming = (id: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      showToast('Faça login com sua matrícula para votar no livro!', 'info');
      return;
    }

    const userId = currentUser.role === 'student' ? currentUser.matricula : currentUser.name;

    setUpcomingArrivals((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const hasVoted = item.votedUserIds.includes(userId);
          if (hasVoted) {
            // unvote
            return {
              ...item,
              votes: Math.max(0, item.votes - 1),
              votedUserIds: item.votedUserIds.filter((u) => u !== userId),
            };
          } else {
            // vote
            return {
              ...item,
              votes: item.votes + 1,
              votedUserIds: [...item.votedUserIds, userId],
            };
          }
        }
        return item;
      })
    );

    showToast('Seu voto foi registrado! A biblioteca leva em conta os votos dos alunos.');
  };

  // Add Student Suggestion
  const handleAddSuggestion = (suggestionData: Omit<StudentSuggestion, 'id' | 'status' | 'date'>) => {
    const newSug: StudentSuggestion = {
      ...suggestionData,
      id: `sug-${Date.now()}`,
      status: 'Análise',
      date: '21/10/2026',
    };

    setSuggestions((prev) => [newSug, ...prev]);
    showToast('Indicação enviada com sucesso para a coordenação!');
  };

  // Update Suggestion Status
  const handleUpdateSuggestionStatus = (
    id: string,
    newStatus: 'Análise' | 'Aprovado para Compra' | 'Em Aquisição'
  ) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    showToast(`Status da sugestão atualizado para "${newStatus}".`);
  };

  // Quick stats
  const availableCount = books.filter((b) => b.status === 'available').length;
  const activeLoansCount = loans.filter((l) => l.status === 'active' || l.status === 'overdue').length;
  const upcomingCount = upcomingArrivals.length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xl border border-slate-700 animate-fadeIn">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setActiveSection('login')}
        onLogout={handleLogout}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        loanCount={activeLoansCount}
      />

      {/* Hero Section (always accessible or on catalogo) */}
      {activeSection === 'catalogo' && (
        <HeroBanner
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          availableCount={availableCount}
          activeLoanCount={activeLoansCount}
          upcomingCount={upcomingCount}
          currentUser={currentUser}
          onOpenAuth={() => setActiveSection('login')}
          onAddNewBook={() => setIsAddBookModalOpen(true)}
          onNavigateToLoans={() => setActiveSection('emprestimos')}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {activeSection === 'catalogo' && (
          <BookCatalog
            books={books}
            onSelectBook={(book) => setSelectedBook(book)}
            currentUser={currentUser}
            onOpenStatusModal={(book) => {
              setBookToEditStatus(book);
              setIsLibrarianModalOpen(true);
            }}
            onReserveBook={handleReserveBook}
            onAddNewBook={() => setIsAddBookModalOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activeSection === 'emprestimos' && (
          <LoansManager
            loans={loans}
            books={books}
            students={students}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onRegisterLoan={handleRegisterLoan}
            onReturnLoan={handleReturnLoan}
            onRenewLoan={handleRenewLoan}
            onMarkLost={handleMarkLost}
          />
        )}

        {activeSection === 'novidades' && (
          <UpcomingBooks
            upcomingArrivals={upcomingArrivals}
            suggestions={suggestions}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onVoteUpcoming={handleVoteUpcoming}
            onAddSuggestion={handleAddSuggestion}
            onAddUpcomingForecast={(data) => {
              const newUp: UpcomingArrival = {
                ...data,
                id: `up-${Date.now()}`,
                votes: 0,
                votedUserIds: [],
              };
              setUpcomingArrivals((prev) => [newUp, ...prev]);
              showToast('Nova previsão de chegada publicada para os alunos!');
            }}
          />
        )}

        {activeSection === 'sugestoes' && (
          <StudentSuggestionsView
            suggestions={suggestions}
            currentUser={currentUser}
            onOpenAuth={() => setActiveSection('login')}
            onAddSuggestion={handleAddSuggestion}
            onUpdateSuggestionStatus={handleUpdateSuggestionStatus}
          />
        )}

        {activeSection === 'login' && (
          <LoginPage
            onLogin={(user) => {
              setCurrentUser(user);
              showToast(`Bem-vindo(a), ${user.name}!`);
            }}
            students={students}
            librarians={librarians}
            onRegisterStudent={handleRegisterStudent}
            onRegisterLibrarian={handleRegisterLibrarian}
            onBackToCatalog={() => setActiveSection('catalogo')}
          />
        )}
      </main>

      {/* Book Detail & Opinion Modal */}
      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        currentUser={currentUser}
        onAddOpinion={handleAddOpinion}
        onUpdateStatus={(bookId, newStatus) => {
          handleSaveBookStatus(
            bookId,
            newStatus,
            selectedBook?.shelfLocation || '',
            selectedBook?.totalCopies || 1,
            selectedBook?.availableCopies || 1
          );
        }}
        onReserveBook={handleReserveBook}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Librarian Status Modal ("Está aqui", "Perdido", "Reservado") */}
      <LibrarianStatusModal
        book={bookToEditStatus}
        isOpen={isLibrarianModalOpen}
        onClose={() => {
          setIsLibrarianModalOpen(false);
          setBookToEditStatus(null);
        }}
        onSaveStatus={handleSaveBookStatus}
      />

      {/* Add New Book Modal */}
      <AddBookModal
        isOpen={isAddBookModalOpen}
        onClose={() => setIsAddBookModalOpen(false)}
        onAddBook={handleAddNewBook}
      />

      {/* Auth Modal (Login / Cadastro for Student and Librarian) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={(user) => {
          setCurrentUser(user);
          showToast(`Bem-vindo(a), ${user.name}!`);
        }}
        students={students}
        librarians={librarians}
        onRegisterStudent={handleRegisterStudent}
        onRegisterLibrarian={handleRegisterLibrarian}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-800 text-white flex items-center justify-center font-bold text-xs">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-800">
              Biblioteca Escolar Saber &amp; Aventura
            </span>
            <span aria-hidden="true">·</span>
            <span>Acervo Físico &amp; Gestão Escolar</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Horário de Funcionamento: Seg a Sex, das 07:30 às 17:30</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveSection('login')}
              className="text-emerald-700 hover:underline font-medium cursor-pointer"
            >
              {currentUser ? `Conectado: ${currentUser.name}` : 'Entrar com E-mail e Senha'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
