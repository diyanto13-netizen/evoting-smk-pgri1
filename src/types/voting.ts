export type CandidateCategory = 'OSIS' | 'MPK';

export type TPSStatus = 'OPEN' | 'PAUSED' | 'CLOSED';

export interface Period {
  id: string;
  academicYear: string; // e.g. "2026/2027"
  title: string;
  isActive: boolean;
  status: TPSStatus;
  isResultPublished: boolean; // false = Freeze / Hide result
  startTime: string;
  endTime: string;
  description: string;
  createdAt: string;
}

export interface Candidate {
  id: string;
  periodId: string;
  category: CandidateCategory;
  ballotNumber: number; // 1, 2, 3
  chairmanName: string;
  viceChairmanName: string;
  chairmanClass: string;
  viceChairmanClass: string;
  chairmanNisn?: string;
  viceChairmanNisn?: string;
  slogan: string;
  vision: string;
  mission: string[];
  programs: string[];
  photoUrl: string;
  badgeColor?: string;
}

export interface Voter {
  id: string;
  periodId: string;
  nisn: string;
  studentName: string;
  classGrade: string; // e.g. "XII RPL 1"
  major: string; // e.g. "Rekayasa Perangkat Lunak"
  pin: string; // 6 digits
  hasVoted: boolean;
  votedAt?: string;
}

export interface Vote {
  id: string;
  periodId: string;
  candidateId: string;
  category: CandidateCategory;
  timestamp: string;
  // NOTE: According to LUBER principles, NO voterId or NISN is stored here!
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  userType: 'SYSTEM' | 'ADMIN' | 'OPERATOR' | 'STUDENT';
}

export type AdminRole = 'SUPER_ADMIN' | 'OPERATOR_TPS';

export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  role: AdminRole;
  title: string;
  password?: string;
  updatedAt?: string;
}

export interface StudentSession {
  voter: Voter;
  loginTime: string;
  token: string;
}

export type TimelineStatus = 'DONE' | 'ACTIVE' | 'UPCOMING';

export interface TimelineStep {
  id: string;
  periodId: string;
  stepNumber: number;
  title: string;
  dateRange: string;
  description: string;
  status: TimelineStatus;
  location?: string;
}
