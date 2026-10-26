import React, { useState, useEffect } from 'react';
import { Book, BookStatus } from '../types';
import { ShieldCheck, X, CheckCircle, Clock, BookOpen, AlertTriangle, MapPin } from 'lucide-react';

interface LibrarianStatusModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveStatus: (
    bookId: string,
    status: BookStatus,
    shelfLocation: string,
    totalCopies: number,
    availableCopies: number
  ) => void;
}

export const LibrarianStatusModal: React.FC<LibrarianStatusModalProps> = ({
  book,
  isOpen,
  onClose,
  onSaveStatus,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<BookStatus>('available');
  const [shelfLocation, setShelfLocation] = useState('');
  const [totalCopies, setTotalCopies] = useState(1);
  const [availableCopies, setAvailableCopies] = useState(1);

  useEffect(() => {
    if (book) {
      setSelectedStatus(book.status);
      setShelfLocation(book.shelfLocation);
      setTotalCopies(book.totalCopies);
      setAvailableCopies(book.availableCopies);
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveStatus(
      book.id,
      selectedStatus,
      shelfLocation.trim() || book.shelfLocation,
      Number(totalCopies),
      Number(availableCopies)
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-700/60 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Gestão do Livro Físico</h3>
              <p className="text-xs text-amber-100">Painel do Bibliotecário</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block">Livro em edição:</span>
            <h4 className="font-bold text-slate-900 text-sm">{book.title}</h4>
            <span className="text-xs text-slate-600">{book.author}</span>
          </div>

          {/* Status Selection: Está aqui, Reservado, Emprestado, Perdido */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Status Atual do Exemplar *:
            </label>
            <div className="space-y-2">
              {/* Disponível / Está aqui */}
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatus === 'available'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="bookStatus"
                    value="available"
                    checked={selectedStatus === 'available'}
                    onChange={() => setSelectedStatus('available')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs block font-bold text-emerald-800">
                      Está aqui na estante
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Disponível para qualquer aluno retirar agora
                    </span>
                  </div>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </label>

              {/* Reservado */}
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatus === 'reserved'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="bookStatus"
                    value="reserved"
                    checked={selectedStatus === 'reserved'}
                    onChange={() => setSelectedStatus('reserved')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs block font-bold text-amber-800">Reservado</span>
                    <span className="text-[11px] text-slate-500 block">
                      Guardado no balcão aguardando o aluno buscar
                    </span>
                  </div>
                </div>
                <Clock className="w-4 h-4 text-amber-600" />
              </label>

              {/* Emprestado */}
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatus === 'borrowed'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-950 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="bookStatus"
                    value="borrowed"
                    checked={selectedStatus === 'borrowed'}
                    onChange={() => setSelectedStatus('borrowed')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs block font-bold text-blue-800">Emprestado</span>
                    <span className="text-[11px] text-slate-500 block">
                      Em circulação com um aluno da escola
                    </span>
                  </div>
                </div>
                <BookOpen className="w-4 h-4 text-blue-600" />
              </label>

              {/* Perdido / Extraviado */}
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatus === 'lost'
                    ? 'border-rose-500 bg-rose-50/70 text-rose-950 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="bookStatus"
                    value="lost"
                    checked={selectedStatus === 'lost'}
                    onChange={() => setSelectedStatus('lost')}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="text-xs block font-bold text-rose-800">
                      Perdido / Extraviado
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Exemplar não localizado ou perdido pelo leitor
                    </span>
                  </div>
                </div>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </label>
            </div>
          </div>

          {/* Shelf location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Localização Física na Estante:</span>
            </label>
            <input
              type="text"
              value={shelfLocation}
              onChange={(e) => setShelfLocation(e.target.value)}
              placeholder="Ex: Estante 3 - Prateleira B"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          {/* Copies count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total de Cópias Físicas
              </label>
              <input
                type="number"
                min="0"
                value={totalCopies}
                onChange={(e) => setTotalCopies(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cópias Disponíveis Agora
              </label>
              <input
                type="number"
                min="0"
                max={totalCopies}
                value={availableCopies}
                onChange={(e) => setAvailableCopies(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Action buttons */}
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
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
