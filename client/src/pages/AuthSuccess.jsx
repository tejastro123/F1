import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Card } from '../components/ui.jsx';

export default function AuthSuccess() {
  const navigate = useNavigate();
  // We trigger a re-render of AuthContext. It will automatically call `/auth/refresh` 
  // and load the `user` object because the Express server just set an HttpOnly cookie!
  
  useEffect(() => {
    // Wait briefly to ensure the cookie is fully committed by the browser
    const timer = setTimeout(() => {
      // Hard refresh to trigger AuthContext's on-mount useEffect to hit `/auth/me`
      window.location.href = '/'; 
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen pt-32 px-4 flex items-center justify-center relative z-10">
      <Card className="max-w-md w-full text-center space-y-6 animate-pulse">
        <div className="w-16 h-16 bg-f1-red/20 rounded-full flex items-center justify-center mx-auto text-f1-red text-2xl">
          🏎
        </div>
        <h2 className="text-2xl font-bold font-f1 uppercase tracking-wider text-white">
          Authenticating...
        </h2>
        <p className="text-gray-400">
          Securely connecting to the F1 Global Network. You will be redirected momentarily.
        </p>
      </Card>
    </div>
  );
}
