import { LogOut, UserRound } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useApp } from "../state/AppContext";
import { AppLink, useRouter } from "../state/RouterContext";

export function SettingsPage() {
  const { logout, profile } = useApp();
  const { navigate } = useRouter();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <PageHeader title="Settings" />
      <section className="settings-list">
        <AppLink className="settings-row" to="/profile">
          <UserRound size={18} />
          <div>
            <strong>User profile</strong>
            <span>Diet preferences, cuisines, proteins</span>
          </div>
        </AppLink>
        <AppLink className="settings-row" to="/profile">
          <UserRound size={18} />
          <div>
            <strong>Personal details</strong>
            <span>{profile.name}, {profile.age}, {profile.gender}</span>
          </div>
        </AppLink>
        <button className="settings-row danger" type="button" onClick={handleLogout}>
          <LogOut size={18} />
          <div>
            <strong>Log out</strong>
            <span>End the current frontend session</span>
          </div>
        </button>
      </section>
    </>
  );
}
