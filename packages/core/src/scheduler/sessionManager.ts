export interface Session {
  id: string;
  courseId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  instructorId: string;
  studentIds: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export class SessionManager {
  private sessions: Map<string, Session> = new Map();

  createSession(sessionData: Omit<Session, 'id' | 'status'>): Session {
    const session: Session = {
      id: this.generateId(),
      status: 'scheduled',
      ...sessionData,
    };

    this.sessions.set(session.id, session);
    return session;
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  updateSession(id: string, updates: Partial<Session>): Session | null {
    const session = this.sessions.get(id);
    if (!session) return null;

    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  deleteSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  getSessionsByCourse(courseId: string): Session[] {
    return Array.from(this.sessions.values()).filter(
      session => session.courseId === courseId
    );
  }

  getSessionsByInstructor(instructorId: string): Session[] {
    return Array.from(this.sessions.values()).filter(
      session => session.instructorId === instructorId
    );
  }

  private generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const sessionManager = new SessionManager();
