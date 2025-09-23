
"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import admin from "firebase-admin";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";


interface Interview {
  id: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt: string;
}
interface Feedback {
  id: string;
}

interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId?: string;
  limit?: number;
}



export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;
  try {
    const formattedTranscript = transcript.map((s) => `- ${s.role}: ${s.content}\n`).join("");
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001"),
      schema: feedbackSchema,
      prompt: `You are an AI interviewer... Transcript: ${formattedTranscript} Please score...`,
      system: "You are a professional interviewer...",
    });
    const feedback = {
      interviewId, userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };
    let feedbackRef;
    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }
    await feedbackRef.set(feedback);
    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interviewDoc = await db.collection("interviews").doc(id).get();
  if (!interviewDoc.exists) return null;
  return { id: interviewDoc.id, ...interviewDoc.data() } as Interview;
}

export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
  const { interviewId, userId } = params;
  const snapshot = await db.collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1).get();
  if (snapshot.empty) return null;
  const feedbackDoc = snapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[]> {
  const { userId, limit = 20 } = params;
  let query: admin.firestore.Query = db.collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .limit(limit);
  if (userId) {
    query = query.where("userId", "!=", userId);
  }
  const interviewsSnapshot = await query.get();
  if (interviewsSnapshot.empty) return [];
  return interviewsSnapshot.docs.map((doc: admin.firestore.DocumentData) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(userId: string): Promise<Interview[]> {
  const interviewsSnapshot = await db.collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc").get();
  if (interviewsSnapshot.empty) return [];
  return interviewsSnapshot.docs.map((doc: admin.firestore.DocumentData) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}