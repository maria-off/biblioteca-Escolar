export type BookGenre =
  | 'Todas as Categorias'
  | 'Literatura Juvenil'
  | 'Ficção Científica'
  | 'Fantasia & Magia'
  | 'Clássicos Brasileiros'
  | 'Mistério & Suspense'
  | 'História & Ciências'
  | 'HQs & Mangás'
  | 'Poesia & Teatro';

export type BookStatus = 'available' | 'reserved' | 'borrowed' | 'lost';

export interface BookOpinion {
  id: string;
  studentName: string;
  studentGrade: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: BookGenre;
  coverUrl: string;
  synopsis: string;
  pages: number;
  year: number;
  isbn: string;
  shelfLocation: string; // e.g. "Estante 3 - Prateleira B (Ficção)"
  status: BookStatus;
  totalCopies: number;
  availableCopies: number;
  opinions: BookOpinion[];
  reservedBy?: {
    studentId: string;
    studentName: string;
    date: string;
  };
}

export interface Loan {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  studentId: string; // Matrícula
  studentName: string;
  studentGrade: string;
  checkoutDate: string; // "YYYY-MM-DD" Dia que pegou
  dueDate: string;      // "YYYY-MM-DD" Dia que vai entregar
  returnDate?: string;  // "YYYY-MM-DD" quando devolvido
  status: 'active' | 'returned' | 'overdue';
  notes?: string;
  shelfLocation?: string;
  librarianName?: string;
  renewalsCount?: number;
}

export interface UpcomingArrival {
  id: string;
  title: string;
  author: string;
  genre: BookGenre;
  arrivalForecast: string; // e.g. "28 de Outubro de 2026" or "10 de Novembro"
  description: string;
  publisher: string;
  votes: number;
  votedUserIds: string[];
}

export interface StudentSuggestion {
  id: string;
  title: string;
  author: string;
  studentName: string;
  studentGrade: string;
  reason: string;
  date: string;
  status: 'Análise' | 'Aprovado para Compra' | 'Em Aquisição';
}

export interface StudentUser {
  role: 'student';
  matricula: string;
  name: string;
  email: string;
  grade: string;
  password?: string;
}

export interface LibrarianUser {
  role: 'librarian';
  name: string;
  email: string;
  code?: string;
  password?: string;
}

export type AuthUser = StudentUser | LibrarianUser;
