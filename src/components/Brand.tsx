import { useUniversity } from "@/hooks/useUniversity";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Standard brand mark: **SHORT_NAME** unadmitted
 * — community name bold + uppercase, "unadmitted" always lowercase.
 */
export const Brand = ({ className = "" }: { className?: string }) => {
  const uni = useUniversity();
  const { community, hostCommunity } = useAuth();
  const short =
    uni?.short_name ??
    community?.short_name ??
    hostCommunity?.short_name ??
    "";
  return (
    <span className={`preserve-case ${className}`}>
      {short && (
        <span className="font-bold uppercase tracking-tight">{short} </span>
      )}
      <span className="lowercase">unadmitted</span>
    </span>
  );
};
