import { redirect } from "next/navigation";
import InterviewForm from "@/components/InterviewForm";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <>
      <h3 className="text-center mb-8">Create New Interview</h3>
      <InterviewForm userId={user.id} />
    </>
  );
};

export default Page;
