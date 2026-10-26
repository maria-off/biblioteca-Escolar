import React, { useState } from 'react';
import { AuthUser, StudentUser, LibrarianUser } from '../types';
import {
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Mail,
  Lock,
  User,
  KeyRound,
  UserPlus,
  LogIn,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
  students: StudentUser[];
  librarians: LibrarianUser[];
  onRegisterStudent: (student: StudentUser) => void;
  onRegisterLibrarian: (librarian: LibrarianUser) => void;
  onBackToCatalog: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  students,
  librarians,
  onRegisterStudent,
  onRegisterLibrarian,
  onBackToCatalog,
}) => {
  const [role, setRole] = useState<'student' | 'librarian'>('student');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [matricula, setMatricula] = useState('');
  const [grade, setGrade] = useState('9º Ano A');
  const [librarianCode, setLibrarianCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (role === 'student') {
      if (isRegistering) {
        if (!email.trim() || !password.trim() || !name.trim() || !matricula.trim()) {
          setError('Preencha todos os campos obrigatórios (E-mail, Senha, Nome e Matrícula).');
          return;
        }

        // Check if email or matricula exists
        const exists = students.find(
          (s) =>
            s.email.toLowerCase().trim() === email.toLowerCase().trim() ||
            s.matricula.trim() === matricula.trim()
        );
        if (exists) {
          setError('Já existe um aluno cadastrado com este e-mail ou matrícula.');
          return;
        }

        const newStudent: StudentUser = {
          role: 'student',
          name: name.trim(),
          email: email.toLowerCase().trim(),
          matricula: matricula.trim(),
          grade: grade.trim() || 'Ensino Fundamental/Médio',
          password: password.trim(),
        };

        onRegisterStudent(newStudent);
        setSuccessMsg('Cadastro realizado com sucesso! Conectando à biblioteca...');
        setTimeout(() => {
          onLogin(newStudent);
          onBackToCatalog();
        }, 800);
      } else {
        // Login as Student
        if (!email.trim() || !password.trim()) {
          setError('Informe seu e-mail (ou matrícula) e sua senha.');
          return;
        }

        const term = email.toLowerCase().trim();
        const found = students.find(
          (s) =>
            (s.email.toLowerCase().trim() === term || s.matricula.toLowerCase().trim() === term) &&
            s.password === password.trim()
        );

        if (!found) {
          setError(
            'E-mail (ou matrícula) ou senha incorretos. Caso ainda não tenha conta, aperte no botão "Cadastrar Aluno".'
          );
          return;
        }

        setSuccessMsg(`Bem-vindo(a), ${found.name}! Conectando...`);
        setTimeout(() => {
          onLogin(found);
          onBackToCatalog();
        }, 600);
      }
    } else {
      // Role is Librarian
      if (isRegistering) {
        if (!email.trim() || !password.trim() || !name.trim()) {
          setError('Preencha o Nome, E-mail e Senha para cadastrar o bibliotecário.');
          return;
        }

        const exists = librarians.find(
          (l) => l.email.toLowerCase().trim() === email.toLowerCase().trim()
        );
        if (exists) {
          setError('Já existe um membro da biblioteca com este e-mail cadastrado.');
          return;
        }

        const newLibrarian: LibrarianUser = {
          role: 'librarian',
          name: name.trim(),
          email: email.toLowerCase().trim(),
          code: librarianCode.trim() || `BIB-${Math.floor(100 + Math.random() * 900)}`,
          password: password.trim(),
        };

        onRegisterLibrarian(newLibrarian);
        setSuccessMsg('Bibliotecário cadastrado com sucesso! Acessando painel...');
        setTimeout(() => {
          onLogin(newLibrarian);
          onBackToCatalog();
        }, 800);
      } else {
        // Login as Librarian
        if (!email.trim() || !password.trim()) {
          setError('Informe seu e-mail e sua senha de bibliotecário.');
          return;
        }

        const term = email.toLowerCase().trim();
        const found = librarians.find(
          (l) =>
            (l.email.toLowerCase().trim() === term || l.name.toLowerCase().trim() === term) &&
            l.password === password.trim()
        );

        if (!found) {
          setError(
            'E-mail ou senha do bibliotecário incorretos. Se ainda não possui cadastro, aperte no botão "Cadastrar Bibliotecário".'
          );
          return;
        }

        setSuccessMsg(`Acesso autorizado! Bem-vindo(a), ${found.name}.`);
        setTimeout(() => {
          onLogin(found);
          onBackToCatalog();
        }, 600);
      }
    }
  };

  const quickDemoLogin = (type: 'student' | 'librarian') => {
    setError('');
    setSuccessMsg('');
    if (type === 'student' && students.length > 0) {
      onLogin(students[0]);
      onBackToCatalog();
    } else if (type === 'librarian' && librarians.length > 0) {
      onLogin(librarians[0]);
      onBackToCatalog();
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="w-full max-w-lg space-y-6">
        {/* Back navigation button */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-200/60"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Acervo de Livros</span>
          </button>
          <span className="text-xs text-slate-400 font-mono">Colégio Saber Integrado</span>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
          {/* Header Banner */}
          <div className="p-8 bg-slate-900 text-white text-center relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
            <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-lg mb-3 border border-emerald-500/30">
                <BookOpen className="w-7 h-7" />
              </div>

              <h1 className="text-2xl font-bold font-editorial tracking-tight text-white">
                Biblioteca Escolar Saber &amp; Aventura
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-xs">
                {isRegistering
                  ? 'Crie sua conta escolar para acompanhar livros e empréstimos'
                  : 'Entre com seu e-mail e senha para acessar o acervo e seus prazos'}
              </p>
            </div>
          </div>

          {/* Profile Segmented Selector: Aluno vs Bibliotecário */}
          <div className="p-5 bg-slate-50 border-b border-slate-200">
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-2">
              Selecione seu perfil de acesso:
            </span>
            <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setRole('student');
                  setError('');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  role === 'student'
                    ? 'bg-white text-emerald-950 shadow-sm'
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
                className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  role === 'librarian'
                    ? 'bg-white text-amber-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Sou Bibliotecário</span>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Registration Extra Fields */}
              {isRegistering && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder={role === 'student' ? 'Ex: Lucas Mendes' : 'Ex: Profª Helena Vasconcelos'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  {role === 'student' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Matrícula Escolar *
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 202401"
                          value={matricula}
                          onChange={(e) => setMatricula(e.target.value)}
                          className="w-full px-3 py-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Turma / Série
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 9º Ano A"
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className="w-full px-3 py-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Código Funcional (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: BIB-105"
                        value={librarianCode}
                        onChange={(e) => setLibrarianCode(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  )}
                </>
              )}

              {/* EMAIL FIELD (PRIMARY FOCUS) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {role === 'student' && !isRegistering
                    ? 'E-mail Escolar (ou Número de Matrícula) *'
                    : 'E-mail *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={
                      role === 'student'
                        ? 'Ex: aluno@escola.edu.br ou 202401'
                        : 'Ex: bibliotecario@escola.edu.br'
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD FIELD */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Senha de Acesso *
                  </label>
                  {!isRegistering && (
                    <span className="text-[11px] text-slate-400">Padrão demo: 123</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-3 px-4 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  role === 'student'
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                {isRegistering ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>
                      {role === 'student' ? 'Cadastrar Novo Aluno' : 'Cadastrar Bibliotecário'}
                    </span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>
                      {role === 'student' ? 'Entrar como Aluno' : 'Entrar no Painel do Bibliotecário'}
                    </span>
                  </>
                )}
              </button>

              {/* Switch between Login and Register */}
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
                      className="font-bold text-emerald-800 hover:underline cursor-pointer"
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
                      className="font-bold text-emerald-800 hover:underline cursor-pointer"
                    >
                      Aperte no botão Cadastrar
                    </button>
                  </p>
                )}
              </div>
            </form>

            {/* Quick Demo Access Credentials */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center mb-2.5">
                Acesso Rápido para Teste Escolar (1 Clique):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => quickDemoLogin('student')}
                  className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-left transition-colors cursor-pointer"
                >
                  <span className="text-[11px] font-bold text-emerald-900 block flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Entrar como Aluno</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono block truncate mt-0.5">
                    lucas.mendes@escola.edu.br
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => quickDemoLogin('librarian')}
                  className="p-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-left transition-colors cursor-pointer"
                >
                  <span className="text-[11px] font-bold text-amber-950 block flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                    <span>Entrar como Bibliotecária</span>
                  </span>
                  <span className="text-[10px] text-amber-800 font-mono block truncate mt-0.5">
                    helena.biblioteca@escola.edu.br
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
