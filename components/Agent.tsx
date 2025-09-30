"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface AgentProps {
  userName?: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "practice";
  questions?: string[];
}

interface Message {
  type: string;
  transcriptType?: string;
  role: "user" | "system" | "assistant";
  transcript: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  useEffect(() => {
    const onCallStart = () => {
      console.log("Call started successfully");
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      console.log("Call ended");
      setCallStatus(CallStatus.FINISHED);
      setIsSpeaking(false);
    };

    const onCallStarted = () => {
      console.log("Call started and connected");
      setCallStatus(CallStatus.ACTIVE);
    };

    const onMessage = (message: Message) => {
      console.log("Message received:", message);
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("Speech started");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("Speech ended");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.error("Vapi Error:", error);
      setCallStatus(CallStatus.INACTIVE);
      setIsSpeaking(false);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-started", onCallStarted);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-started", onCallStarted);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (transcriptMessages: SavedMessage[]) => {
      console.log("Generating feedback...", { interviewId, userId, messageCount: transcriptMessages.length });
      
      if (!interviewId || !userId) {
        console.error("Missing required data:", { interviewId, userId });
        router.push("/");
        return;
      }

      if (transcriptMessages.length === 0) {
        console.error("No transcript messages to save");
        router.push("/");
        return;
      }

      try {
        const { success, feedbackId: newFeedbackId } = await createFeedback({
          interviewId: interviewId,
          userId: userId,
          transcript: transcriptMessages,
          feedbackId,
        });

        if (success) {
          console.log("Feedback saved successfully:", newFeedbackId);
          router.push(`/interview/${interviewId}/feedback`);
        } else {
          console.error("Failed to save feedback.");
          router.push("/");
        }
      } catch (error) {
        console.error("Error in handleGenerateFeedback:", error);
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "practice" && messages.length > 0) {
        handleGenerateFeedback(messages);
      } else {
        router.push("/");
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    try {
      console.log("Starting VAPI call with type:", type);
      
      let formattedQuestions = "Tell me about yourself.";
      if (questions && questions.length > 0) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      console.log("Starting with interviewer config");
      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
          username: userName || "Candidate",
          userid: userId || "guest",
        },
      });
    } catch (error) {
      console.error("Failed to start call:", error);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    console.log("Manually ending call");
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="AI Interviewer"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avtar.jpg"
              alt="Your Avatar"
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={messages.length}
              className="transition-opacity duration-500 animate-fadeIn"
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75 h-full w-full bg-sky-400",
                callStatus !== CallStatus.CONNECTING && "hidden"
              )}
            />
            <span className="relative">
              {callStatus === CallStatus.CONNECTING ? "Connecting..." : "Start Interview"}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End Call
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;