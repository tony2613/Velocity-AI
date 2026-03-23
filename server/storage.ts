


import {
  type User,
  type InsertUser,
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
  users, notes, summaries, quizzes, questions, quizAttempts, usageLogs, type InsertUsageLog
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  setPasswordResetToken(userId: string, token: string, expiry: Date): Promise<void>;
  updateUserPassword(userId: string, password: string): Promise<void>;
  createUser(user: InsertUser): Promise<User>;
  resetDailyUsage(userId: string): Promise<void>;
  incrementDailyUsage(userId: string): Promise<void>;
  resetDailySearch(userId: string): Promise<void>;
  incrementDailySearch(userId: string): Promise<void>;

  createNote(note: InsertNote & { userId: string }): Promise<Note>;
  getNote(id: string): Promise<Note | undefined>;
  getAllNotes(userId: string): Promise<Note[]>;
  deleteNote(id: string, userId: string): Promise<void>;
  updateUserTier(userId: string, tier: string): Promise<void>;
  updateUserTierWithExpiry(userId: string, tier: string, expiresAt: Date): Promise<void>;

  createSummary(summary: InsertSummary): Promise<Summary>;
  getSummaryByNoteId(noteId: string): Promise<Summary | undefined>;

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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async resetDailyUsage(userId: string): Promise<void> {
    await db.update(users)
      .set({ dailyUploadCount: 0, lastUploadDate: new Date() })
      .where(eq(users.id, userId));
  }

  async incrementDailyUsage(userId: string): Promise<void> {
    // We need to fetch current count to increment safely or use sql operator if supported by driver
    // Drizzle with PG supports sql increment
    await db.update(users)
      .set({
        dailyUploadCount: sql`${users.dailyUploadCount} + 1`,
        lastUploadDate: new Date()
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

  async logUsage(log: InsertUsageLog): Promise<void> {
    try {
      await db.insert(usageLogs).values(log);
    } catch (err) {
      console.error("Failed to log usage:", err);
      // Don't throw, just log error so main flow isn't interrupted
    }
  }
}

export const storage = new DatabaseStorage();
