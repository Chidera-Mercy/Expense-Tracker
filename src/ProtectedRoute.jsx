import { Navigate } from 'react-router-dom';
import { UserAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { session } = UserAuth();
  
  if (session === undefined) {
    // Still loading authentication state
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>;
  }
  
  if (session === null) {
    // Not authenticated
    return <Navigate to="/login" />;
  }

  // Authenticated
  return children;
};

export default ProtectedRoute;