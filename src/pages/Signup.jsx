import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/primitives/Card';
import { Button } from '../components/primitives/Button';
import { Input } from '../components/primitives/Input';
import { Label } from '../components/primitives/Label';
import { ThemeToggle } from '../components/ThemeToggle';
import { UserPlus, Mail, Lock, Building2, User } from 'lucide-react';

export function Signup() {
  const [step, setStep] = useState('register'); // 'register' or 'otp'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    firstName: '',
    lastName: '',
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // First request OTP
      await authAPI.requestOTP(formData.email);
      setStep('otp');
    } catch (err) {
      setError(err.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify OTP
      await authAPI.verifyOTP(formData.email, otp);

      // Register user
      const response = await authAPI.register({
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
        },
      });

      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-lg)',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 'var(--spacing-lg)', right: 'var(--spacing-lg)' }}>
        <ThemeToggle />
      </div>

      <Card style={{ width: '100%', maxWidth: '480px' }}>
        <CardHeader style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            margin: '0 auto var(--spacing-md)',
            borderRadius: '50%',
            background: 'var(--purple-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <UserPlus size={32} color="white" />
          </div>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Join RAG Transformer Platform
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div style={{
              padding: 'var(--spacing-md)',
              marginBottom: 'var(--spacing-lg)',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: 'var(--border-radius-md)',
              color: '#c00',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          {step === 'register' ? (
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <Label htmlFor="companyName">
                  <Building2 size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Company Name
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="Acme Inc"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <Label htmlFor="email">
                  <Mail size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <Label htmlFor="password">
                  <Lock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button
                type="submit"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Continue'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister}>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <Label>Email</Label>
                <div style={{
                  padding: 'var(--spacing-md)',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '0.875rem',
                }}>
                  {formData.email}
                </div>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  style={{ letterSpacing: '0.5em', fontSize: '1.25rem', textAlign: 'center' }}
                />
                <p style={{
                  marginTop: 'var(--spacing-sm)',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                }}>
                  Check console for development OTP
                </p>
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <Button
                  type="button"
                  variant="outline"
                  style={{ flex: 1 }}
                  onClick={() => setStep('register')}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: 'var(--purple-600)', textDecoration: 'none', fontWeight: '500' }}
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
