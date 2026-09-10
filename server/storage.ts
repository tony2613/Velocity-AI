import {
  type User,
  type Note,
  type InsertNote,
  type Summary,
  type InsertSummary,
  type Quiz,
  type InsertQuiz,
  type Question,
  type InsertQuestion,
  type QuizAttempt,
  type InsertQuizAttempt,
  users, notes, summaries, quizzes, questions, quizAttempts, usageLogs, type InsertUsageLog,
  userActiveSessions, session, type UserActiveSession,
  canaChats, type InsertCanaChat, type CanaChat,
  exams, type InsertExam, type Exam,
  studyPlans, type InsertStudyPlan, type StudyPlan,
  studyTasks, type InsertStudyTask, type StudyTask,
  topicMastery, type InsertTopicMastery, type TopicMastery
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, and, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  setPasswordResetToken(userId: string, token: string, expiry: Date): Promise<void>;
  updateUserPassword(userId: string, password: string): Promise<void>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  updateUserGoogleId(userId: string, googleId: string): Promise<User>;
  createUser(user: Partial<User> & { username: string }): Promise<User>;
  resetDailyUsage(userId: string): Promise<void>;
  incrementDailyUsage(userId: string): Promise<void>;
  resetDailySearch(userId: string): Promise<void>;
  incrementDailySearch(userId: string): Promise<void>;
  resetMonthlySearch(userId: string): Promise<void>;
  incrementMonthlySearch(userId: string): Promise<void>;

  createNote(note: InsertNote & { userId: string }): Promise<Note>;
  getNote(id: string): Promise<Note | undefined>;
  getAllNotes(userId: string): Promise<Note[]>;
  deleteNote(id: string, userId: string): Promise<void>;
  updateUserTier(userId: string, tier: string): Promise<void>;
  updateUserTierWithExpiry(userId: string, tier: string, expiresAt: Date): Promise<void>;

  createSummary(summary: InsertSummary): Promise<Summary>;
  getSummaryByNoteId(noteId: string): Promise<Summary | undefined>;
  deleteSummaryByNoteId(noteId: string): Promise<void>;

  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuiz(id: string): Promise<Quiz | undefined>;
  getQuizByNoteId(noteId: string): Promise<Quiz | undefined>;
  getAllQuizzes(): Promise<Quiz[]>;
  getAllQuizzesByUserId(userId: string): Promise<Quiz[]>;
  getAllQuizzesByNoteId(noteId: string): Promise<Quiz[]>;

  logUsage(log: InsertUsageLog): Promise<void>;

  createQuestion(question: InsertQuestion): Promise<Question>;
  getQuestionsByQuizId(quizId: string): Promise<Question[]>;

  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getQuizAttemptsByQuizId(quizId: string): Promise<QuizAttempt[]>;

  createCanaChat(chat: InsertCanaChat): Promise<CanaChat>;
  getCanaChatsByUserId(userId: string): Promise<CanaChat[]>;
  getCanaChat(id: string): Promise<CanaChat | undefined>;
  updateCanaChatMessages(id: string, messages: any[]): Promise<CanaChat>;

  registerActiveSession(userId: string, deviceId: string, sessionId: string, userAgent: string | null): Promise<void>;
  getActiveSessions(userId: string): Promise<UserActiveSession[]>;
  deleteActiveSessionBySessionId(sessionId: string): Promise<void>;

  // Exam Calendar & Adaptive Planner
  createExam(exam: InsertExam): Promise<Exam>;
  getExamsByUserId(userId: string): Promise<Exam[]>;
  getExam(id: string): Promise<Exam | undefined>;
  deleteExam(id: string, userId: string): Promise<void>;

  createStudyPlan(plan: InsertStudyPlan): Promise<StudyPlan>;
  getStudyPlanByExamId(examId: string): Promise<StudyPlan | undefined>;
  getStudyPlansByUserId(userId: string): Promise<StudyPlan[]>;
  updateStudyPlan(id: string, updates: Partial<StudyPlan>): Promise<StudyPlan | undefined>;

  createStudyTasks(tasks: InsertStudyTask[]): Promise<StudyTask[]>;
  getStudyTasksByPlanId(planId: string): Promise<StudyTask[]>;
  getStudyTasksByUserId(userId: string): Promise<StudyTask[]>;
  updateStudyTask(id: string, userId: string, updates: Partial<StudyTask>): Promise<StudyTask | undefined>;
  deleteStudyTasksByPlanId(planId: string): Promise<void>;

  // Weakness Tracking & Mastery
  recordTopicMastery(mastery: InsertTopicMastery): Promise<TopicMastery>;
  getTopicMasteriesByUserId(userId: string): Promise<TopicMastery[]>;
  updateTopicMastery(userId: string, subject: string, topic: string, scorePct: number): Promise<TopicMastery>;
}

export class DatabaseStorage implements IStorage {
  public readonly db = db;

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetToken, token));
    return user;
  }

  async setPasswordResetToken(userId: string, token: string, expiry: Date): Promise<void> {
    await db.update(users)
      .set({ resetToken: token, resetTokenExpiry: expiry })
      .where(eq(users.id, userId));
  }

  async updateUserPassword(userId: string, password: string): Promise<void> {
    await db.update(users)
      .set({ password, resetToken: null, resetTokenExpiry: null })
      .where(eq(users.id, userId));
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async updateUserGoogleId(userId: string, googleId: string): Promise<User> {
    const [updatedUser] = await db.update(users).set({ googleId }).where(eq(users.id, userId)).returning();
    return updatedUser;
  }

  async createUser(insertUser: Partial<User> & { username: string }): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async resetDailyUsage(userId: string): Promise<void> {
    await db.update(users)
      .set({ dailyUploadCount: 0, lastUploadDate: new Date() })
      .where(eq(users.id, userId));
  }

  async incrementDailyUsage(userId: string): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return;
    
    const today = new Date();
    let newStreak = user.streakCount || 0;
    
    if (user.lastUploadDate) {
      const lastDate = new Date(user.lastUploadDate);
      const isToday = today.getUTCDate() === lastDate.getUTCDate() &&
                      today.getUTCMonth() === lastDate.getUTCMonth() &&
                      today.getUTCFullYear() === lastDate.getUTCFullYear();
                      
      const yesterday = new Date(today);
      yesterday.setUTCDate(today.getUTCDate() - 1);
      
      const isYesterday = yesterday.getUTCDate() === lastDate.getUTCDate() &&
                          yesterday.getUTCMonth() === lastDate.getUTCMonth() &&
                          yesterday.getUTCFullYear() === lastDate.getUTCFullYear();

      if (isYesterday) {
        newStreak += 1;
      } else if (!isToday) {
        newStreak = 1; // Reset streak if more than 1 day passed
      }
    } else {
      newStreak = 1;
    }

    await db.update(users)
      .set({
        dailyUploadCount: sql`${users.dailyUploadCount} + 1`,
        lastUploadDate: today,
        streakCount: newStreak
      })
      .where(eq(users.id, userId));
  }

  async resetDailySearch(userId: string): Promise<void> {
    await db.update(users)
      .set({ dailySearchCount: 0, lastSearchDate: new Date() })
      .where(eq(users.id, userId));
  }

  async incrementDailySearch(userId: string): Promise<void> {
    await db.update(users)
      .set({
        dailySearchCount: sql`${users.dailySearchCount} + 1`,
        lastSearchDate: new Date()
      })
      .where(eq(users.id, userId));
  }

  async resetMonthlySearch(userId: string): Promise<void> {
    await db.update(users)
      .set({ monthlySearchCount: 0, lastMonthlySearchDate: new Date() })
      .where(eq(users.id, userId));
  }

  async incrementMonthlySearch(userId: string): Promise<void> {
    await db.update(users)
      .set({
        monthlySearchCount: sql`${users.monthlySearchCount} + 1`,
        lastMonthlySearchDate: new Date()
      })
      .where(eq(users.id, userId));
  }

  async createNote(insertNote: InsertNote & { userId: string }): Promise<Note> {
    const [note] = await db.insert(notes).values(insertNote).returning();
    return note;
  }

  async getNote(id: string): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note;
  }

  async getAllNotes(userId: string): Promise<Note[]> {
    return await db.select().from(notes).where(eq(notes.userId, userId)).orderBy(notes.createdAt);
  }

  async deleteNote(id: string, userId: string): Promise<void> {
    // Verify ownership before deleting
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    if (note && note.userId === userId) {
      // Manual cascade delete

      // Delete summaries
      await db.delete(summaries).where(eq(summaries.noteId, id));

      // Get related quizzes to delete their children (questions, attempts)
      const noteQuizzes = await db.select().from(quizzes).where(eq(quizzes.noteId, id));
      for (const quiz of noteQuizzes) {
        // Delete attempts
        await db.delete(quizAttempts).where(eq(quizAttempts.quizId, quiz.id));
        // Delete questions
        await db.delete(questions).where(eq(questions.quizId, quiz.id));
      }

      // Delete quizzes
      await db.delete(quizzes).where(eq(quizzes.noteId, id));

      // Finally delete note
      await db.delete(notes).where(eq(notes.id, id));
    } else {
      throw new Error("Note not found or unauthorized");
    }
  }

  async updateUserTier(userId: string, tier: string): Promise<void> {
    await db.update(users)
      .set({ subscriptionTier: tier, subscriptionExpiresAt: null })
      .where(eq(users.id, userId));
  }

  async updateUserTierWithExpiry(userId: string, tier: string, expiresAt: Date): Promise<void> {
    await db.update(users)
      .set({ subscriptionTier: tier, subscriptionExpiresAt: expiresAt })
      .where(eq(users.id, userId));
  }

  async createSummary(insertSummary: InsertSummary): Promise<Summary> {
    const [summary] = await db.insert(summaries).values(insertSummary).returning();
    return summary;
  }

  async getSummaryByNoteId(noteId: string): Promise<Summary | undefined> {
    const [summary] = await db.select().from(summaries).where(eq(summaries.noteId, noteId));
    return summary;
  }

  async deleteSummaryByNoteId(noteId: string): Promise<void> {
    await db.delete(summaries).where(eq(summaries.noteId, noteId));
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const [quiz] = await db.insert(quizzes).values(insertQuiz).returning();
    return quiz;
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async getQuizByNoteId(noteId: string): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.noteId, noteId));
    return quiz;
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    return await db.select().from(quizzes).orderBy(quizzes.createdAt);
  }

  async getAllQuizzesByUserId(userId: string): Promise<Quiz[]> {
    // Join quizzes with notes to filter by userId
    const userQuizzes = await db.select({
      id: quizzes.id,
      noteId: quizzes.noteId,
      title: quizzes.title,
      createdAt: quizzes.createdAt,
    })
      .from(quizzes)
      .innerJoin(notes, eq(quizzes.noteId, notes.id))
      .where(eq(notes.userId, userId))
      .orderBy(quizzes.createdAt);

    return userQuizzes;
  }

  async getAllQuizzesByNoteId(noteId: string): Promise<Quiz[]> {
    return await db.select().from(quizzes).where(eq(quizzes.noteId, noteId)).orderBy(quizzes.createdAt);
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db.insert(questions).values(insertQuestion).returning();
    return question;
  }

  async getQuestionsByQuizId(quizId: string): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.quizId, quizId));
  }

  async createQuizAttempt(insertAttempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [attempt] = await db.insert(quizAttempts).values(insertAttempt).returning();
    return attempt;
  }

  async getQuizAttemptsByQuizId(quizId: string): Promise<QuizAttempt[]> {
    return await db.select().from(quizAttempts).where(eq(quizAttempts.quizId, quizId)).orderBy(quizAttempts.createdAt);
  }

  async createCanaChat(chat: InsertCanaChat): Promise<CanaChat> {
    const [newChat] = await db.insert(canaChats).values(chat).returning();
    return newChat;
  }

  async getCanaChatsByUserId(userId: string): Promise<CanaChat[]> {
    return await db.select().from(canaChats).where(eq(canaChats.userId, userId)).orderBy(sql`${canaChats.updatedAt} DESC`);
  }

  async getCanaChat(id: string): Promise<CanaChat | undefined> {
    const [chat] = await db.select().from(canaChats).where(eq(canaChats.id, id));
    return chat;
  }

  async updateCanaChatMessages(id: string, messages: any[]): Promise<CanaChat> {
    const [updatedChat] = await db
      .update(canaChats)
      .set({ messages, updatedAt: new Date() })
      .where(eq(canaChats.id, id))
      .returning();
    return updatedChat;
  }

  async logUsage(log: InsertUsageLog): Promise<void> {
    try {
      await db.insert(usageLogs).values(log);
    } catch (err) {
      console.error("Failed to log usage:", err);
      // Don't throw, just log error so main flow isn't interrupted
    }
  }

  async registerActiveSession(userId: string, deviceId: string, sessionId: string, userAgent: string | null): Promise<void> {
    const existing = await db.select().from(userActiveSessions).where(
      sql`${userActiveSessions.userId} = ${userId} AND ${userActiveSessions.deviceId} = ${deviceId}`
    );
    if (existing.length > 0) {
      await db.update(userActiveSessions)
        .set({ sessionId, userAgent, createdAt: new Date() })
        .where(eq(userActiveSessions.id, existing[0].id));
    } else {
      await db.insert(userActiveSessions).values({
        userId,
        deviceId,
        sessionId,
        userAgent
      });
    }
  }

  async getActiveSessions(userId: string): Promise<UserActiveSession[]> {
    const allSessions = await db.select().from(userActiveSessions).where(eq(userActiveSessions.userId, userId));
    
    if (allSessions.length === 0) return [];
    
    // Filter down to valid sessions in the session store
    const validSids = await db.select({ sid: session.sid }).from(session).where(
      sql`sid IN ${allSessions.map(s => s.sessionId)}`
    );
    
    const validSidSet = new Set(validSids.map(s => s.sid));
    const active = allSessions.filter(s => validSidSet.has(s.sessionId));
    
    const staleSessionIds = allSessions
      .filter(s => !validSidSet.has(s.sessionId))
      .map(s => s.sessionId);
      
    if (staleSessionIds.length > 0) {
      db.delete(userActiveSessions)
        .where(sql`session_id IN ${staleSessionIds}`)
        .catch(err => console.error("Failed to clean up stale sessions:", err));
    }
    
    return active;
  }

  async deleteActiveSessionBySessionId(sessionId: string): Promise<void> {
    await db.delete(userActiveSessions).where(eq(userActiveSessions.sessionId, sessionId));
  }

  // --- Exam & Study Plan Implementations ---
  async createExam(exam: InsertExam): Promise<Exam> {
    const [created] = await db.insert(exams).values(exam).returning();
    return created;
  }

  async getExamsByUserId(userId: string): Promise<Exam[]> {
    return await db.select().from(exams).where(eq(exams.userId, userId)).orderBy(desc(exams.createdAt));
  }

  async getExam(id: string): Promise<Exam | undefined> {
    const [exam] = await db.select().from(exams).where(eq(exams.id, id));
    return exam;
  }

  async deleteExam(id: string, userId: string): Promise<void> {
    const plans = await db.select().from(studyPlans).where(and(eq(studyPlans.examId, id), eq(studyPlans.userId, userId)));
    for (const plan of plans) {
      await db.delete(studyTasks).where(eq(studyTasks.planId, plan.id));
    }
    await db.delete(studyPlans).where(and(eq(studyPlans.examId, id), eq(studyPlans.userId, userId)));
    await db.delete(exams).where(and(eq(exams.id, id), eq(exams.userId, userId)));
  }

  async createStudyPlan(plan: InsertStudyPlan): Promise<StudyPlan> {
    const [created] = await db.insert(studyPlans).values(plan).returning();
    return created;
  }

  async getStudyPlanByExamId(examId: string): Promise<StudyPlan | undefined> {
    const [plan] = await db.select().from(studyPlans).where(eq(studyPlans.examId, examId)).orderBy(desc(studyPlans.createdAt));
    return plan;
  }

  async getStudyPlansByUserId(userId: string): Promise<StudyPlan[]> {
    return await db.select().from(studyPlans).where(eq(studyPlans.userId, userId)).orderBy(desc(studyPlans.createdAt));
  }

  async updateStudyPlan(id: string, updates: Partial<StudyPlan>): Promise<StudyPlan | undefined> {
    const [updated] = await db.update(studyPlans).set({ ...updates, updatedAt: new Date() }).where(eq(studyPlans.id, id)).returning();
    return updated;
  }

  async createStudyTasks(tasksToInsert: InsertStudyTask[]): Promise<StudyTask[]> {
    if (tasksToInsert.length === 0) return [];
    return await db.insert(studyTasks).values(tasksToInsert).returning();
  }

  async getStudyTasksByPlanId(planId: string): Promise<StudyTask[]> {
    return await db.select().from(studyTasks).where(eq(studyTasks.planId, planId)).orderBy(studyTasks.targetDate);
  }

  async getStudyTasksByUserId(userId: string): Promise<StudyTask[]> {
    return await db.select().from(studyTasks).where(eq(studyTasks.userId, userId)).orderBy(studyTasks.targetDate);
  }

  async updateStudyTask(id: string, userId: string, updates: Partial<StudyTask>): Promise<StudyTask | undefined> {
    const [updated] = await db.update(studyTasks)
      .set(updates)
      .where(and(eq(studyTasks.id, id), eq(studyTasks.userId, userId)))
      .returning();
    return updated;
  }

  async deleteStudyTasksByPlanId(planId: string): Promise<void> {
    await db.delete(studyTasks).where(eq(studyTasks.planId, planId));
  }

  // --- Weakness Tracking & Mastery Implementations ---
  async recordTopicMastery(mastery: InsertTopicMastery): Promise<TopicMastery> {
    const [created] = await db.insert(topicMastery).values(mastery).returning();
    return created;
  }

  async getTopicMasteriesByUserId(userId: string): Promise<TopicMastery[]> {
    return await db.select().from(topicMastery).where(eq(topicMastery.userId, userId)).orderBy(topicMastery.scorePct);
  }

  async updateTopicMastery(userId: string, subject: string, topic: string, scorePct: number): Promise<TopicMastery> {
    const status = scorePct < 60 ? "weak" : scorePct < 85 ? "moderate" : "mastered";
    const existing = await db.select().from(topicMastery).where(
      and(
        eq(topicMastery.userId, userId),
        eq(topicMastery.subject, subject),
        eq(topicMastery.topic, topic)
      )
    );

    if (existing.length > 0) {
      const current = existing[0];
      const newAttempts = current.totalAttempts + 1;
      // Exponential moving average score
      const updatedScore = Math.round((current.scorePct * 0.4) + (scorePct * 0.6));
      const [updated] = await db.update(topicMastery)
        .set({
          scorePct: updatedScore,
          totalAttempts: newAttempts,
          status: updatedScore < 60 ? "weak" : updatedScore < 85 ? "moderate" : "mastered",
          lastTestedAt: new Date()
        })
        .where(eq(topicMastery.id, current.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(topicMastery).values({
        userId,
        subject,
        topic,
        scorePct,
        totalAttempts: 1,
        status,
        lastTestedAt: new Date()
      }).returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();

