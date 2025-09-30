import { db } from "@/firebase/admin";

export async function POST() {
  try {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    
    // Get interviews older than 15 days
    const oldInterviewsSnapshot = await db.collection("interviews")
      .where("createdAt", "<", fifteenDaysAgo.toISOString())
      .get();
    
    if (oldInterviewsSnapshot.empty) {
      return Response.json({ success: true, deleted: 0 });
    }
    
    const batch = db.batch();
    const interviewIds: string[] = [];
    
    // Add interviews to batch delete
    oldInterviewsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      interviewIds.push(doc.id);
    });
    
    // Delete related feedback
    for (const interviewId of interviewIds) {
      const feedbackSnapshot = await db.collection("feedback")
        .where("interviewId", "==", interviewId)
        .get();
      
      feedbackSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
    }
    
    await batch.commit();
    
    return Response.json({ 
      success: true, 
      deleted: oldInterviewsSnapshot.docs.length 
    });
    
  } catch (error) {
    console.error("Cleanup error:", error);
    return Response.json({ success: false, error: "Cleanup failed" }, { status: 500 });
  }
}