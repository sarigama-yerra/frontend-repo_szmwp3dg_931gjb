import { useState } from "react";

export default function Auth({ onAuthenticated, backendUrl }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      onAuthenticated(data.access_token);
    } catch (e) {
      setError("Login failed");
    } finally { setLoading(false); }
  };

  const signup = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${backendUrl}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      onAuthenticated(data.access_token);
    } catch (e) {
      setError("Sign up failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8 space-y-6">
        <h1 className="text-2xl font-bold text-slate-800 text-center">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {mode === "signup" && (
          <div>
            <label className="block text-sm mb-1 text-slate-700">Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring" placeholder="Your name"/>
          </div>
        )}
        <div>
          <label className="block text-sm mb-1 text-slate-700">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring" placeholder="you@example.com"/>
        </div>
        <div>
          <label className="block text-sm mb-1 text-slate-700">Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring" placeholder="••••••••"/>
        </div>
        <button disabled={loading} onClick={mode === "login" ? login : signup} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition">
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign up"}
        </button>
        <p className="text-center text-sm text-slate-600">
          {mode === "login" ? (
            <>No account? <button className="text-blue-600" onClick={()=>setMode("signup")}>
              Sign up
            </button></>
          ) : (
            <>Have an account? <button className="text-blue-600" onClick={()=>setMode("login")}>
              Login
            </button></>
          )}
        </p>
      </div>
    </div>
  );
}
