import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import GameCanvas from "@/components/GameCanvas";

/** Design reminder: preserve the playful space-learning experience when this route is used directly. */
export default function Home() {
  // The useAuth hook provides authentication state.
  // To implement login/logout, call logout(), or start login from an event
  // handler: onClick={() => startLogin()} (imported from "@/const"). Never call
  // startLogin() during render (no href={startLogin()}) — it mints a one-time
  // nonce cookie and must run only at the moment of navigation.
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  return <GameCanvas />;
}
