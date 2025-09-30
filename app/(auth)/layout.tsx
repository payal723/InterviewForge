import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";

const AuthLayout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  console.log("Auth Layout - User authenticated:", isUserAuthenticated);
  
  if (isUserAuthenticated) {
    console.log("Redirecting to home page");
    redirect("/");
  }

  return <div className="auth-layout">{children}</div>;
};

export default AuthLayout;
