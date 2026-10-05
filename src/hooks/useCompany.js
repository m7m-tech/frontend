import { useAuth } from "../context/AuthContext";
import { readCompanyId, readCompanyProfile } from "../services/companyService";
import useResource from "./useResource";

// companyId normally comes from AuthContext's cache. If it's missing (e.g. a
// session restored from storage before it was ever cached), ask AuthContext's
// own fetchCurrentUser once — it re-caches the id as a side effect.
export default function useCompany() {
  const { user, isAuthenticated, fetchCurrentUser } = useAuth();
  const companyId = readCompanyId(user);

  const resolver = useResource(
    isAuthenticated && !companyId ? `company:resolve:${user?.id || user?.email || "me"}` : null,
    () => fetchCurrentUser(),
    { staleTime: Infinity }
  );

  return {
    companyId,
    profile: readCompanyProfile(user),
    isResolving: !companyId && resolver.isLoading,
  };
}
