
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
  userId?: string;
  attendedBy?: { [userId: string]: boolean };
  lastAttendedAt?: string;
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
  
  console.log("Creating feedback with params:", { interviewId, userId, transcriptLength: transcript.length });
  
  try {
    if (!transcript || transcript.length === 0) {
      throw new Error("No transcript data provided");
    }

    const formattedTranscript = transcript.map((s) => `- ${s.role}: ${s.content}\n`).join("");
    
    console.log("Generating AI feedback...");
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001"),
      schema: feedbackSchema,
      prompt: `You are an AI interviewer analyzing this interview transcript. Please provide detailed feedback and scoring.
      
      Transcript: ${formattedTranscript}
      
      Please score the candidate on a scale of 1-10 for each category and provide constructive feedback.`,
      system: "You are a professional interviewer providing constructive feedback to help candidates improve.",
    });
    
    const feedback = {
      interviewId, 
      userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      transcript: transcript,
      createdAt: new Date().toISOString(),
    };
    
    let feedbackRef;
    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }
    
    console.log("Saving feedback to Firebase...");
    await feedbackRef.set(feedback);
    
    // Mark interview as attended by this user
    const interviewRef = db.collection("interviews").doc(interviewId);
    await interviewRef.update({
      [`attendedBy.${userId}`]: true,
      lastAttendedAt: new Date().toISOString()
    });
    
    console.log("Feedback saved successfully with ID:", feedbackRef.id);
    return { success: true, feedbackId: feedbackRef.id };
    
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
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
  
  try {
    // Auto cleanup old interviews (15+ days)
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    
    const oldInterviewsSnapshot = await db.collection("interviews")
      .where("createdAt", "<", fifteenDaysAgo.toISOString())
      .limit(10)
      .get();
    
    if (!oldInterviewsSnapshot.empty) {
      const batch = db.batch();
      oldInterviewsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }
    
    // Get current interviews
    const interviewsSnapshot = await db.collection("interviews")
      .where("finalized", "==", true)
      .where("createdAt", ">=", fifteenDaysAgo.toISOString())
      .limit(limit)
      .get();
    
    if (interviewsSnapshot.empty) {
      // Return dummy data if no interviews found
      return [];
    }
    
    let interviews = interviewsSnapshot.docs.map((doc: admin.firestore.DocumentData) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
    
    // Filter out user's own interviews and interviews already attended by user
    if (userId && userId.trim() !== '') {
      interviews = interviews.filter(interview => {
        // Exclude user's own interviews
        if (interview.userId === userId) return false;
        
        // Exclude interviews already attended by this user
        if (interview.attendedBy && interview.attendedBy[userId]) return false;
        
        return true;
      });
    }
    
    return interviews.slice(0, limit);
  } catch (error) {
    console.error("Error fetching latest interviews:", error);
    // Return empty array on error to prevent app crash
    return [];
  }
}

export async function getInterviewsByUserId(userId: string): Promise<Interview[]> {
  if (!userId || userId.trim() === '') {
    console.warn("getInterviewsByUserId called with invalid userId:", userId);
    return [];
  }
  
  try {
    const interviewsSnapshot = await db.collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc").get();
    
    if (interviewsSnapshot.empty) return [];
    
    return interviewsSnapshot.docs.map((doc: admin.firestore.DocumentData) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error("Error fetching user interviews:", error);
    return [];
  }
}