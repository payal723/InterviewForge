"use client";

import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormField from "./FormField";

const interviewSchema = z.object({
  role: z.string().min(1, "Job role is required"),
  level: z.enum(["Junior", "Mid", "Senior"], {
    required_error: "Experience level is required",
  }),
  type: z.enum(["Technical", "Behavioral", "Mixed"], {
    required_error: "Interview type is required",
  }),
  techstack: z.string().min(1, "Tech stack is required"),
  amount: z.number().min(1).max(10, "Maximum 10 questions allowed"),
});

interface InterviewFormProps {
  userId: string;
}

const InterviewForm = ({ userId }: InterviewFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof interviewSchema>>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      role: "",
      level: "Junior",
      type: "Technical",
      techstack: "",
      amount: 5,
    },
  });

  const onSubmit = async (data: z.infer<typeof interviewSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          userid: userId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error("Failed to generate interview");
        return;
      }

      toast.success("Interview generated successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error generating interview:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-border max-w-2xl mx-auto">
      <div className="card p-8">
        <h2 className="text-2xl font-bold mb-6">Generate Interview</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="role"
              label="Job Role"
              placeholder="e.g. Frontend Developer, Data Scientist"
              type="text"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Experience Level</label>
                <select
                  {...form.register("level")}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="Junior">Junior (0-2 years)</option>
                  <option value="Mid">Mid (2-5 years)</option>
                  <option value="Senior">Senior (5+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Interview Type</label>
                <select
                  {...form.register("type")}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="Technical">Technical</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
            </div>

            <FormField
              control={form.control}
              name="techstack"
              label="Tech Stack"
              placeholder="e.g. React, Node.js, MongoDB, TypeScript"
              type="text"
            />

            <div>
              <label className="block text-sm font-medium mb-2">Number of Questions</label>
              <input
                type="number"
                min="1"
                max="10"
                {...form.register("amount", { valueAsNumber: true })}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Generating..." : "Generate Interview"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default InterviewForm;