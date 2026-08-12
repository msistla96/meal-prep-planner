import { FormEvent, useState } from "react";
import { useApp } from "../state/AppContext";
import { AppLink, useRouter } from "../state/RouterContext";

export function LoginPage() {
  const { isAuthenticated, authError, login } = useApp();
  const { navigate } = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  if (isAuthenticated) navigate("/");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const ok = await login(name, password);
    if (ok) navigate("/");
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="brand large">
          <span className="brand-mark">MP</span>
          <div>
            <strong>Meal Prep</strong>
            <span>Planner</span>
          </div>
        </div>
        <h1 id="login-title">Sign in</h1>
        <form onSubmit={submit} className="form-stack">
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {authError ? <p className="form-error">{authError}</p> : null}
          <button className="primary-button" type="submit" disabled={!name || !password}>
            Continue
          </button>
        </form>
        <p className="auth-switch">
          New to Meal Prep Planner? <AppLink to="/signup">Create an account</AppLink>
        </p>
      </section>
    </main>
  );
}
