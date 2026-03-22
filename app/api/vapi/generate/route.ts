

// // // app/api/vapi/generate/route.ts

// // app/api/vapi/generate/route.ts

// // app/api/vapi/generate/route.ts

// import { revalidatePath } from "next/cache";
// import { generateText } from "ai";
// import { google } from "@ai-sdk/google";
// import { db } from "@/firebase/admin";
// import { getRandomInterviewCover } from "@/lib/utils";

// export async function POST(request: Request) {
//   const { type, role, level, techstack, amount, userid } = await request.json();

//   if (!userid) {
//     return Response.json({ success: false, error: "User ID is required" }, { status: 401 });
//   }

//   try {
//     const { text: questions } = await generateText({
//      model: google("models/gemini-1.5-flash"),
//       prompt: `Generate ${amount} interview questions for a ${level} level ${role} position.
      
//       Tech stack: ${techstack}
//       Interview type: ${type}
      
//       Requirements:
//       - Questions should be appropriate for ${level} level
//       - Focus on ${type} aspects
//       - Include questions about: ${techstack}
//       - Return ONLY a JSON array of questions
//       - No additional text or formatting
      
//       Example format: ["Question 1", "Question 2", "Question 3"]
      
//       Generate exactly ${amount} questions.`
//     });

//     // Clean the response to extract JSON from markdown code blocks
//     const cleanedQuestions = questions.replace(/```json\s*|```\s*/g, '').trim();
    
//     const interview = {
//       role, 
//       type, 
//       level, 
//       userId: userid,
//       techstack: techstack.split(",").map((tech: string) => tech.trim()),
//       questions: JSON.parse(cleanedQuestions),
//       finalized: true,
//       coverImage: getRandomInterviewCover(),
//       createdAt: new Date().toISOString(),
//     };

//     const docRef = await db.collection("interviews").add(interview);
//     revalidatePath("/");
    
//     return Response.json({ 
//       success: true, 
//       interviewId: docRef.id 
//     }, { status: 200 });

//   } catch (error) {
//     console.error("Error:", error);
//     return Response.json({ success: false, error: "Failed to generate interview." }, { status: 500 });
//   }
// }



import { revalidatePath } from "next/cache";
import Groq from "groq-sdk"; 
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

// Initialize Groq with your key
const groq = new Groq({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { type, role, level, techstack, amount, userid } = await request.json();

    if (!userid) {
      return Response.json({ success: false, error: "User ID is required" }, { status: 401 });
    }

    console.log("Using Groq Llama-3 for lightning fast generation...");

    // Groq API Call
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional technical interviewer. Return ONLY a valid JSON array of strings containing interview questions. No markdown, no backticks, no extra text."
        },
        {
          role: "user",
          content: `Generate exactly ${amount} interview questions for a ${level} level ${role} position. 
          Tech stack: ${techstack}. 
          Interview type: ${type}.
          Return format: ["Question 1", "Question 2"]`
        }
      ],
      model: "llama-3.1-8b-instant", // Fast, free and reliable model
      temperature: 0.7,
      stream: false,
      // Force JSON output
      response_format: { type: "json_object" }
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || "[]";
    
    // Parse JSON
    let parsedData = JSON.parse(responseContent);
    
    // Groq sometimes wraps array in an object, let's extract it
    let questionsArray = Array.isArray(parsedData) 
      ? parsedData 
      : (parsedData.questions || Object.values(parsedData)[0]);

    if (!Array.isArray(questionsArray)) {
      questionsArray = [responseContent];
    }

    // Prepare Firebase Document
    const interview = {
      role: role || "Software Engineer",
      type: type || "Technical",
      level: level || "Junior",
      userId: userid,
      techstack: techstack ? techstack.split(",").map((t: string) => t.trim()) : [],
      questions: questionsArray,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore
    const docRef = await db.collection("interviews").add(interview);
    
    // Refresh the path
    revalidatePath("/");
    
    return Response.json({ 
      success: true, 
      interviewId: docRef.id 
    }, { status: 200 });

  } catch (error: any) {
    console.error("GROQ GENERATION ERROR:", error.message);
    return Response.json({ 
      success: false, 
      error: error.message || "Failed to generate interview." 
    }, { status: 500 });
  }
}