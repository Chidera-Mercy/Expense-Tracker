import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../AuthContext';
import * as Yup from 'yup';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signInUser } = UserAuth();
  const navigate = useNavigate();

  // Create validation schema with Yup
  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      await validationSchema.validate(formData, { abortEarly: false });
      
      // Reset validation errors
      setValidationErrors({});

      // Call signInUser and get the result
      const result = await signInUser(formData.email, formData.password);

      if (!result.success) {
        setError(result.error);
      } else {
        // On successful login, navigate to home
        navigate("/home");
      }      
      
    } catch (err) {
      console.error('Signin error:', err);
      if (err.name === 'ValidationError') {
        // Handle Yup validation errors
        const errors = {};
        err.inner.forEach(error => {
          errors[error.path] = error.message;
        });
        setValidationErrors(errors);
      } else {
        // Handle other errors
        setError(err.message || 'Something went wrong during sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Display validation errors
  const getErrorMessage = (field) => {
    return validationErrors[field] ? (
      <p className="text-red-500 text-sm mt-1">{validationErrors[field]}</p>
    ) : null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-emerald-800">
      <div className="flex justify-center items-center p-6">
        <div className="text-4xl font-bold text-white">PennyPath</div>
      </div>
      
      <div className="flex flex-col flex-1 items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-emerald-800 mb-2">Welcome back!</h2>
            <p className="text-gray-600">Log in to your PennyPath account</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full p-3 border ${validationErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                placeholder="you@example.com"
              />
              {getErrorMessage('email')}
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-gray-700 text-sm font-medium">
                  Password
                </label>
                <a href="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full p-3 border ${validationErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                placeholder="Enter your password"
              />
              {getErrorMessage('password')}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-600 transition-colors disabled:bg-emerald-300"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Sign up
            </a>
          </div>

          <div className="mt-6 text-xs text-center text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;