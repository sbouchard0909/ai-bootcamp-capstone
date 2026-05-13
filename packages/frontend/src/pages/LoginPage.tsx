import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      setError('email and password are required');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (_err) {
      setError('Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form className="w-full max-w-md bg-white p-6 rounded shadow" onSubmit={onSubmit} noValidate>
        <h1 className="text-2xl font-semibold mb-4">Login</h1>

        {error && <p role="alert" className="text-red-600 mb-3">{error}</p>}

        <label className="block mb-2" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2 mb-4"
        />

        <label className="block mb-2" htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-2 mb-4"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
        >
          {submitting ? 'Logging in...' : 'Login'}
        </button>

        <p className="mt-4 text-sm">
          Need an account? <Link className="text-blue-600" to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
