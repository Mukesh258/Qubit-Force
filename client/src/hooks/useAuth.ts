import { useQuery } from "@tanstack/react-query";
import { type User as SchemaUser } from "@shared/schema";

export type User = SchemaUser;

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    user: user as User | undefined,
    isLoading,
    isAuthenticated: !!user && !error,
    isCitizen: (user as User)?.userType === "citizen",
    isAgency: (user as User)?.userType === "agency",
  };
}