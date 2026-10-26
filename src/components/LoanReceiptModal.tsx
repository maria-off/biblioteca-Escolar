import React, { useState } from 'react';
import { Loan, Book } from '../types';
import { X, Printer, Check, Copy, BookOpen, Calendar, User, MapPin, ShieldCheck } from 'lucide-react';

interface LoanReceiptModalProps {
  loan: Loan | null;
  book?: Book;
  isOpen: boolean;
  onClose: () => void;
}

export const LoanReceiptModal: React.FC<LoanReceiptModalProps> = ({
  loan,
  book,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !loan) return null;

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const handlePrint = () => {
    window.print();
  };

  const receiptText = `
COMPROVANTE DE EMPRÉSTIMO BIBLIOTECÁRIO
----------------------------------------
Biblioteca Escolar Saber & Aventura
Colégio Saber Integrado

DADOS DO ALUNO:
Nome: ${loan.studentName}
Matrícula: ${loan.studentId}
Turma/Série: ${loan.studentGrade}

QUAL LIVRO ELE PEGOU:
Título: ${loan.bookTitle}
Localização Física: ${loan.shelfLocation || book?.shelfLocation || 'Acervo Geral'}

DATAS DO EMPRÉSTIMO:
Data que pegou: ${formatDateDisplay(loan.checkoutDate)}
Data prevista de devolução: ${formatDateDisplay(loan.dueDate)}
Status atual: ${loan.status === 'returned' ? `Devolvido em ${formatDateDisplay(loan.returnDate || '')}` : loan.status === 'overdue' ? 'Atrasado' : 'Em andamento'}

Bibliotecário Responsável: ${loan.librarianName || 'Profª Helena Vasconcelos'}
----------------------------------------
*Favor zelar pela integridade física do exemplar e respeitar o prazo de entrega.
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold">Comprovante de Empréstimo do Balcão</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Voucher Paper */}
        <div className="p-6 overflow-y-auto space-y-5 bg-slate-50/50 print:p-0 print:bg-white text-slate-800">
          <div className="bg-white p-6 rounded-xl border border-slate-300 shadow-xs space-y-4">
            {/* Header School Seal */}
            <div className="text-center border-b border-slate-200 pb-3">
              <div className="inline-flex p-2 bg-emerald-50 rounded-xl mb-1 text-emerald-800">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="font-bold text-base text-slate-900">
                Biblioteca Escolar Saber &amp; Aventura
              </h2>
              <p className="text-xs text-slate-500">
                Ficha Oficial de Circulação de Exemplar Físico
              </p>
              <span className="text-[10px] font-mono text-slate-400">
                Registro Nº {loan.id.toUpperCase()}
              </span>
            </div>

            {/* Section: Aluno */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                Identificação do Aluno:
              </span>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nome do Aluno:</span>
                  <span className="font-bold text-slate-900">{loan.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Matrícula Escolar:</span>
                  <span className="font-mono font-semibold text-emerald-800">
                    {loan.studentId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Série / Turma:</span>
                  <span className="font-medium text-slate-700">{loan.studentGrade}</span>
                </div>
              </div>
            </div>

            {/* Section: Qual Livro Ele Pegou */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                Qual Livro Ele Pegou:
              </span>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start gap-3">
                {loan.bookCover && (
                  <img
                    src={loan.bookCover}
                    alt={loan.bookTitle}
                    referrerPolicy="no-referrer"
                    className="w-12 aspect-3/4 object-cover rounded border border-slate-300 shrink-0"
                  />
                )}
                <div className="text-xs space-y-0.5">
                  <h4 className="font-bold text-slate-900">{loan.bookTitle}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-600">
                    <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>
                      Localização na Estante: {loan.shelfLocation || book?.shelfLocation || 'Estante Geral'}
                    </span>
                  </div>
                  {book?.isbn && (
                    <span className="text-[10px] font-mono text-slate-400 block">
                      ISBN: {book.isbn}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Datas (Data que pegou & Data de devolução) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50/80 rounded-lg border border-emerald-200 text-xs">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                  Data que Pegou:
                </span>
                <span className="text-sm font-bold font-mono text-emerald-950 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  {formatDateDisplay(loan.checkoutDate)}
                </span>
                <span className="text-[10px] text-emerald-700 mt-1 block">Retirado no balcão</span>
              </div>

              <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200 text-xs">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">
                  Data de Devolução:
                </span>
                <span className="text-sm font-bold font-mono text-amber-950 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  {formatDateDisplay(loan.dueDate)}
                </span>
                <span className="text-[10px] text-amber-800 mt-1 block">
                  {loan.status === 'returned'
                    ? `Devolvido em ${formatDateDisplay(loan.returnDate || '')}`
                    : 'Entregar na biblioteca'}
                </span>
              </div>
            </div>

            {/* Signatures Footer */}
            <div className="pt-4 border-t border-dashed border-slate-200 text-[11px] text-slate-500 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center pt-3">
                <div className="border-t border-slate-300 pt-1">
                  <span className="block font-medium text-slate-700 text-[10px]">
                    Assinatura do Aluno(a)
                  </span>
                </div>
                <div className="border-t border-slate-300 pt-1">
                  <span className="block font-medium text-slate-700 text-[10px]">
                    Bibliotecário Responsável
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {loan.librarianName || 'Profª Helena Vasconcelos'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Dados</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Ficha</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
