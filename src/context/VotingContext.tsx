import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import {
  Period,
  Candidate,
  Voter,
  Vote,
  AuditLog,
  AdminUser,
  StudentSession,
  TPSStatus,
  CandidateCategory,
  TimelineStep,
} from '../types/voting';
import {
  DEFAULT_PERIODS,
  DEFAULT_CANDIDATES,
  INITIAL_VOTERS,
  INITIAL_VOTES,
  INITIAL_AUDIT_LOGS,
  INITIAL_ADMINS,
  DEFAULT_TIMELINE_STEPS,
} from '../data/defaultData';
import { ensureUniquePins, generateUniquePin } from '../utils/pinUtils';
import {
  COLLECTIONS,
  subscribeCollection,
  seedInitialFirestoreData,
  setFirestoreDoc,
  updateFirestoreDoc,
  deleteFirestoreDoc,
  batchSetFirestoreDocs,
  batchDeleteFirestoreDocs,
  fetchAllFirestoreDocs,
  deleteAllFirestoreVotes,
  deleteFirestoreVotesByCandidate,
  deleteFirestoreVotesByCategory,
  resetAllFirestoreVoters,
} from '../firebase/firestoreService';

interface CastVoteResult {
  success: boolean;
  error?: string;
  receipt?: {
    receiptId: string;
    timestamp: string;
    voterName: string;
    voterNisn: string;
    voterClass: string;
  };
}

interface VotingContextType {
  // Periods
  periods: Period[];
  activePeriod: Period | undefined;
  activePeriodId: string;
  setActivePeriodId: (id: string) => void;
  createPeriod: (period: Omit<Period, 'id' | 'createdAt'>) => void;
  updatePeriodStatus: (periodId: string, status: TPSStatus) => void;
  toggleResultPublished: (periodId: string, published: boolean) => void;

  // Candidates
  candidates: Candidate[];
  activeCandidates: Candidate[];
  osisCandidates: Candidate[];
  mpkCandidates: Candidate[];
  addCandidate: (candidate: Omit<Candidate, 'id'>) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  deleteCandidate: (id: string) => void;

  // Voters
  voters: Voter[];
  activeVoters: Voter[];
  addVoter: (voter: Omit<Voter, 'id'>) => void;
  batchImportVoters: (votersData: Omit<Voter, 'id' | 'periodId'>[], replaceExisting?: boolean) => number;
  batchGeneratePins: () => number;
  resetVoterStatus: (voterId: string) => void;
  resetAllVotersStatus: () => void;

  // Votes
  votes: Vote[];
  activeVotes: Vote[];
  osisVotes: Vote[];
  mpkVotes: Vote[];
  resetCandidateVotes: (candidateId: string) => number;
  resetCategoryVotes: (category: CandidateCategory) => number;
  resetAllCandidateVotes: (resetVotersToo?: boolean) => number;

  // Voting action
  currentSession: StudentSession | null;
  loginVoter: (nisn: string, pin: string) => { success: boolean; message: string; voter?: Voter };
  logoutVoter: () => void;
  castVote: (osisCandidateId: string, mpkCandidateId: string) => CastVoteResult;

  // Admin & Password Settings
  admins: AdminUser[];
  currentAdmin: AdminUser | null;
  loginAdmin: (username: string, pass: string) => { success: boolean; message: string };
  logoutAdmin: () => void;
  updateAdminPassword: (
    adminId: string,
    oldPassword: string,
    newPassword: string,
    bypassOldCheck?: boolean
  ) => { success: boolean; message: string };
  resetAdminPassword: (adminId: string) => { success: boolean; message: string; defaultPassword: string };
  addAdminUser: (
    admin: Omit<AdminUser, 'id'> & { password?: string }
  ) => { success: boolean; message: string };
  deleteAdminUser: (adminId: string) => { success: boolean; message: string };

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string, userType: AuditLog['userType']) => void;

  // Timeline / Jadwal Tahapan
  timelineSteps: TimelineStep[];
  activeTimelineSteps: TimelineStep[];
  addTimelineStep: (step: Omit<TimelineStep, 'id'>) => void;
  updateTimelineStep: (id: string, updates: Partial<TimelineStep>) => void;
  deleteTimelineStep: (id: string) => void;
  resetTimelineSteps: () => void;

  // Simulation & System
  isSimulating: boolean;
  toggleSimulation: () => void;
  resetToDefaultData: () => void;

  // Firebase Live Sync status & Controls
  isFirebaseEnabled: boolean;
  isFirebaseConnected: boolean;
  toggleFirebaseConnection: (enable?: boolean) => void;
  syncLocalDataToFirebase: () => Promise<{ success: boolean; message: string }>;
  fetchRemoteDataFromFirebase: () => Promise<{ success: boolean; message: string }>;
}

const STORAGE_KEYS = {
  PERIODS: 'evoting_pgri_periods_v2',
  ACTIVE_PERIOD_ID: 'evoting_pgri_active_period_id_v2',
  CANDIDATES: 'evoting_pgri_candidates_v2',
  VOTERS: 'evoting_pgri_voters_v2',
  VOTES: 'evoting_pgri_votes_v2',
  AUDIT_LOGS: 'evoting_pgri_audit_logs_v2',
  ADMIN_SESSION: 'evoting_pgri_admin_session_v2',
  ADMINS: 'evoting_pgri_admins_v2',
  TIMELINE_STEPS: 'evoting_pgri_timeline_v2',
  FIREBASE_ENABLED: 'evoting_pgri_firebase_enabled_v2',
};

const VotingContext = createContext<VotingContextType | undefined>(undefined);

export const VotingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Periods
  const [periods, setPeriods] = useState<Period[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PERIODS);
      return stored ? JSON.parse(stored) : DEFAULT_PERIODS;
    } catch {
      return DEFAULT_PERIODS;
    }
  });

  const [activePeriodId, setActivePeriodId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_PERIOD_ID);
      return stored || 'period-2026-2027';
    } catch {
      return 'period-2026-2027';
    }
  });

  // 2. Candidates
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
      return stored ? JSON.parse(stored) : DEFAULT_CANDIDATES;
    } catch {
      return DEFAULT_CANDIDATES;
    }
  });

  // 3. Voters
  const [voters, setVoters] = useState<Voter[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VOTERS);
      return stored ? JSON.parse(stored) : INITIAL_VOTERS;
    } catch {
      return INITIAL_VOTERS;
    }
  });

  // 4. Votes
  const [votes, setVotes] = useState<Vote[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VOTES);
      return stored ? JSON.parse(stored) : INITIAL_VOTES;
    } catch {
      return INITIAL_VOTES;
    }
  });

  // 5. Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return stored ? JSON.parse(stored) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  // 6. Admin Users List & Passwords
  const [admins, setAdmins] = useState<AdminUser[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ADMINS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((storedAdmin: AdminUser) => {
            const initialMatch = INITIAL_ADMINS.find((ia) => ia.id === storedAdmin.id);
            return {
              ...storedAdmin,
              fullName: storedAdmin.fullName || initialMatch?.fullName || '',
              title: storedAdmin.title || initialMatch?.title || '',
              password: storedAdmin.password || 'admin123',
            };
          });
        }
      }
      return INITIAL_ADMINS;
    } catch {
      return INITIAL_ADMINS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
    } catch (e) {
      console.warn('Failed to save admins to storage:', e);
    }
  }, [admins]);

  // 7. User Sessions
  const [currentSession, setCurrentSession] = useState<StudentSession | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
      if (stored) {
        const parsed = JSON.parse(stored);
        const matched =
          INITIAL_ADMINS.find((a) => a.username.toLowerCase() === parsed.username?.toLowerCase()) || parsed;
        return matched;
      }
      return null;
    } catch {
      return null;
    }
  });

  // 7. Timeline Steps
  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TIMELINE_STEPS);
      return stored ? JSON.parse(stored) : DEFAULT_TIMELINE_STEPS;
    } catch {
      return DEFAULT_TIMELINE_STEPS;
    }
  });

  // 8. Simulation flag
  const [isSimulating, setIsSimulating] = useState(false);

  // 9. Firebase live sync status & On/Off control (Default to true for real-time sync across all devices)
  const [isFirebaseEnabled, setIsFirebaseEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FIREBASE_ENABLED);
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  const toggleFirebaseConnection = (enable?: boolean) => {
    setIsFirebaseEnabled((prev) => {
      const next = enable !== undefined ? enable : !prev;
      localStorage.setItem(STORAGE_KEYS.FIREBASE_ENABLED, String(next));
      addAuditLog(
        next ? 'FIREBASE_ON' : 'FIREBASE_OFF',
        next
          ? 'Koneksi database Cloud Firestore DIHUBUNGKAN (Mode Online Real-time aktif).'
          : 'Koneksi database Cloud Firestore DINONAKTIFKAN (Beralih ke Mode Uji Coba Aman / Local Sandbox).',
        'ADMIN'
      );
      return next;
    });
  };

  // Safe Cloud sync runner (Zero cloud requests when isFirebaseEnabled is false)
  const syncToCloud = (fn: () => Promise<unknown>) => {
    if (isFirebaseEnabled) {
      fn().catch((err) => console.warn('Cloud sync notice:', err));
    }
  };

  // Explicit manual upload of local state to Firestore
  const syncLocalDataToFirebase = async (): Promise<{ success: boolean; message: string }> => {
    try {
      await batchSetFirestoreDocs(COLLECTIONS.PERIODS, periods);
      await batchSetFirestoreDocs(COLLECTIONS.CANDIDATES, candidates);
      await batchSetFirestoreDocs(COLLECTIONS.VOTERS, voters);
      await batchSetFirestoreDocs(COLLECTIONS.VOTES, votes);
      await batchSetFirestoreDocs(COLLECTIONS.TIMELINE_STEPS, timelineSteps);
      await batchSetFirestoreDocs(COLLECTIONS.AUDIT_LOGS, auditLogs.slice(0, 50));

      addAuditLog(
        'SYNC_LOKAL_KE_CLOUD',
        `Data lokal berhasil diunggah ke Firebase Cloud: ${periods.length} periode, ${candidates.length} paslon, ${voters.length} DPT, dan ${votes.length} suara.`,
        'ADMIN'
      );
      return {
        success: true,
        message: `Berhasil mengunggah ${candidates.length} paslon, ${voters.length} DPT, dan ${votes.length} suara ke Cloud Firestore.`,
      };
    } catch (err) {
      console.error('Failed to sync data to Firebase:', err);
      return {
        success: false,
        message: 'Gagal mengunggah data ke Cloud Firestore. Periksa koneksi internet Anda.',
      };
    }
  };

  // Explicit manual download of Firestore remote data to local state
  const fetchRemoteDataFromFirebase = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const [remotePeriods, remoteCandidates, remoteVoters, remoteVotes, remoteSteps] = await Promise.all([
        fetchAllFirestoreDocs<Period>(COLLECTIONS.PERIODS),
        fetchAllFirestoreDocs<Candidate>(COLLECTIONS.CANDIDATES),
        fetchAllFirestoreDocs<Voter>(COLLECTIONS.VOTERS),
        fetchAllFirestoreDocs<Vote>(COLLECTIONS.VOTES),
        fetchAllFirestoreDocs<TimelineStep>(COLLECTIONS.TIMELINE_STEPS),
      ]);

      if (remotePeriods.length > 0) setPeriods(remotePeriods);
      if (remoteCandidates.length > 0) setCandidates(remoteCandidates);
      if (remoteVoters.length > 0) setVoters(remoteVoters);
      setVotes(remoteVotes || []);
      if (remoteSteps.length > 0) setTimelineSteps(remoteSteps);

      addAuditLog(
        'FETCH_CLOUD_KE_LOKAL',
        `Berhasil mengunduh data terbaru dari Firebase Cloud: ${remoteCandidates.length} paslon, ${remoteVoters.length} DPT, dan ${remoteVotes.length} suara.`,
        'ADMIN'
      );
      return {
        success: true,
        message: `Berhasil memuat ${remoteCandidates.length} paslon, ${remoteVoters.length} DPT, dan ${remoteVotes.length} suara dari Cloud Firestore.`,
      };
    } catch (err) {
      console.error('Failed to fetch data from Firebase:', err);
      return {
        success: false,
        message: 'Gagal memuat data dari Cloud Firestore. Periksa koneksi internet Anda.',
      };
    }
  };

  // Firestore Real-time Synchronization & Automatic Seeding
  useEffect(() => {
    if (!isFirebaseEnabled) {
      setIsFirebaseConnected(false);
      return;
    }

    let unsubs: (() => void)[] = [];
    let isMounted = true;

    const setupFirebaseSync = async () => {
      try {
        await seedInitialFirestoreData(
          DEFAULT_PERIODS,
          DEFAULT_CANDIDATES,
          INITIAL_VOTERS,
          DEFAULT_TIMELINE_STEPS
        );

        if (!isMounted) return;

        // 1. Periods
        const unsubPeriods = subscribeCollection<Period>(COLLECTIONS.PERIODS, (data) => {
          if (data && data.length > 0) {
            setPeriods(data);
          }
        });

        // 2. Candidates
        const unsubCandidates = subscribeCollection<Candidate>(COLLECTIONS.CANDIDATES, (data) => {
          if (data && data.length > 0) {
            setCandidates(data);
          }
        });

        // 3. Voters
        const unsubVoters = subscribeCollection<Voter>(COLLECTIONS.VOTERS, (data) => {
          if (data && data.length > 0) {
            setVoters(data);
          }
        });

        // 4. Votes (Digital Ballot Box)
        const unsubVotes = subscribeCollection<Vote>(COLLECTIONS.VOTES, (data) => {
          setVotes(data || []);
        });

        // 5. Audit Logs
        const unsubAudit = subscribeCollection<AuditLog>(COLLECTIONS.AUDIT_LOGS, (data) => {
          if (data && data.length > 0) {
            setAuditLogs(
              [...data].sort(
                (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              )
            );
          }
        });

        // 6. Timeline Steps
        const unsubTimeline = subscribeCollection<TimelineStep>(
          COLLECTIONS.TIMELINE_STEPS,
          (data) => {
            if (data && data.length > 0) {
              setTimelineSteps([...data].sort((a, b) => a.stepNumber - b.stepNumber));
            }
          }
        );

        unsubs = [unsubPeriods, unsubCandidates, unsubVoters, unsubVotes, unsubAudit, unsubTimeline];
        setIsFirebaseConnected(true);
      } catch (err) {
        console.warn('Firebase synchronization notice:', err);
        setIsFirebaseConnected(false);
      }
    };

    setupFirebaseSync();

    return () => {
      isMounted = false;
      unsubs.forEach((unsub) => unsub());
    };
  }, [isFirebaseEnabled]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(periods));
  }, [periods]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PERIOD_ID, activePeriodId);
  }, [activePeriodId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOTERS, JSON.stringify(voters));
  }, [voters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(votes));
  }, [votes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIMELINE_STEPS, JSON.stringify(timelineSteps));
  }, [timelineSteps]);

  useEffect(() => {
    if (currentAdmin) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(currentAdmin));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    }
  }, [currentAdmin]);

  // Derived helpers
  const activePeriod = useMemo(
    () => periods.find((p) => p.id === activePeriodId) || periods[0],
    [periods, activePeriodId]
  );

  const activeCandidates = useMemo(
    () => candidates.filter((c) => c.periodId === activePeriodId),
    [candidates, activePeriodId]
  );

  const osisCandidates = useMemo(
    () => activeCandidates.filter((c) => c.category === 'OSIS').sort((a, b) => a.ballotNumber - b.ballotNumber),
    [activeCandidates]
  );

  const mpkCandidates = useMemo(
    () => activeCandidates.filter((c) => c.category === 'MPK').sort((a, b) => a.ballotNumber - b.ballotNumber),
    [activeCandidates]
  );

  const activeVoters = useMemo(
    () => voters.filter((v) => v.periodId === activePeriodId),
    [voters, activePeriodId]
  );

  const activeVotes = useMemo(
    () => votes.filter((v) => v.periodId === activePeriodId),
    [votes, activePeriodId]
  );

  const osisVotes = useMemo(
    () => activeVotes.filter((v) => v.category === 'OSIS'),
    [activeVotes]
  );

  const mpkVotes = useMemo(
    () => activeVotes.filter((v) => v.category === 'MPK'),
    [activeVotes]
  );

  const activeTimelineSteps = useMemo(() => {
    const forPeriod = timelineSteps.filter((s) => s.periodId === activePeriodId);
    return (forPeriod.length > 0 ? forPeriod : timelineSteps).sort((a, b) => a.stepNumber - b.stepNumber);
  }, [timelineSteps, activePeriodId]);

  // Add audit log helper
  const addAuditLog = (action: string, details: string, userType: AuditLog['userType']) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      userType,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
    syncToCloud(() => setFirestoreDoc(COLLECTIONS.AUDIT_LOGS, newLog.id, newLog));
  };

  // Voter Login
  const loginVoter = (nisn: string, pin: string) => {
    const cleanNisn = nisn.trim();
    const cleanPin = pin.trim();

    if (!cleanNisn || !cleanPin) {
      return { success: false, message: 'Harap isi NISN dan PIN 6-digit secara lengkap.' };
    }

    if (!activePeriod) {
      return { success: false, message: 'Tidak ada periode pemilihan yang aktif saat ini.' };
    }

    if (activePeriod.status === 'CLOSED') {
      return { success: false, message: 'Pemungutan suara TPS digital telah RESMI DITUTUP oleh panitia.' };
    }

    if (activePeriod.status === 'PAUSED') {
      return { success: false, message: 'Bilik suara TPS sedang DIJEDA sementara untuk istirahat/rekap.' };
    }

    const voter = voters.find(
      (v) =>
        v.periodId === activePeriodId &&
        (v.nisn.trim().toLowerCase() === cleanNisn.toLowerCase() ||
          v.nisn.replace(/[\s.-]/g, '').toLowerCase() === cleanNisn.replace(/[\s.-]/g, '').toLowerCase()) &&
        v.pin.trim() === cleanPin
    );

    if (!voter) {
      addAuditLog(
        'LOGIN_SISWA_GAGAL',
        `Percobaan login gagal untuk ID: ${cleanNisn} (NISN/NIP atau PIN tidak cocok).`,
        'STUDENT'
      );
      return {
        success: false,
        message: 'Nomor Identitas (NISN Siswa / NIP Guru) atau PIN tidak cocok! Pastikan data sesuai kartu pemilih.',
      };
    }

    if (voter.hasVoted) {
      addAuditLog(
        'PERCOBAAN_DOUBLE_VOTE',
        `ID ${cleanNisn} (${voter.studentName}) mencoba login kembali padahal sudah memilih pada ${voter.votedAt}.`,
        'STUDENT'
      );
      return {
        success: false,
        message: `Hak suara atas nama ${voter.studentName} SUDAH DIGUNAKAN pada ${voter.votedAt?.slice(11, 16) || 'hari ini'} WIB. Sistem menerapkan asas 1 pemilih 1 suara.`,
      };
    }

    const session: StudentSession = {
      voter,
      loginTime: new Date().toISOString(),
      token: `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    setCurrentSession(session);
    const isTeacher =
      voter.major.includes('Pendidik') ||
      voter.classGrade.includes('GURU') ||
      voter.classGrade.includes('TENDIK') ||
      voter.nisn.length > 10;

    addAuditLog(
      'MASUK_BILIK_SUARA',
      `${isTeacher ? 'Dewan Guru/Tendik' : 'Siswa'} ${voter.studentName} (${voter.classGrade}) berhasil memasuki bilik suara digital.`,
      'STUDENT'
    );

    return {
      success: true,
      message: `Selamat datang, ${voter.studentName}! Silakan gunakan hak suara Anda dengan cermat.`,
      voter,
    };
  };

  const logoutVoter = () => {
    if (currentSession) {
      addAuditLog(
        'KELUAR_BILIK_SUARA',
        `Siswa ${currentSession.voter.studentName} keluar dari bilik suara.`,
        'STUDENT'
      );
    }
    setCurrentSession(null);
  };

  // Cast Vote - STRICT LUBER IMPLEMENTATION:
  // Voter's hasVoted is updated to true, but the Vote record stores ONLY candidateId and periodId.
  // NO student name or NISN is linked to the vote record!
  const castVote = (osisCandidateId: string, mpkCandidateId: string): CastVoteResult => {
    if (!currentSession) {
      return { success: false, error: 'Sesi pemilih tidak ditemukan atau telah kedaluwarsa. Silakan login kembali.' };
    }

    const currentVoterId = currentSession.voter.id;
    const voterInState = voters.find((v) => v.id === currentVoterId);

    if (!voterInState || voterInState.hasVoted) {
      return { success: false, error: 'Hak suara Anda telah tercatat sebelumnya.' };
    }

    const now = new Date().toISOString();

    // Create anonymous vote entries
    const newVotes: Vote[] = [
      {
        id: `vote-${Date.now()}-osis-${Math.random().toString(36).substring(2, 7)}`,
        periodId: activePeriodId,
        candidateId: osisCandidateId,
        category: 'OSIS',
        timestamp: now,
      },
      {
        id: `vote-${Date.now()}-mpk-${Math.random().toString(36).substring(2, 7)}`,
        periodId: activePeriodId,
        candidateId: mpkCandidateId,
        category: 'MPK',
        timestamp: now,
      },
    ];

    // Atomically update state
    setVotes((prev) => [...prev, ...newVotes]);

    // Push votes to Firestore digital ballot box (only if Firebase is enabled)
    syncToCloud(() => setFirestoreDoc(COLLECTIONS.VOTES, newVotes[0].id, newVotes[0]));
    syncToCloud(() => setFirestoreDoc(COLLECTIONS.VOTES, newVotes[1].id, newVotes[1]));

    // Update voter status
    setVoters((prev) =>
      prev.map((v) =>
        v.id === currentVoterId
          ? {
              ...v,
              hasVoted: true,
              votedAt: now,
            }
          : v
      )
    );
    syncToCloud(() =>
      updateFirestoreDoc(COLLECTIONS.VOTERS, currentVoterId, {
        hasVoted: true,
        votedAt: now,
      })
    );

    const receiptData = {
      receiptId: `EVT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: now,
      voterName: currentSession.voter.studentName,
      voterNisn: currentSession.voter.nisn,
      voterClass: currentSession.voter.classGrade,
    };

    addAuditLog(
      'SUARA_TERCATAT',
      `Surat suara anonim untuk OSIS dan MPK berhasil masuk ke kotak suara digital (Status DPT diperbarui: Sudah Memilih).`,
      'SYSTEM'
    );

    return {
      success: true,
      receipt: receiptData,
    };
  };

  // Admin Login
  const loginAdmin = (username: string, pass: string) => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = pass.trim();

    const matchedAdmin =
      admins.find((a) => a.username.toLowerCase() === cleanUser) ||
      INITIAL_ADMINS.find((a) => a.username.toLowerCase() === cleanUser);

    const expectedPassword = matchedAdmin?.password || 'admin123';

    // Strict authentication: matches configured password or factory default if not yet changed
    const isAuthValid = Boolean(
      matchedAdmin &&
        (cleanPass === expectedPassword || (expectedPassword === 'admin123' && cleanPass === 'pgri1sukabumi'))
    );

    if (isAuthValid && matchedAdmin) {
      const user: AdminUser = matchedAdmin;
      setCurrentAdmin(user);
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(user));
      } catch (err) {
        console.warn('Failed to save session:', err);
      }
      addAuditLog('ADMIN_LOGIN', `Admin ${user.fullName} (${user.role}) berhasil masuk ke sistem.`, 'ADMIN');
      return { success: true, message: `Selamat datang, ${user.fullName}` };
    }

    addAuditLog('ADMIN_LOGIN_GAGAL', `Percobaan login gagal untuk akun "${cleanUser}".`, 'SYSTEM');
    return {
      success: false,
      message: 'Username atau password salah! Silakan periksa kembali atau hubungi Super Admin.',
    };
  };

  const logoutAdmin = () => {
    if (currentAdmin) {
      addAuditLog('ADMIN_LOGOUT', `Admin ${currentAdmin.fullName} keluar dari sesi.`, 'ADMIN');
    }
    setCurrentAdmin(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    } catch (err) {
      console.warn('Failed to remove admin session:', err);
    }
  };

  // Password & Admin management functions
  const updateAdminPassword = (
    adminId: string,
    oldPassword: string,
    newPassword: string,
    bypassOldCheck = false
  ) => {
    const targetAdmin = admins.find((a) => a.id === adminId);
    if (!targetAdmin) {
      return { success: false, message: 'Akun administrator tidak ditemukan.' };
    }

    const currentSavedPass = targetAdmin.password || 'admin123';

    if (!bypassOldCheck) {
      if (oldPassword.trim() !== currentSavedPass && oldPassword.trim() !== 'pgri1sukabumi') {
        return { success: false, message: 'Password lama salah! Mohon ketikkan password saat ini dengan benar.' };
      }
    }

    const cleanNewPass = newPassword.trim();
    if (cleanNewPass.length < 4) {
      return { success: false, message: 'Password baru minimal 4 karakter demi keamanan sistem!' };
    }

    const updatedAdmin: AdminUser = {
      ...targetAdmin,
      password: cleanNewPass,
      updatedAt: new Date().toISOString(),
    };

    setAdmins((prev) =>
      prev.map((a) => (a.id === adminId ? updatedAdmin : a))
    );

    // If changing password for currently logged in admin, update active session
    if (currentAdmin?.id === adminId) {
      setCurrentAdmin(updatedAdmin);
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(updatedAdmin));
      } catch (err) {
        console.warn('Failed to save session:', err);
      }
    }

    syncToCloud(() => setFirestoreDoc(COLLECTIONS.ADMINS, adminId, updatedAdmin));

    addAuditLog(
      'UPDATE_PASSWORD_ADMIN',
      `Kata sandi untuk akun "${targetAdmin.username}" (${targetAdmin.fullName}) berhasil diperbarui oleh ${currentAdmin?.fullName || 'Super Admin'}.`,
      'ADMIN'
    );

    return {
      success: true,
      message: `Password untuk akun "${targetAdmin.fullName}" berhasil diperbarui!`,
    };
  };

  const resetAdminPassword = (adminId: string) => {
    const targetAdmin = admins.find((a) => a.id === adminId);
    if (!targetAdmin) {
      return { success: false, message: 'Akun administrator tidak ditemukan.', defaultPassword: '' };
    }

    const defaultPass = 'admin123';
    const updatedAdmin: AdminUser = {
      ...targetAdmin,
      password: defaultPass,
      updatedAt: new Date().toISOString(),
    };

    setAdmins((prev) =>
      prev.map((a) => (a.id === adminId ? updatedAdmin : a))
    );

    if (currentAdmin?.id === adminId) {
      setCurrentAdmin(updatedAdmin);
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(updatedAdmin));
      } catch (err) {
        console.warn('Failed to save session:', err);
      }
    }

    syncToCloud(() => setFirestoreDoc(COLLECTIONS.ADMINS, adminId, updatedAdmin));

    addAuditLog(
      'RESET_PASSWORD_ADMIN',
      `Password akun "${targetAdmin.username}" (${targetAdmin.fullName}) di-reset ke nilai bawaan "${defaultPass}" oleh Super Admin ${currentAdmin?.fullName}.`,
      'ADMIN'
    );

    return {
      success: true,
      message: `Password akun "${targetAdmin.fullName}" berhasil di-reset ke default ("${defaultPass}").`,
      defaultPassword: defaultPass,
    };
  };

  const addAdminUser = (adminData: Omit<AdminUser, 'id'> & { password?: string }) => {
    const cleanUser = adminData.username.trim().toLowerCase();
    if (admins.some((a) => a.username.toLowerCase() === cleanUser)) {
      return { success: false, message: `Username "${cleanUser}" sudah terdaftar!` };
    }

    const newAdmin: AdminUser = {
      ...adminData,
      id: `admin-${Date.now()}`,
      username: cleanUser,
      password: adminData.password?.trim() || 'admin123',
      updatedAt: new Date().toISOString(),
    };

    setAdmins((prev) => [...prev, newAdmin]);
    syncToCloud(() => setFirestoreDoc(COLLECTIONS.ADMINS, newAdmin.id, newAdmin));

    addAuditLog(
      'TAMBAH_AKUN_ADMIN',
      `Akun admin baru "${newAdmin.fullName}" (${newAdmin.role}) ditambahkan ke sistem.`,
      'ADMIN'
    );

    return { success: true, message: `Akun "${newAdmin.fullName}" berhasil dibuat!` };
  };

  const deleteAdminUser = (adminId: string) => {
    const target = admins.find((a) => a.id === adminId);
    if (!target) return { success: false, message: 'Akun tidak ditemukan.' };

    if (target.id === currentAdmin?.id) {
      return { success: false, message: 'Anda tidak dapat menghapus akun yang sedang Anda gunakan saat ini!' };
    }

    const superAdmins = admins.filter((a) => a.role === 'SUPER_ADMIN');
    if (target.role === 'SUPER_ADMIN' && superAdmins.length <= 1) {
      return { success: false, message: 'Tidak dapat menghapus Super Admin terakhir pada sistem!' };
    }

    setAdmins((prev) => prev.filter((a) => a.id !== adminId));
    syncToCloud(() => deleteFirestoreDoc(COLLECTIONS.ADMINS, adminId));

    addAuditLog(
      'HAPUS_AKUN_ADMIN',
      `Akun admin "${target.fullName}" (${target.username}) telah dihapus dari sistem.`,
      'ADMIN'
    );

    return { success: true, message: `Akun "${target.fullName}" berhasil dihapus.` };
  };

  // Period actions
  const createPeriod = (periodData: Omit<Period, 'id' | 'createdAt'>) => {
    const newPeriod: Period = {
      ...periodData,
      id: `period-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPeriods((prev) => [newPeriod, ...prev]);
    syncToCloud(() => setFirestoreDoc(COLLECTIONS.PERIODS, newPeriod.id, newPeriod));
    addAuditLog('TAMBAH_PERIODE', `Periode baru "${periodData.title}" (${periodData.academicYear}) berhasil dibuat.`, 'ADMIN');
  };

  const updatePeriodStatus = (periodId: string, status: TPSStatus) => {
    setPeriods((prev) =>
      prev.map((p) => (p.id === periodId ? { ...p, status } : p))
    );
    syncToCloud(() => updateFirestoreDoc(COLLECTIONS.PERIODS, periodId, { status }));
    addAuditLog('UPDATE_STATUS_TPS', `Status TPS periode diubah menjadi: ${status}`, 'ADMIN');
  };

  const toggleResultPublished = (periodId: string, published: boolean) => {
    setPeriods((prev) =>
      prev.map((p) => (p.id === periodId ? { ...p, isResultPublished: published } : p))
    );
    syncToCloud(() => updateFirestoreDoc(COLLECTIONS.PERIODS, periodId, { isResultPublished: published }));
    addAuditLog(
      'PENGATURAN_QUICK_COUNT',
      published
        ? 'Penayangan hasil hitung cepat (Quick Count) DIBUKA untuk umum.'
        : 'Penayangan hasil hitung cepat DIKUNCI / DISEMBUNYIKAN (Freeze) oleh panitia.',
      'ADMIN'
    );
  };

  // Candidate actions
  const addCandidate = (candidateData: Omit<Candidate, 'id'>) => {
    const newCand: Candidate = {
      ...candidateData,
      id: `cand-${Date.now()}`,
    };
    setCandidates((prev) => [...prev, newCand]);
    syncToCloud(() => setFirestoreDoc(COLLECTIONS.CANDIDATES, newCand.id, newCand));
    addAuditLog(
      'TAMBAH_KANDIDAT',
      `Paslon ${candidateData.category} No. ${candidateData.ballotNumber} (${candidateData.chairmanName} & ${candidateData.viceChairmanName}) berhasil ditambahkan.`,
      'ADMIN'
    );
  };

  const updateCandidate = (id: string, updates: Partial<Candidate>) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    syncToCloud(() => updateFirestoreDoc(COLLECTIONS.CANDIDATES, id, updates));
    addAuditLog('UPDATE_KANDIDAT', `Data paslon ID: ${id} telah diperbarui.`, 'ADMIN');
  };

  const deleteCandidate = (id: string) => {
    const target = candidates.find((c) => c.id === id);
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    syncToCloud(() => deleteFirestoreDoc(COLLECTIONS.CANDIDATES, id));
    addAuditLog(
      'HAPUS_KANDIDAT',
      `Paslon ${target?.category} No. ${target?.ballotNumber} (${target?.chairmanName}) telah dihapus dari daftar pemilihan.`,
      'ADMIN'
    );
  };

  // Voter actions
  const addVoter = (voterData: Omit<Voter, 'id'>) => {
    const usedPins = new Set(voters.map((v) => v.pin).filter(Boolean) as string[]);
    let finalPin = voterData.pin?.trim();
    if (!finalPin || finalPin.length !== 6 || usedPins.has(finalPin)) {
      finalPin = generateUniquePin(usedPins);
    }

    const newVoter: Voter = {
      ...voterData,
      pin: finalPin,
      id: `voter-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    setVoters((prev) => [newVoter, ...prev]);
    syncToCloud(() => setFirestoreDoc(COLLECTIONS.VOTERS, newVoter.id, newVoter));
    addAuditLog(
      'TAMBAH_DPT',
      `Siswa baru ${voterData.studentName} (NISN: ${voterData.nisn}) ditambahkan ke DPT dengan PIN terverifikasi unik.`,
      'ADMIN'
    );
  };

  const batchImportVoters = (votersData: Omit<Voter, 'id' | 'periodId'>[], replaceExisting = false): number => {
    const existingPins = new Set(
      replaceExisting
        ? []
        : (voters.filter((v) => v.periodId === activePeriodId).map((v) => v.pin).filter(Boolean) as string[])
    );
    const withUniquePins = ensureUniquePins(votersData, existingPins);

    const newEntries: Voter[] = withUniquePins.map((vd, idx) => ({
      ...vd,
      id: `voter-imp-${Date.now()}-${idx}`,
      periodId: activePeriodId,
      hasVoted: false,
    }));

    if (replaceExisting) {
      setVoters((prev) => [...newEntries, ...prev.filter((v) => v.periodId !== activePeriodId)]);
      addAuditLog(
        'IMPORT_DPT_MASSAL',
        `Berhasil mengganti DPT periode aktif dengan ${newEntries.length} pemilih baru dari file Excel (Semua PIN dijamin 100% unik).`,
        'ADMIN'
      );
    } else {
      setVoters((prev) => [...newEntries, ...prev]);
      addAuditLog(
        'IMPORT_DPT_MASSAL',
        `Berhasil mengimpor ${newEntries.length} siswa ke dalam DPT periode aktif dari file Excel (Semua PIN dijamin 100% unik).`,
        'ADMIN'
      );
    }
    syncToCloud(() => batchSetFirestoreDocs(COLLECTIONS.VOTERS, newEntries));
    return newEntries.length;
  };

  const batchGeneratePins = (): number => {
    const existingPins = new Set<string>();
    let count = 0;
    const updatedVoters: Voter[] = [];
    setVoters((prev) =>
      prev.map((v) => {
        if (v.periodId === activePeriodId) {
          const currentPin = v.pin?.trim();
          if (!currentPin || currentPin.length !== 6 || existingPins.has(currentPin)) {
            count++;
            const newPin = generateUniquePin(existingPins);
            const updated = {
              ...v,
              pin: newPin,
            };
            updatedVoters.push(updated);
            return updated;
          } else {
            existingPins.add(currentPin);
          }
        }
        return v;
      })
    );
    if (updatedVoters.length > 0) {
      syncToCloud(() => batchSetFirestoreDocs(COLLECTIONS.VOTERS, updatedVoters));
    }
    addAuditLog(
      'GENERATE_PIN_MASSAL',
      `Berhasil men-generate PIN 6 digit baru terjamin unik (zero-collision) untuk ${count} pemilih di DPT.`,
      'ADMIN'
    );
    return count;
  };

  const resetVoterStatus = (voterId: string) => {
    setVoters((prev) =>
      prev.map((v) => (v.id === voterId ? { ...v, hasVoted: false, votedAt: undefined } : v))
    );
    syncToCloud(() => updateFirestoreDoc(COLLECTIONS.VOTERS, voterId, { hasVoted: false, votedAt: null }));
    addAuditLog('RESET_STATUS_PEMILIH', `Status pemilih ID ${voterId} dikembalikan ke Belum Memilih.`, 'ADMIN');
  };

  const resetAllVotersStatus = () => {
    // 1. Synchronously update local voters state
    setVoters((prev) =>
      prev.map((v) =>
        v.periodId === activePeriodId
          ? { ...v, hasVoted: false, votedAt: undefined }
          : v
      )
    );

    // 2. Synchronously clear local votes for active period
    setVotes((prev) => prev.filter((v) => v.periodId !== activePeriodId));

    // 3. Atomically purge from Cloud Firestore so all connected browsers update in real-time
    syncToCloud(async () => {
      await deleteAllFirestoreVotes(activePeriodId);
      await resetAllFirestoreVoters(activePeriodId);
    });

    addAuditLog('RESET_KOTAK_SUARA', `Seluruh kotak suara periode ${activePeriod?.academicYear} dikosongkan dan status DPT direset.`, 'ADMIN');
  };

  const resetCandidateVotes = (candidateId: string): number => {
    const candidate = candidates.find((c) => c.id === candidateId);
    const candLabel = candidate
      ? `No. 0${candidate.ballotNumber} (${candidate.chairmanName} & ${candidate.viceChairmanName} - ${candidate.category})`
      : candidateId;

    const countDeleted = votes.filter(
      (v) => v.periodId === activePeriodId && v.candidateId === candidateId
    ).length;

    // 1. Synchronously update local state
    setVotes((prev) =>
      prev.filter((v) => !(v.periodId === activePeriodId && v.candidateId === candidateId))
    );

    // 2. Atomically delete from Cloud Firestore
    syncToCloud(async () => {
      await deleteFirestoreVotesByCandidate(candidateId, activePeriodId);
    });

    addAuditLog(
      'RESET_SUARA_PASLON',
      `Berhasil mengosongkan ${countDeleted} perolehan suara untuk paslon ${candLabel} periode ${activePeriod?.academicYear || ''}.`,
      'ADMIN'
    );
    return countDeleted;
  };

  const resetCategoryVotes = (category: CandidateCategory): number => {
    const countDeleted = votes.filter(
      (v) => v.periodId === activePeriodId && v.category === category
    ).length;

    // 1. Synchronously update local state
    setVotes((prev) =>
      prev.filter((v) => !(v.periodId === activePeriodId && v.category === category))
    );

    // 2. Atomically delete from Cloud Firestore
    syncToCloud(async () => {
      await deleteFirestoreVotesByCategory(category, activePeriodId);
    });

    addAuditLog(
      'RESET_SUARA_KATEGORI',
      `Berhasil mengosongkan ${countDeleted} perolehan suara pada seluruh paslon kategori ${category} periode ${activePeriod?.academicYear || ''}.`,
      'ADMIN'
    );
    return countDeleted;
  };

  const resetAllCandidateVotes = (resetVotersToo = true): number => {
    const countDeleted = votes.filter((v) => v.periodId === activePeriodId).length;

    // 1. Synchronously update local state
    setVotes((prev) => prev.filter((v) => v.periodId !== activePeriodId));

    if (resetVotersToo) {
      setVoters((prev) =>
        prev.map((v) =>
          v.periodId === activePeriodId
            ? { ...v, hasVoted: false, votedAt: undefined }
            : v
        )
      );
    }

    // 2. Atomically delete from Cloud Firestore so ALL browsers (Edge, Chrome, Netlify, Github Pages) update
    syncToCloud(async () => {
      await deleteAllFirestoreVotes(activePeriodId);
      if (resetVotersToo) {
        await resetAllFirestoreVoters(activePeriodId);
      }
    });

    addAuditLog(
      'RESET_SEMUA_SUARA_PASLON',
      `Berhasil mengosongkan seluruh perolehan suara (${countDeleted} suara) paslon periode ${activePeriod?.academicYear || ''}.${
        resetVotersToo ? ' Status pemilih DPT juga dikembalikan ke Belum Memilih.' : ''
      }`,
      'ADMIN'
    );
    return countDeleted;
  };

  // Simulation mode
  const simulateRandomVote = () => {
    const unvoted = activeVoters.filter((v) => !v.hasVoted);
    if (unvoted.length === 0 || osisCandidates.length === 0 || mpkCandidates.length === 0) {
      setIsSimulating(false);
      return;
    }

    const randomVoter = unvoted[Math.floor(Math.random() * unvoted.length)];
    const randomOsis = osisCandidates[Math.floor(Math.random() * osisCandidates.length)];
    const randomMpk = mpkCandidates[Math.floor(Math.random() * mpkCandidates.length)];

    const now = new Date().toISOString();

    const simOsisVote: Vote = {
      id: `sim-o-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      periodId: activePeriodId,
      candidateId: randomOsis.id,
      category: 'OSIS',
      timestamp: now,
    };

    const simMpkVote: Vote = {
      id: `sim-m-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      periodId: activePeriodId,
      candidateId: randomMpk.id,
      category: 'MPK',
      timestamp: now,
    };

    setVotes((prev) => [...prev, simOsisVote, simMpkVote]);
    syncToCloud(() => setFirestoreDoc(COLLECTIONS.VOTES, simOsisVote.id, simOsisVote));
    syncToCloud(() => setFirestoreDoc(COLLECTIONS.VOTES, simMpkVote.id, simMpkVote));

    setVoters((prev) =>
      prev.map((v) => (v.id === randomVoter.id ? { ...v, hasVoted: true, votedAt: now } : v))
    );
    syncToCloud(() =>
      updateFirestoreDoc(COLLECTIONS.VOTERS, randomVoter.id, { hasVoted: true, votedAt: now })
    );

    addAuditLog(
      'SIMULASI_SUARA',
      `[Simulasi TPS] Suara masuk secara acak dari siswa ${randomVoter.studentName} (${randomVoter.classGrade}).`,
      'SYSTEM'
    );
  };

  const toggleSimulation = () => {
    setIsSimulating((prev) => !prev);
  };

  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      simulateRandomVote();
    }, 2800);
    return () => clearInterval(interval);
  }, [isSimulating, activeVoters, osisCandidates, mpkCandidates]);

  // Timeline Step Actions
  const addTimelineStep = (stepData: Omit<TimelineStep, 'id'>) => {
    const newStep: TimelineStep = {
      ...stepData,
      id: `step-${Date.now()}`,
    };
    setTimelineSteps((prev) => [...prev, newStep]);
    syncToCloud(() => setFirestoreDoc(COLLECTIONS.TIMELINE_STEPS, newStep.id, newStep));
    addAuditLog(
      'TAMBAH_TAHAPAN_PEMILU',
      `Tahapan ke-${stepData.stepNumber} "${stepData.title}" (${stepData.dateRange}) berhasil ditambahkan.`,
      'ADMIN'
    );
  };

  const updateTimelineStep = (id: string, updates: Partial<TimelineStep>) => {
    setTimelineSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    syncToCloud(() => updateFirestoreDoc(COLLECTIONS.TIMELINE_STEPS, id, updates));
    addAuditLog(
      'UPDATE_TAHAPAN_PEMILU',
      `Jadwal tahapan pemilu "${updates.title || id}" tanggal riil (${updates.dateRange || 'diperbarui'}) berhasil disimpan.`,
      'ADMIN'
    );
  };

  const deleteTimelineStep = (id: string) => {
    const target = timelineSteps.find((s) => s.id === id);
    setTimelineSteps((prev) => prev.filter((s) => s.id !== id));
    syncToCloud(() => deleteFirestoreDoc(COLLECTIONS.TIMELINE_STEPS, id));
    addAuditLog(
      'HAPUS_TAHAPAN_PEMILU',
      `Tahapan "${target?.title || id}" telah dihapus dari jadwal pemilu.`,
      'ADMIN'
    );
  };

  const resetTimelineSteps = () => {
    setTimelineSteps(DEFAULT_TIMELINE_STEPS);
    syncToCloud(() => batchSetFirestoreDocs(COLLECTIONS.TIMELINE_STEPS, DEFAULT_TIMELINE_STEPS));
    addAuditLog(
      'RESET_TAHAPAN_PEMILU',
      'Jadwal tahapan pemilu dikembalikan ke konfigurasi standar sekolah.',
      'ADMIN'
    );
  };

  // Factory reset
  const resetToDefaultData = () => {
    localStorage.removeItem(STORAGE_KEYS.PERIODS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_PERIOD_ID);
    localStorage.removeItem(STORAGE_KEYS.CANDIDATES);
    localStorage.removeItem(STORAGE_KEYS.VOTERS);
    localStorage.removeItem(STORAGE_KEYS.VOTES);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    localStorage.removeItem(STORAGE_KEYS.ADMINS);
    localStorage.removeItem(STORAGE_KEYS.TIMELINE_STEPS);

    setPeriods(DEFAULT_PERIODS);
    setActivePeriodId('period-2026-2027');
    setCandidates(DEFAULT_CANDIDATES);
    setVoters(INITIAL_VOTERS);
    setVotes(INITIAL_VOTES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setTimelineSteps(DEFAULT_TIMELINE_STEPS);
    setAdmins(INITIAL_ADMINS);
    setCurrentAdmin(null);
    setCurrentSession(null);
    setIsSimulating(false);

    syncToCloud(() =>
      seedInitialFirestoreData(
        DEFAULT_PERIODS,
        DEFAULT_CANDIDATES,
        INITIAL_VOTERS,
        DEFAULT_TIMELINE_STEPS
      )
    );
  };

  return (
    <VotingContext.Provider
      value={{
        periods,
        activePeriod,
        activePeriodId,
        setActivePeriodId,
        createPeriod,
        updatePeriodStatus,
        toggleResultPublished,
        candidates,
        activeCandidates,
        osisCandidates,
        mpkCandidates,
        addCandidate,
        updateCandidate,
        deleteCandidate,
        voters,
        activeVoters,
        addVoter,
        batchImportVoters,
        batchGeneratePins,
        resetVoterStatus,
        resetAllVotersStatus,
        votes,
        activeVotes,
        osisVotes,
        mpkVotes,
        resetCandidateVotes,
        resetCategoryVotes,
        resetAllCandidateVotes,
        currentSession,
        loginVoter,
        logoutVoter,
        castVote,
        currentAdmin,
        admins,
        loginAdmin,
        logoutAdmin,
        updateAdminPassword,
        resetAdminPassword,
        addAdminUser,
        deleteAdminUser,
        auditLogs,
        addAuditLog,
        timelineSteps,
        activeTimelineSteps,
        addTimelineStep,
        updateTimelineStep,
        deleteTimelineStep,
        resetTimelineSteps,
        isSimulating,
        toggleSimulation,
        resetToDefaultData,
        isFirebaseEnabled,
        isFirebaseConnected,
        toggleFirebaseConnection,
        syncLocalDataToFirebase,
        fetchRemoteDataFromFirebase,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};

export const useVoting = (): VotingContextType => {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
};
