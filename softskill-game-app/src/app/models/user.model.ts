export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'RECRUITER' | 'CANDIDATE';
  company?: Company;
}

export interface Company {
  id?: number;
  companyName: string;
  companyNumber: string;
}

