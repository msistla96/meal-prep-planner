import { FormEvent, useState } from "react";
import { useApp } from "../state/AppContext";
import { AppLink, useRouter } from "../state/RouterContext";

export function SignupPage() {
  const { isAuthenticated, signup } = useApp();
  const { navigate } = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isAuthenticated) navigate("/");

  function submit(event: FormEvent) {
    event.preventDefault();
    signup(name);
    navigate("/profile");
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="signup-title">
        <div className="brand large">
          <span className="brand-mark">MP</span>
          <div>
            <strong>Meal Prep</strong>
            <span>Planner</span>
          </div>
        </div>
        <h1 id="signup-title">Create account</h1>
        <form onSubmit={submit} className="form-stack">
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button className="primary-button" type="submit" disabled={!name || !email || !password}>
            Sign up
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <AppLink to="/login">Sign in</AppLink>
        </p>
      </section>
    </main>
  );
}
