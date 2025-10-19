import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/primitives/Card';
import { Button } from '../components/primitives/Button';
import { Input } from '../components/primitives/Input';
import { Label } from '../components/primitives/Label';
import { ThemeToggle } from '../components/ThemeToggle';
import { LogIn, Mail, Lock, Shield } from 'lucide-react';

export function Login() {
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpData, setOtpData] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.requestOTP(email);
      setOtpData(response.data);
      setStep('otp');
      console.log('OTP:', response.data.otp); // For development
    } catch (err) {
      setError(err.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.verifyOTP(email, otp);
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.error || 'Invalid OTP');
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

      <Card style={{ width: '100%', maxWidth: '420px' }}>
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
            <LogIn size={32} color="white" />
          </div>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to RAG Transformer Platform
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

          {step === 'email' ? (
            <form onSubmit={handleRequestOTP}>
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <Label htmlFor="email">
                  <Mail size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <Label>Email</Label>
                <div style={{
                  padding: 'var(--spacing-md)',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '0.875rem',
                }}>
                  {email}
                </div>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <Label htmlFor="otp">
                  <Shield size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Enter OTP
                </Label>
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
                {otpData && (
                  <p style={{
                    marginTop: 'var(--spacing-sm)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                  }}>
                    OTP sent! Check console for development OTP
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <Button
                  type="button"
                  variant="outline"
                  style={{ flex: 1 }}
                  onClick={() => setStep('email')}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter style={{ textAlign: 'center', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link
              to="/signup"
              style={{ color: 'var(--purple-600)', textDecoration: 'none', fontWeight: '500' }}
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
