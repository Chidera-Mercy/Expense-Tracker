import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowRight, HiX, HiCamera } from 'react-icons/hi';
import * as Yup from 'yup';
import { UserAuth } from '../AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar_url: null
  });
  
  // State for image preview
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const [validationErrors, setValidationErrors] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUpNewUser } = UserAuth();
  const navigate = useNavigate();

  // Create validation schema with Yup
  const validationSchema = Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
    avatar_url: Yup.mixed()
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Store the file in the form data
    setFormData((prevState) => ({
      ...prevState,
      avatar_url: file
    }));
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prevState) => ({
      ...prevState,
      avatar_url: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open file dialog when clicking on the avatar circle
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Validate form
      await validationSchema.validate(formData, { abortEarly: false });
      
      // Reset validation errors
      setValidationErrors({});

      // Call context function with the file object
      const { success, error, data } = await signUpNewUser(
        formData.firstName, 
        formData.lastName, 
        formData.email, 
        formData.password, 
        formData.avatar_url
      );
      
      if (!success) {
        setError(error || "Registration failed. Please try again.");
      } else {
        navigate("/home");
      }      
    } catch (err) {
      console.error('Signup error:', err);
      if (err.name === 'ValidationError') {
        // Handle Yup validation errors
        const errors = {};
        err.inner.forEach(error => {
          errors[error.path] = error.message;
        });
        setValidationErrors(errors);
      } else {
        // Handle other errors
        setError(err.message || 'Something went wrong during signup.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-emerald-800">
      <div className="flex justify-center items-center p-6">
        <div className="text-4xl font-bold text-white">PennyPath</div>
      </div>
      
      <div className="flex flex-col flex-1 items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-emerald-800 mb-2">
              Welcome to PennyPath!
            </h2>
            <p className="text-gray-600">
              Start tracking your finances today
            </p>
          </div>
          
          {/* Avatar Upload UI */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div 
                onClick={handleAvatarClick}
                className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-emerald-500"
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <HiCamera className="text-gray-400 text-2xl" />
                )}
              </div>
              
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md"
                >
                  <HiX className="text-sm" />
                </button>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                id="avatar_url"
                name="avatar_url"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <p className="text-center text-sm text-gray-500 mt-2">
                Profile Picture
              </p>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2">
                <label htmlFor="firstName" className="block text-gray-700 text-sm font-medium mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${validationErrors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                  placeholder="John"
                />
                {validationErrors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
                )}
              </div>
              <div className="w-1/2">
                <label htmlFor="lastName" className="block text-gray-700 text-sm font-medium mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${validationErrors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                  placeholder="Doe"
                />
                {validationErrors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
                )}
              </div>
            </div>
            
            <div>
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
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full p-3 border ${validationErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                placeholder="Create a password"
              />
              {validationErrors.password && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full p-3 border ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                placeholder="Confirm your password"
              />
              {validationErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:bg-emerald-300"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
              <HiArrowRight />
            </button>
          </form>
          
          <div className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Log in
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

export default Signup;