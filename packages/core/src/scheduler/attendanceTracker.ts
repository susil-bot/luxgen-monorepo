export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  timestamp: Date;
  notes?: string;
}

export class AttendanceTracker {
  private attendance: Map<string, AttendanceRecord> = new Map();

  markAttendance(record: Omit<AttendanceRecord, 'id' | 'timestamp'>): AttendanceRecord {
    const attendanceRecord: AttendanceRecord = {
      id: this.generateId(),
      timestamp: new Date(),
      ...record,
    };

    this.attendance.set(attendanceRecord.id, attendanceRecord);
    return attendanceRecord;
  }

  getAttendanceBySession(sessionId: string): AttendanceRecord[] {
    return Array.from(this.attendance.values()).filter(
      record => record.sessionId === sessionId
    );
  }

  getAttendanceByStudent(studentId: string): AttendanceRecord[] {
    return Array.from(this.attendance.values()).filter(
      record => record.studentId === studentId
    );
  }

  getAttendanceStats(sessionId: string): {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
  } {
    const records = this.getAttendanceBySession(sessionId);
    const stats = {
      total: records.length,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    };

    records.forEach(record => {
      stats[record.status]++;
    });

    return stats;
  }

  private generateId(): string {
    return `attendance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const attendanceTracker = new AttendanceTracker();
