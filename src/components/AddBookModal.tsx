import React, { useState } from 'react';
import { Book, BookGenre, BookStatus } from '../types';
import { BookPlus, X, MapPin } from 'lucide-react';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (newBook: Omit<Book, 'id' | 'opinions'>) => void;
}

const GENRES: BookGenre[] = [
  'Literatura Juvenil',
  'Ficção Científica',
  'Fantasia & Magia',
  'Clássicos Brasileiros',
  'Mistério & Suspense',
  'História & Ciências',
  'HQs & Mangás',
  'Poesia & Teatro',
];

export const AddBookModal: React.FC<AddBookModalProps> = ({
  isOpen,
  onClose,
  onAddBook,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState<BookGenre>('Literatura Juvenil');
  const [synopsis, setSynopsis] = useState('');
  const [pages, setPages] = useState<number>(240);
  const [year, setYear] = useState<number>(2024);
  const [isbn, setIsbn] = useState('');
  const [shelfLocation, setShelfLocation] = useState('Estante 2 - Prateleira A');
  const [status, setStatus] = useState<BookStatus>('available');
  const [totalCopies, setTotalCopies] = useState<number>(3);
  const [availableCopies, setAvailableCopies] = useState<number>(3);
  const [coverUrl, setCoverUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !shelfLocation.trim()) return;

    onAddBook({
      title: title.trim(),
      author: author.trim(),
      genre,
      synopsis: synopsis.trim() || 'Exemplar físico pertencente ao acervo escolar.',
      pages: Number(pages) || 200,
      year: Number(year) || 2024,
      isbn: isbn.trim() || `978-65-${Math.floor(100000 + Math.random() * 900000)}-0`,
      shelfLocation: shelfLocation.trim(),
      status,
      totalCopies: Number(totalCopies) || 1,
      availableCopies: Number(availableCopies) || 1,
      coverUrl: coverUrl.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-emerald-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-900/60 rounded-lg">
              <BookPlus className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Cadastrar Novo Livro Físico</h3>
              <p className="text-xs text-emerald-100">Adicionar exemplar ao catálogo da escola</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Título do Livro *
            </label>
            <input
              type="text"
              placeholder="Ex: A Menina que Roubava Livros"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                placeholder="Ex: Markus Zusak"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gênero Literário *
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as BookGenre)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Shelf location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>Localização Física (Estante / Prateleira) *</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Estante 4 - Prateleira C (Literatura Juvenil)"
              value={shelfLocation}
              onChange={(e) => setShelfLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BookStatus)}
                className="w-full px-2 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="available">Está aqui</option>
                <option value="reserved">Reservado</option>
                <option value="borrowed">Emprestado</option>
                <option value="lost">Perdido</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Cópias
              </label>
              <input
                type="number"
                min="1"
                value={totalCopies}
                onChange={(e) => setTotalCopies(Number(e.target.value))}
                className="w-full px-2 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Disponíveis
              </label>
              <input
                type="number"
                min="0"
                max={totalCopies}
                value={availableCopies}
                onChange={(e) => setAvailableCopies(Number(e.target.value))}
                className="w-full px-2 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nº de Páginas
              </label>
              <input
                type="number"
                value={pages}
                onChange={(e) => setPages(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ano de Publicação
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ISBN / Código de Catalogação
            </label>
            <input
              type="text"
              placeholder="Ex: 978-85-359-0000-0"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sinopse do Livro
            </label>
            <textarea
              rows={3}
              placeholder="Breve resumo da obra para os estudantes..."
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Quick preset cover selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Imagem da Capa (URL ou Ilustração Padrão)
            </label>
            <input
              type="text"
              placeholder="Cole o link da capa ou deixe em branco para capa temática da escola"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Cadastrar no Acervo da Escola
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
