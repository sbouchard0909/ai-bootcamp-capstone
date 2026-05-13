import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!name || !email || !password) {
      setError('name, email and password are required');
      return;
    }

    if (!validEmail(email)) {
      setError('email format is invalid');
      return;
    }

    if (password.length < 8) {
      setError('password must be at least 8 characters');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await register(email, password, name);
      navigate('/dashboard');
    } catch (_err) {
      setError('Unable to register with provided details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form className="w-full max-w-md bg-white p-6 rounded shadow" onSubmit={onSubmit} noValidate>
        <h1 className="text-2xl font-semibold mb-4">Register</h1>

        {error && <p role="alert" className="text-red-600 mb-3">{error}</p>}

        <label className="block mb-2" htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded p-2 mb-4"
        />

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

        <p className="text-sm mb-4">Password strength: {password.length >= 8 ? 'Strong' : 'Weak'}</p>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
        >
          {submitting ? 'Creating account...' : 'Create account'}
        </button>

        <p className="mt-4 text-sm">
          Already have an account? <Link className="text-blue-600" to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
