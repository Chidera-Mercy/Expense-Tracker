import { useState, useEffect } from 'react';
import { X, Edit, Trash2, Plus } from 'lucide-react';

const CategoryModal = ({ 
  showModal, 
  closeModal, 
  categories = [], 
  onSaveCategory, 
  onDeleteCategory,
  type = 'expense' // 'expense' or 'income'
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#10b981', // Default emerald color
    icon: 'dollar',
    is_default: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [localCategories, setLocalCategories] = useState([]);

  // Sync local categories with prop categories
  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  // Reset form when edit mode changes
  useEffect(() => {
    if (!isEditMode) {
      resetForm();
    }
  }, [isEditMode]);

  // List of available icons
  const availableIcons = [
    { value: 'dollar', label: 'Dollar' },
    { value: 'credit-card', label: 'Credit Card' },
    { value: 'briefcase', label: 'Briefcase' },
    { value: 'gift', label: 'Gift' },
    { value: 'home', label: 'Home' },
    { value: 'building', label: 'Building' },
    { value: 'heart', label: 'Heart' },
    { value: 'star', label: 'Star' },
    { value: 'chart', label: 'Chart' },
    { value: 'receipt', label: 'Receipt' },
    { value: 'rocket', label: 'Rocket' },
    { value: 'coffee', label: 'Coffee' },
    { value: 'shopping-cart', label: 'Shopping Cart' },
    { value: 'car', label: 'Car' },
    { value: 'film', label: 'Film' },
    { value: 'file-text', label: 'File Text' },
    { value: 'shopping-bag', label: 'Shopping Bag' },
    { value: 'plane', label: 'Plane' },
    { value: 'more-horizontal', label: 'More' },
    { value: 'utensils', label: 'Utensils' },
    { value: 'book', label: 'Book' },
    { value: 'music', label: 'Music' },
    { value: 'tv', label: 'TV' },
    { value: 'zap', label: 'Electricity' },
    { value: 'wifi', label: 'Internet' },
    { value: 'phone', label: 'Phone' },
    { value: 'droplet', label: 'Water' },
    { value: 'user', label: 'User' },
    { value: 'users', label: 'Users' },
    { value: 'school', label: 'Education' },
    { value: 'tag', label: 'Tag' },
    { value: 'pet', label: 'Pet' }
  ];

  // List of available colors
  const availableColors = [
    { value: '#10b981', label: 'Emerald' },   // bg-emerald-500
    { value: '#f59e0b', label: 'Amber' },     // bg-amber-500
    { value: '#8b5cf6', label: 'Violet' },    // bg-violet-500
    { value: '#84cc16', label: 'Lime' },      // bg-lime-500
    { value: '#eab308', label: 'Yellow' },    // bg-yellow-500
    { value: '#ec4899', label: 'Pink' },      // bg-pink-500
    { value: '#ef4444', label: 'Red' },       // bg-red-500
    { value: '#f97316', label: 'Orange' },    // bg-orange-500
    { value: '#a855f7', label: 'Purple' },    // bg-purple-500
    { value: '#6366f1', label: 'Indigo' },    // bg-indigo-500
    { value: '#3b82f6', label: 'Blue' },      // bg-blue-500
    { value: '#14b8a6', label: 'Teal' },      // bg-teal-500
    { value: '#06b6d4', label: 'Cyan' },      // bg-cyan-500
    { value: '#0ea5e9', label: 'Sky' },       // bg-sky-500
    { value: '#22c55e', label: 'Green' },     // bg-green-500
    { value: '#64748b', label: 'Slate' },     // bg-slate-500
    { value: '#6b7280', label: 'Gray' },      // bg-gray-500
    { value: '#71717a', label: 'Zinc' },      // bg-zinc-500
    { value: '#737373', label: 'Neutral' },   // bg-neutral-500
    { value: '#78716c', label: 'Stone' },     // bg-stone-500
    { value: '#d946ef', label: 'Fuchsia' },   // bg-fuchsia-500
    { value: '#8d5cf6', label: 'Purple' }     // bg-purple-500
  ];
  
  const resetForm = () => {
    setFormData({
      name: '',
      color: '#10b981',
      icon: 'dollar',
      is_default: false
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Category name must be 100 characters or less';
    }

    // Check for duplicate names except when editing the same category
    const isDuplicate = localCategories.some(cat => 
      cat.name.toLowerCase() === formData.name.toLowerCase() && 
      (!selectedCategory || cat.id !== selectedCategory.id)
    );
    
    if (isDuplicate) {
      newErrors.name = 'A category with this name already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      let savedCategory;
      
      if (isEditMode && selectedCategory) {
        savedCategory = await onSaveCategory({
          ...formData,
          id: selectedCategory.id
        });
        
        // Update the category in local state
        setLocalCategories(prev => 
          prev.map(cat => cat.id === selectedCategory.id ? { ...cat, ...formData } : cat)
        );
      } else {
        savedCategory = await onSaveCategory(formData);
        
        // Add the new category to local state if returned from the save function
        if (savedCategory && savedCategory.id) {
          setLocalCategories(prev => [...prev, savedCategory]);
        } else {
          // If no category was returned, we make a placeholder with the form data
          // This will be replaced once the modal is reopened, but provides immediate feedback
          const tempCategory = {
            ...formData,
            id: `temp-${Date.now()}`, // Temporary ID until reload
            created_at: new Date().toISOString()
          };
          setLocalCategories(prev => [...prev, tempCategory]);
        }
      }
      
      resetForm();
      setIsEditMode(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error(`Error saving ${type} category:`, error);
      setErrors({
        ...errors,
        form: `Failed to save category. ${error.message || 'Please try again.'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setIsEditMode(true);
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      color: category.color || '#10b981',
      icon: category.icon || 'dollar',
      is_default: category.is_default || false
    });
  };

  const handleDeleteCategory = async (category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}" \nThis will also delete all ${type === "income" ? "Income" : "Expenses and Budget"} Entries with this category?`)) {
      try {
        await onDeleteCategory(category.id);
        
        // Update local state immediately after deletion
        setLocalCategories(prev => prev.filter(cat => cat.id !== category.id));
      } catch (error) {
        console.error(`Error deleting ${type} category:`, error);
        alert(error.message || `Failed to delete category. Please try again.`);
      }
    }
  };

  const handleAddNewClick = () => {
    setIsEditMode(true);
    setSelectedCategory(null);
    resetForm();
  };

  // Function to render the icon based on the name
  const renderIcon = (iconName, color = '#10b981', size = 20) => {
    switch (iconName) {
      case 'dollar':
        return <span style={{ color }}>$</span>;
      case 'credit-card':
        return <span style={{ color }}>💳</span>;
      case 'briefcase':
        return <span style={{ color }}>💼</span>;
      case 'gift':
        return <span style={{ color }}>🎁</span>;
      case 'home':
        return <span style={{ color }}>🏠</span>;
      case 'building':
        return <span style={{ color }}>🏢</span>;
      case 'heart':
        return <span style={{ color }}>❤️</span>;
      case 'star':
        return <span style={{ color }}>⭐</span>;
      case 'chart':
        return <span style={{ color }}>📈</span>;
      case 'rocket':
        return <span style={{ color }}>🚀</span>;
      case 'receipt':
        return <span style={{ color }}>🧾</span>;
      case 'coffee':
        return <span style={{ color }}>☕</span>;
      case 'shopping-cart':
        return <span style={{ color }}>🛒</span>;
      case 'car':
        return <span style={{ color }}>🚗</span>;
      case 'film':
        return <span style={{ color }}>🎬</span>;
      case 'file-text':
        return <span style={{ color }}>📄</span>;
      case 'shopping-bag':
        return <span style={{ color }}>🛍️</span>;
      case 'plane':
        return <span style={{ color }}>✈️</span>;
      case 'more-horizontal':
        return <span style={{ color }}>⋯</span>;
      case 'utensils':
        return <span style={{ color }}>🍴</span>;
      case 'book':
        return <span style={{ color }}>📚</span>;
      case 'music':
        return <span style={{ color }}>🎵</span>;
      case 'tv':
        return <span style={{ color }}>📺</span>;
      case 'zap':
        return <span style={{ color }}>⚡</span>;
      case 'wifi':
        return <span style={{ color }}>📶</span>;
      case 'phone':
        return <span style={{ color }}>📱</span>;
      case 'droplet':
        return <span style={{ color }}>💧</span>;
      case 'user':
        return <span style={{ color }}>👤</span>;
      case 'users':
        return <span style={{ color }}>👥</span>;
      case 'school':
        return <span style={{ color }}>🎓</span>;
      case 'tag':
        return <span style={{ color }}>🏷️</span>;
      case 'pet':
        return <span style={{ color }}>🐾</span>;
      default:
        return <span style={{ color }}>$</span>;
    }
  };

  const modalTitle = type === 'income' ? 'Income Categories' : 'Expense Categories';
  const editTitle = type === 'income' ? 'Edit Income Category' : 'Edit Expense Category';

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {isEditMode ? editTitle : modalTitle}
                      </h3>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Main content area */}
                    <div className="max-h-96 overflow-y-auto">
                      {/* Form or list depending on mode */}
                      {(isEditMode) ? (
                        // Edit/Add Form
                        <form onSubmit={handleSubmit}>
                          <div className="space-y-4">
                            {/* Name field */}
                            <div>
                              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Category Name*
                              </label>
                              <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full border ${
                                  errors.name ? 'border-red-500' : 'border-gray-300'
                                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
                                placeholder={type === 'income' ? 'e.g. Salary, Freelance' : 'e.g. Groceries, Transportation'}
                              />
                              {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                              )}
                            </div>

                            {/* Color selection */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Color
                              </label>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {availableColors.map((colorOption) => (
                                  <div 
                                    key={colorOption.value}
                                    className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                                      formData.color === colorOption.value 
                                        ? 'border-gray-900' 
                                        : 'border-transparent'
                                    }`}
                                    style={{ backgroundColor: colorOption.value }}
                                    onClick={() => setFormData({...formData, color: colorOption.value})}
                                    title={colorOption.label}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Icon selection */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Icon
                              </label>
                              <div className="mt-2 flex flex-wrap gap-3">
                                {availableIcons.map((iconOption) => (
                                  <div 
                                    key={iconOption.value}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer ${
                                      formData.icon === iconOption.value 
                                        ? 'bg-gray-200 border-2 border-gray-400' 
                                        : 'hover:bg-gray-100'
                                    }`}
                                    onClick={() => setFormData({...formData, icon: iconOption.value})}
                                    title={iconOption.label}
                                  >
                                    {renderIcon(iconOption.value, formData.color, 16)}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Default category checkbox */}
                            <div className="flex items-center">
                              <input
                                id="is_default"
                                name="is_default"
                                type="checkbox"
                                checked={formData.is_default}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                              />
                              <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700">
                                Set as default category
                              </label>
                            </div>

                            {errors.form && (
                              <p className="text-sm text-red-600">{errors.form}</p>
                            )}
                          </div>
                        </form>
                      ) : (
                        // Categories List
                        <>
                          <div className="mb-4">
                            <button
                              type="button"
                              onClick={handleAddNewClick}
                              className="flex items-center text-emerald-600 hover:text-emerald-700 cursor-pointer"
                            >
                              <Plus size={16} className="mr-1" />
                              <span>Add New Category</span>
                            </button>
                          </div>
                          
                          {localCategories.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <p>No categories found.</p>
                              <p>Click "Add New Category" to create one.</p>
                            </div>
                          ) : (
                            <ul className="divide-y divide-gray-200">
                              {localCategories.map((category) => (
                                <li key={category.id} className="py-3 flex justify-between items-center">
                                  <div className="flex items-center">
                                    <div 
                                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                                      style={{ backgroundColor: category.color || '#10b981' }}
                                    >
                                      {renderIcon(category.icon, '#ffffff')}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{category.name}</p>
                                      {category.is_default && (
                                        <span className="text-xs text-gray-500">Default</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => handleEditCategory(category)}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCategory(category)}
                                      className="text-red-600 hover:text-red-800"
                                      disabled={category.is_default}
                                      title={category.is_default ? "Cannot delete default category" : "Delete category"}
                                    >
                                      <Trash2 size={16} className={category.is_default ? "opacity-50 cursor-not-allowed" : ""} />
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {isEditMode ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm ${
                        isLoading ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : selectedCategory ? 'Update Category' : 'Create Category'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryModal;