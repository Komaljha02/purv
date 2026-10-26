
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { LockKeyhole, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) throw loginError;

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (adminError) throw adminError;

      if (!admin) {
        await supabase.auth.signOut();
        throw new Error("This account is not authorized to manage Purv.");
      }

      navigate("/admin/products", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf5] px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-[#f0e3d9] bg-white p-7 shadow-xl sm:p-9">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-[#76233a]"
        >
          <ArrowLeft size={16} />
          Back to store
        </Link>

        <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#76233a] text-white">
          <LockKeyhole size={26} />
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#b45324]">
          Private access
        </p>

        <h1 className="mt-2 font-serif text-3xl font-bold text-[#421521]">
          Welcome back
        </h1>

        <p className="mt-2 text-sm leading-6 text-stone-500">
          Sign in to manage Purv products, prices and photos.
        </p>

        <form onSubmit={handleLogin} className="mt-7 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700">
              Email address
            </label>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your admin email"
              className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-[#76233a] focus:ring-2 focus:ring-[#76233a]/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700">
              Password
            </label>

            <div className="flex items-center rounded-xl border border-stone-200 pr-3 focus-within:border-[#76233a]">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="min-w-0 flex-1 rounded-xl px-4 py-3 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-stone-500 hover:text-[#76233a]"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#76233a] px-4 py-3.5 font-semibold text-white transition hover:bg-[#421521] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in securely"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-stone-400">
          Authorized store management only.
        </p>
      </section>
    </main>
  );
}
