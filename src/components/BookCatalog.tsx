import React, { useState } from 'react';
import { Book, BookGenre, BookStatus, AuthUser } from '../types';
import { BookCard } from './BookCard';
import { Filter, Layers, CheckCircle2, Clock, AlertTriangle, BookOpen, Plus, Search } from 'lucide-react';

interface BookCatalogProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  currentUser: AuthUser | null;
  onOpenStatusModal: (book: Book) => void;
  onReserveBook: (book: Book) => void;
  onAddNewBook: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const GENRES: BookGenre[] = [
  'Todas as Categorias',
  'Literatura Juvenil',
  'Ficção Científica',
  'Fantasia & Magia',
  'Clássicos Brasileiros',
  'Mistério & Suspense',
  'História & Ciências',
  'HQs & Mangás',
  'Poesia & Teatro',
];

export const BookCatalog: React.FC<BookCatalogProps> = ({
  books,
  onSelectBook,
  currentUser,
  onOpenStatusModal,
  onReserveBook,
  onAddNewBook,
  searchQuery,
  setSearchQuery,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<BookGenre>('Todas as Categorias');
  const [statusFilter, setStatusFilter] = useState<'all' | BookStatus>('all');

  // Filter books
  const filteredBooks = books.filter((book) => {
    // Genre match
    if (selectedGenre !== 'Todas as Categorias' && book.genre !== selectedGenre) {
      return false;
    }
    // Status match
    if (statusFilter !== 'all' && book.status !== statusFilter) {
      return false;
    }
    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesTitle = book.title.toLowerCase().includes(q);
      const matchesAuthor = book.author.toLowerCase().includes(q);
      const matchesLocation = book.shelfLocation.toLowerCase().includes(q);
      const matchesIsbn = book.isbn.toLowerCase().includes(q);
      if (!matchesTitle && !matchesAuthor && !matchesLocation && !matchesIsbn) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Librarian Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-editorial tracking-tight">
            Acervo Físico da Biblioteca
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Escolha seu livro por gênero, verifique em qual estante ele está e retire no balcão da escola.
          </p>
        </div>

        {currentUser?.role === 'librarian' && (
          <button
            onClick={onAddNewBook}
            className="self-start sm:self-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Livro no Acervo</span>
          </button>
        )}
      </div>

      {/* Genre Filter Tabs */}
      <div className="pt-6">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-emerald-700" />
          <span>Separar por Gênero Literário:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {GENRES.map((genre) => {
            const count =
              genre === 'Todas as Categorias'
                ? books.length
                : books.filter((b) => b.genre === genre).length;

            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedGenre === genre
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{genre}</span>
                <span
                  className={`text-[10px] font-mono px-1 rounded ${
                    selectedGenre === genre ? 'bg-emerald-900/60 text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Filter Buttons (Está aqui, Reservado, Emprestado, Perdido) */}
      <div className="pt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Status do Livro:</span>
        </span>

        <button
          onClick={() => setStatusFilter('all')}
          className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white font-medium'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todos ({books.length})
        </button>

        <button
          onClick={() => setStatusFilter('available')}
          className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
            statusFilter === 'available'
              ? 'bg-emerald-700 text-white font-medium'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Está aqui na estante ({books.filter((b) => b.status === 'available').length})</span>
        </button>

        <button
          onClick={() => setStatusFilter('reserved')}
          className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
            statusFilter === 'reserved'
              ? 'bg-amber-600 text-white font-medium'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Reservado ({books.filter((b) => b.status === 'reserved').length})</span>
        </button>

        <button
          onClick={() => setStatusFilter('borrowed')}
          className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
            statusFilter === 'borrowed'
              ? 'bg-blue-600 text-white font-medium'
              : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Emprestado ({books.filter((b) => b.status === 'borrowed').length})</span>
        </button>

        <button
          onClick={() => setStatusFilter('lost')}
          className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
            statusFilter === 'lost'
              ? 'bg-rose-700 text-white font-medium'
              : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Perdido ({books.filter((b) => b.status === 'lost').length})</span>
        </button>
      </div>

      {/* Results Header Count */}
      <div className="pt-6 pb-4 flex items-center justify-between text-xs text-slate-500">
        <div>
          Mostrando <span className="font-semibold text-slate-900 font-mono">{filteredBooks.length}</span> exemplares no catálogo
          {selectedGenre !== 'Todas as Categorias' && (
            <span> em <strong className="text-slate-800">{selectedGenre}</strong></span>
          )}
          {searchQuery && (
            <span> para a busca &ldquo;<strong className="text-slate-800">{searchQuery}</strong>&rdquo;</span>
          )}
        </div>

        {(selectedGenre !== 'Todas as Categorias' || statusFilter !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedGenre('Todas as Categorias');
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className="text-emerald-700 hover:underline font-medium cursor-pointer"
          >
            Limpar todos os filtros
          </button>
        )}
      </div>

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onSelectBook={onSelectBook}
              currentUser={currentUser}
              onOpenStatusModal={onOpenStatusModal}
              onReserveBook={onReserveBook}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 my-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Nenhum livro encontrado com esses filtros</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Tente selecionar outro gênero ou alterar o status do filtro. Você também pode sugerir a inclusão desse livro para a escola!
          </p>
          <button
            onClick={() => {
              setSelectedGenre('Todas as Categorias');
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Ver Todo o Acervo
          </button>
        </div>
      )}
    </div>
  );
};
