import React, { useState } from 'react';
import { Book, AuthUser, BookOpinion, BookStatus } from '../types';
import { X, Star, MapPin, CheckCircle, Clock, AlertTriangle, BookOpen, MessageSquare, Send, ShieldCheck, UserCheck } from 'lucide-react';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  currentUser: AuthUser | null;
  onAddOpinion: (bookId: string, opinion: Omit<BookOpinion, 'id'>) => void;
  onUpdateStatus: (bookId: string, newStatus: BookStatus, shelfLocation?: string) => void;
  onReserveBook: (book: Book) => void;
  onOpenAuth: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  currentUser,
  onAddOpinion,
  onUpdateStatus,
  onReserveBook,
  onOpenAuth,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [guestGrade, setGuestGrade] = useState<string>('9º Ano A');
  const [submitFeedback, setSubmitFeedback] = useState<string>('');

  if (!book) return null;

  const avgRating =
    book.opinions.length > 0
      ? (
          book.opinions.reduce((acc, curr) => acc + curr.rating, 0) /
          book.opinions.length
        ).toFixed(1)
      : null;

  const handleSubmitOpinion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const studentName = currentUser?.name || guestName.trim() || 'Estudante Anônimo';
    const studentGrade =
      currentUser && currentUser.role === 'student'
        ? currentUser.grade
        : guestGrade.trim() || 'Aluno';

    const now = new Date();
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()}`;

    onAddOpinion(book.id, {
      studentName,
      studentGrade,
      rating,
      comment: comment.trim(),
      date: dateFormatted,
    });

    setComment('');
    setSubmitFeedback('Sua opinião foi registrada com sucesso! Obrigado por compartilhar.');
    setTimeout(() => setSubmitFeedback(''), 4000);
  };

  const getStatusBadge = (status: BookStatus) => {
    switch (status) {
      case 'available':
        return {
          label: 'Está aqui na estante (Disponível)',
          desc: 'Exemplar físico pronto para retirada no balcão da biblioteca.',
          style: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: CheckCircle,
        };
      case 'reserved':
        return {
          label: 'Reservado',
          desc: book.reservedBy
            ? `Reservado para ${book.reservedBy.studentName} (${book.reservedBy.studentId}) em ${book.reservedBy.date}.`
            : 'Aguardando retirada no balcão.',
          style: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: Clock,
        };
      case 'borrowed':
        return {
          label: 'Emprestado (Em circulação)',
          desc: 'Este exemplar está atualmente emprestado para um estudante.',
          style: 'bg-blue-50 text-blue-800 border-blue-200',
          icon: BookOpen,
        };
      case 'lost':
        return {
          label: 'Perdido / Extraviado',
          desc: 'O exemplar foi classificado como perdido pela equipe da biblioteca.',
          style: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: AlertTriangle,
        };
    }
  };

  const statusBadge = getStatusBadge(book.status);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              {book.genre}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-300">Acervo Físico Escolar</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fechar detalhes"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Main Book Overview Split */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            {/* Book Cover */}
            <div className="sm:col-span-4 aspect-3/4 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative shrink-0">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={`Capa de ${book.title}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-800 text-white">
                  <BookOpen className="w-10 h-10 text-slate-400 mb-2" />
                  <span className="font-bold text-sm leading-tight">{book.title}</span>
                  <span className="text-xs text-slate-300 mt-1">{book.author}</span>
                </div>
              )}
            </div>

            {/* Info Column */}
            <div className="sm:col-span-8 space-y-3">
              <h2 className="text-2xl font-bold text-slate-900 font-editorial leading-tight">
                {book.title}
              </h2>
              <p className="text-sm font-medium text-emerald-800">Por {book.author}</p>

              {/* Physical Location Alert Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 block">
                    Localização Física na Biblioteca:
                  </span>
                  <span className="text-slate-600 block mt-0.5 font-medium">
                    {book.shelfLocation}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    *Para ler este livro, retire o exemplar físico diretamente na escola com a bibliotecária.
                  </span>
                </div>
              </div>

              {/* Status & Copies */}
              <div className={`p-3 rounded-xl border ${statusBadge.style}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-4 h-4 shrink-0" />
                    <span className="font-bold text-xs">{statusBadge.label}</span>
                  </div>
                  <span className="text-xs font-mono font-semibold">
                    {book.availableCopies} de {book.totalCopies} cópias disponíveis
                  </span>
                </div>
                <p className="text-xs mt-1 opacity-90">{statusBadge.desc}</p>
              </div>

              {/* Librarian quick status selector */}
              {currentUser?.role === 'librarian' && (
                <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-xl">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Painel da Bibliotecária: Atualizar Status do Livro</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => onUpdateStatus(book.id, 'available')}
                      className={`px-2 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        book.status === 'available'
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      Está aqui
                    </button>
                    <button
                      onClick={() => onUpdateStatus(book.id, 'reserved')}
                      className={`px-2 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        book.status === 'reserved'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      Reservado
                    </button>
                    <button
                      onClick={() => onUpdateStatus(book.id, 'borrowed')}
                      className={`px-2 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        book.status === 'borrowed'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      Emprestado
                    </button>
                    <button
                      onClick={() => onUpdateStatus(book.id, 'lost')}
                      className={`px-2 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        book.status === 'lost'
                          ? 'bg-rose-700 text-white border-rose-700'
                          : 'bg-white text-rose-800 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      Perdido
                    </button>
                  </div>
                </div>
              )}

              {/* Book Metadata details */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-xs text-slate-600">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="block text-[10px] text-slate-400">Páginas</span>
                  <span className="font-semibold text-slate-800">{book.pages}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="block text-[10px] text-slate-400">Ano Publicação</span>
                  <span className="font-semibold text-slate-800">{book.year}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="block text-[10px] text-slate-400">ISBN</span>
                  <span className="font-mono font-medium text-slate-800 truncate block">{book.isbn}</span>
                </div>
              </div>

              {/* Student Reservation Button */}
              {book.status === 'available' && currentUser?.role !== 'librarian' && (
                <div className="pt-2">
                  <button
                    onClick={() => onReserveBook(book)}
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Reservar Este Livro para Pegar Hoje na Biblioteca</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Synopsis */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Sinopse do Livro
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              {book.synopsis}
            </p>
          </div>

          {/* Reviews & Student Opinions Section */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Opiniões e Avaliações dos Alunos
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {avgRating ? (
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    {avgRating} <span className="text-xs font-normal text-slate-500">/ 5 ({book.opinions.length} avaliações)</span>
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">Seja o primeiro a avaliar</span>
                )}
              </div>
            </div>

            {/* List of existing opinions */}
            <div className="space-y-3 mb-6">
              {book.opinions.length > 0 ? (
                book.opinions.map((op) => (
                  <div
                    key={op.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{op.studentName}</span>
                        <span className="text-[11px] text-slate-500 font-medium">({op.studentGrade})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < op.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 ml-1">{op.date}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      &ldquo;{op.comment}&rdquo;
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic p-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Nenhum aluno publicou opinião sobre este livro ainda. Conte para a escola o que você achou!
                </p>
              )}
            </div>

            {/* Form to leave student opinion */}
            <form onSubmit={handleSubmitOpinion} className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Dar sua opinião sobre este livro
                </span>
                {currentUser ? (
                  <span className="text-xs text-emerald-800 font-medium flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{currentUser.name}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="text-xs text-emerald-700 hover:underline font-semibold"
                  >
                    Fazer login com matrícula
                  </button>
                )}
              </div>

              {!currentUser && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Seu Nome</label>
                    <input
                      type="text"
                      placeholder="Ex: Beatriz Lima"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Sua Turma / Série</label>
                    <input
                      type="text"
                      placeholder="Ex: 8º Ano B"
                      value={guestGrade}
                      onChange={(e) => setGuestGrade(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Star selector */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Sua Nota (Quantas estrelas merece?):
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      type="button"
                      key={starVal}
                      onClick={() => setRating(starVal)}
                      className="p-1 rounded hover:bg-white transition-colors cursor-pointer"
                      title={`${starVal} estrelas`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          starVal <= rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2 font-mono">
                    {rating} de 5 estrelas
                  </span>
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  O que você achou da história e dos personagens?
                </label>
                <textarea
                  rows={3}
                  placeholder="Escreva sua opinião sincera para ajudar os outros alunos da escola a escolherem este livro..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  required
                />
              </div>

              {submitFeedback && (
                <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-medium">
                  {submitFeedback}
                </div>
              )}

              <button
                type="submit"
                className="py-2 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ml-auto"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publicar Minha Opinião</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
