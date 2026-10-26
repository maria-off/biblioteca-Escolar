import React, { useState } from 'react';
import { AuthUser, StudentUser, LibrarianUser } from '../types';
import { User, ShieldCheck, X, BookOpen, GraduationCap, CheckCircle2, KeyRound, UserPlus, LogIn } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: AuthUser) => void;
  students: StudentUser[];
  librarians: LibrarianUser[];
  onRegisterStudent: (student: StudentUser) => void;
  onRegisterLibrarian: (librarian: LibrarianUser) => void;
  onGoToLoginPage?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  students,
  librarians,
  onRegisterStudent,
  onRegisterLibrarian,
  onGoToLoginPage,
}) => {
  const [role, setRole] = useState<'student' | 'librarian'>('student');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Student form state
  const [studentEmailOrMatricula, setStudentEmailOrMatricula] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentMatricula, setStudentMatricula] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState('9º Ano A');
  const [studentPassword, setStudentPassword] = useState('');

  // Librarian form state
  const [librarianEmailOrName, setLibrarianEmailOrName] = useState('');
  const [librarianEmail, setLibrarianEmail] = useState('');
  const [librarianName, setLibrarianName] = useState('');
  const [librarianPassword, setLibrarianPassword] = useState('');
  const [librarianCode, setLibrarianCode] = useState('');

  if (!isOpen) return null;

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isRegistering) {
      if (!studentMatricula.trim() || !studentName.trim() || !studentPassword.trim() || !studentEmail.trim()) {
        setError('Preencha todos os campos obrigatórios (E-mail, Matrícula, Nome e Senha).');
        return;
      }
      // Check if already exists
      const existing = students.find(
        (s) =>
          s.matricula.trim() === studentMatricula.trim() ||
          s.email.toLowerCase().trim() === studentEmail.toLowerCase().trim()
      );
      if (existing) {
        setError('Já existe um aluno cadastrado com este e-mail ou matrícula.');
        return;
      }
      const newStudent: StudentUser = {
        role: 'student',
        matricula: studentMatricula.trim(),
        name: studentName.trim(),
        email: studentEmail.toLowerCase().trim(),
        grade: studentGrade.trim() || 'Ensino Fundamental / Médio',
        password: studentPassword.trim(),
      };
      onRegisterStudent(newStudent);
      setSuccessMsg('Cadastro realizado com sucesso! Você já está conectado.');
      setTimeout(() => {
        onLogin(newStudent);
        onClose();
      }, 700);
    } else {
      // Login
      const term = studentEmailOrMatricula.toLowerCase().trim();
      if (!term || !studentPassword.trim()) {
        setError('Informe o e-mail (ou matrícula) e a senha.');
        return;
      }
      const found = students.find(
        (s) =>
          (s.matricula.toLowerCase().trim() === term || s.email.toLowerCase().trim() === term) &&
          s.password === studentPassword.trim()
      );
      if (!found) {
        setError('E-mail (ou matrícula) ou senha incorretos. Se ainda não possui cadastro, clique no botão "Cadastrar Aluno".');
        return;
      }
      onLogin(found);
      onClose();
    }
  };

  const handleLibrarianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isRegistering) {
      if (!librarianName.trim() || !librarianPassword.trim() || !librarianEmail.trim()) {
        setError('Preencha o Nome, E-mail e a Senha para cadastrar o bibliotecário.');
        return;
      }
      const newLibrarian: LibrarianUser = {
        role: 'librarian',
        name: librarianName.trim(),
        email: librarianEmail.toLowerCase().trim(),
        code: librarianCode.trim() || `BIB-${Math.floor(100 + Math.random() * 900)}`,
        password: librarianPassword.trim(),
      };
      onRegisterLibrarian(newLibrarian);
      setSuccessMsg('Bibliotecário cadastrado com sucesso! Acessando sistema...');
      setTimeout(() => {
        onLogin(newLibrarian);
        onClose();
      }, 700);
    } else {
      // Login
      const term = librarianEmailOrName.toLowerCase().trim();
      if (!term || !librarianPassword.trim()) {
        setError('Informe o E-mail e a Senha do bibliotecário.');
        return;
      }
      const found = librarians.find(
        (l) =>
          (l.name.toLowerCase().trim() === term || l.email.toLowerCase().trim() === term) &&
          l.password === librarianPassword.trim()
      );
      if (!found) {
        setError('Nome ou senha do bibliotecário não encontrados. Se for seu primeiro acesso, clique em "Cadastrar Bibliotecário".');
        return;
      }
      onLogin(found);
      onClose();
    }
  };

  const quickLoginAs = (type: 'student' | 'librarian') => {
    setError('');
    setSuccessMsg('');
    if (type === 'student' && students.length > 0) {
      onLogin(students[0]);
      onClose();
    } else if (type === 'librarian' && librarians.length > 0) {
      onLogin(librarians[0]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Identificação na Biblioteca</h3>
              <p className="text-xs text-slate-300">Acesse o catálogo e seus empréstimos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Segmented Selector */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setError('');
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-lg transition-all ${
                role === 'student'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Sou Aluno</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('librarian');
                setError('');
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-lg transition-all ${
                role === 'librarian'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Sou Bibliotecário</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Student Form */}
          {role === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {isRegistering ? 'Cadastro de Novo Aluno' : 'Login do Aluno'}
                </span>
                <span className="text-xs text-slate-400">
                  {isRegistering ? 'Preencha os dados abaixo' : 'Entre com sua matrícula'}
                </span>
              </div>

              {/* Student Form Inputs */}
              {isRegistering ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nome Completo do Aluno *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Lucas Mendes"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      E-mail do Aluno *
                    </label>
                    <input
                      type="email"
                      placeholder="Ex: lucas.mendes@escola.edu.br"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Matrícula *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 202401"
                        value={studentMatricula}
                        onChange={(e) => setStudentMatricula(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Turma / Série
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 9º Ano A"
                        value={studentGrade}
                        onChange={(e) => setStudentGrade(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    E-mail do Aluno (ou Matrícula) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: aluno@escola.edu.br ou 202401"
                    value={studentEmailOrMatricula}
                    onChange={(e) => setStudentEmailOrMatricula(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Senha de Acesso *
                </label>
                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isRegistering ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Cadastrar Aluno</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Entrar como Aluno</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center border-t border-slate-100">
                {isRegistering ? (
                  <p className="text-xs text-slate-600">
                    Já tem cadastro?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(false);
                        setError('');
                      }}
                      className="text-emerald-700 font-semibold hover:underline"
                    >
                      Aperte aqui para Entrar
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-600">
                    Não tem conta?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(true);
                        setError('');
                      }}
                      className="text-emerald-700 font-semibold hover:underline"
                    >
                      Aperte aqui para Cadastrar
                    </button>
                  </p>
                )}
              </div>
            </form>
          )}

          {/* Librarian Form */}
          {role === 'librarian' && (
            <form onSubmit={handleLibrarianSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {isRegistering ? 'Cadastro de Bibliotecário' : 'Acesso da Equipe da Biblioteca'}
                </span>
                <span className="text-xs text-slate-400">
                  {isRegistering ? 'E-mail, Nome e Senha' : 'Entre com e-mail e senha'}
                </span>
              </div>

              {isRegistering ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nome do Bibliotecário(a) *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Profª Helena Vasconcelos"
                      value={librarianName}
                      onChange={(e) => setLibrarianName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      E-mail do Bibliotecário *
                    </label>
                    <input
                      type="email"
                      placeholder="Ex: helena.biblioteca@escola.edu.br"
                      value={librarianEmail}
                      onChange={(e) => setLibrarianEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Código / Identificação Funcional (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: BIB-105"
                      value={librarianCode}
                      onChange={(e) => setLibrarianCode(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    E-mail do Bibliotecário(a) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: bibliotecario@escola.edu.br"
                    value={librarianEmailOrName}
                    onChange={(e) => setLibrarianEmailOrName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Senha de Acesso *
                </label>
                <input
                  type="password"
                  placeholder="Digite a senha"
                  value={librarianPassword}
                  onChange={(e) => setLibrarianPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isRegistering ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Cadastrar Bibliotecário</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Entrar no Painel do Bibliotecário</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center border-t border-slate-100">
                {isRegistering ? (
                  <p className="text-xs text-slate-600">
                    Já tem cadastro?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(false);
                        setError('');
                      }}
                      className="text-amber-700 font-semibold hover:underline"
                    >
                      Aperte aqui para Entrar
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-600">
                    Não tem cadastro?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(true);
                        setError('');
                      }}
                      className="text-amber-700 font-semibold hover:underline"
                    >
                      Aperte na botão Cadastrar
                    </button>
                  </p>
                )}
              </div>
            </form>
          )}

          {/* Quick Demo Access Bar */}
          <div className="mt-5 pt-4 border-t border-slate-200">
            <p className="text-[11px] font-medium text-slate-500 mb-2 text-center">
              Acesso Rápido para Teste Escolar:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickLoginAs('student')}
                className="py-1.5 px-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-center transition-colors truncate"
              >
                Entrar como Aluno Demo
              </button>
              <button
                type="button"
                onClick={() => quickLoginAs('librarian')}
                className="py-1.5 px-2 text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md font-medium text-center transition-colors truncate"
              >
                Entrar como Bibliotecária
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
