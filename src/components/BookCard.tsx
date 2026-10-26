import React from 'react';
import { Book, AuthUser, BookStatus } from '../types';
import { BookOpen, Star, MapPin, CheckCircle, Clock, AlertTriangle, XCircle, MessageSquare } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onSelectBook: (book: Book) => void;
  currentUser: AuthUser | null;
  onOpenStatusModal?: (book: Book) => void;
  onReserveBook?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onSelectBook,
  currentUser,
  onOpenStatusModal,
  onReserveBook,
}) => {
  // Calculate average rating
  const avgRating =
    book.opinions.length > 0
      ? (
          book.opinions.reduce((acc, curr) => acc + curr.rating, 0) /
          book.opinions.length
        ).toFixed(1)
      : null;

  // Status visual attributes
  const getStatusDisplay = (status: BookStatus) => {
    switch (status) {
      case 'available':
        return {
          label: 'Está aqui na estante',
          sub: 'Disponível para pegar',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          dot: 'bg-emerald-600',
          icon: CheckCircle,
        };
      case 'reserved':
        return {
          label: 'Reservado',
          sub: 'Aguardando retirada no balcão',
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          dot: 'bg-amber-600',
          icon: Clock,
        };
      case 'borrowed':
        return {
          label: 'Emprestado',
          sub: 'Com aluno da escola',
          color: 'text-blue-700 bg-blue-50 border-blue-200',
          dot: 'bg-blue-600',
          icon: BookOpen,
        };
      case 'lost':
        return {
          label: 'Perdido / Extraviado',
          sub: 'Indisponível no momento',
          color: 'text-rose-700 bg-rose-50 border-rose-200',
          dot: 'bg-rose-600',
          icon: AlertTriangle,
        };
    }
  };

  const statusConfig = getStatusDisplay(book.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col h-full group overflow-hidden">
      {/* Cover Image Container */}
      <div
        onClick={() => onSelectBook(book)}
        className="relative aspect-3/4 bg-slate-100 overflow-hidden cursor-pointer"
      >
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`Capa do livro ${book.title}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-800 to-slate-900 text-white">
            <BookOpen className="w-12 h-12 text-slate-400 mb-3" />
            <h4 className="font-editorial text-base font-bold line-clamp-3 leading-snug">
              {book.title}
            </h4>
            <span className="text-xs text-slate-300 mt-2 font-medium">{book.author}</span>
            <span className="text-[10px] text-amber-400 mt-3 font-mono">Acervo Físico</span>
          </div>
        )}

        {/* Shelf Location banner at bottom of cover */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent p-3 pt-6 text-white flex items-center gap-1.5 text-xs">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-medium truncate">{book.shelfLocation}</span>
        </div>
      </div>

      {/* Body details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata without pills: clean unboxed with dot separators */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <span className="font-medium text-emerald-800">{book.genre}</span>
            <span aria-hidden="true">·</span>
            <span>{book.pages} págs</span>
            <span aria-hidden="true">·</span>
            <span>{book.year}</span>
          </div>

          <h3
            onClick={() => onSelectBook(book)}
            className="font-bold text-slate-900 text-base leading-snug hover:text-emerald-700 cursor-pointer line-clamp-2"
          >
            {book.title}
          </h3>

          <p className="text-xs text-slate-600 mt-1 font-medium">{book.author}</p>

          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {book.synopsis}
          </p>
        </div>

        {/* Status & Review Summary */}
        <div className="pt-4 mt-3 border-t border-slate-100 space-y-2.5">
          {/* Status block with text and icon */}
          <div className={`p-2 rounded-lg border text-xs flex items-center justify-between ${statusConfig.color}`}>
            <div className="flex items-center gap-2">
              <StatusIcon className="w-4 h-4 shrink-0" />
              <div>
                <span className="font-semibold block leading-tight">{statusConfig.label}</span>
                <span className="text-[10px] opacity-80 block">{statusConfig.sub}</span>
              </div>
            </div>
            <span className="text-[11px] font-mono font-medium">
              {book.availableCopies}/{book.totalCopies} disp.
            </span>
          </div>

          {/* Student Opinions count & rating */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {avgRating ? (
                <span className="font-semibold text-slate-800 font-mono">
                  {avgRating} <span className="font-normal text-slate-500">/ 5</span>
                </span>
              ) : (
                <span className="text-slate-400">Sem nota ainda</span>
              )}
            </div>

            <button
              onClick={() => onSelectBook(book)}
              className="flex items-center gap-1 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{book.opinions.length} {book.opinions.length === 1 ? 'opinião' : 'opiniões'}</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onSelectBook(book)}
              className="w-full py-2 px-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-center truncate"
            >
              Ver Detalhes &amp; Avaliações
            </button>

            {currentUser?.role === 'librarian' ? (
              <button
                onClick={() => onOpenStatusModal && onOpenStatusModal(book)}
                className="w-full py-2 px-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors cursor-pointer text-center truncate"
              >
                Alterar Status
              </button>
            ) : book.status === 'available' ? (
              <button
                onClick={() => onReserveBook && onReserveBook(book)}
                className="w-full py-2 px-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer text-center truncate"
              >
                Reservar Exemplar
              </button>
            ) : (
              <button
                disabled
                className="w-full py-2 px-2 text-xs font-medium text-slate-400 bg-slate-50 rounded-lg text-center truncate cursor-not-allowed"
              >
                {book.status === 'borrowed' ? 'Emprestado' : book.status === 'lost' ? 'Perdido' : 'Reservado'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
