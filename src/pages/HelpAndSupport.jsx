import React, { useState } from 'react';
import { Book, HelpCircle, Mail, DollarSign, PieChart, Target, Calendar, Tag, TrendingUp } from 'lucide-react';

const HelpAndSupport = () => {
  const [activeAccordion, setActiveAccordion] = useState(null);
  
  const toggleAccordion = (index) => {
    if (activeAccordion === index) {
      setActiveAccordion(null);
    } else {
      setActiveAccordion(index);
    }
  };
  
  const features = [
    {
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
      title: "Expense Tracking",
      description: "Track and categorize all your expenses with ease"
    },
    {
      icon: <PieChart className="h-5 w-5 text-green-600" />,
      title: "Budget Management",
      description: "Set and monitor budgets for different spending categories"
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-green-600" />,
      title: "Income Recording",
      description: "Keep track of all your income sources in one place"
    },
    {
      icon: <Target className="h-5 w-5 text-green-600" />,
      title: "Financial Goals",
      description: "Create and track progress toward your financial goals"
    },
    {
      icon: <Calendar className="h-5 w-5 text-green-600" />,
      title: "Recurring Transactions",
      description: "Set up automatic tracking for regular expenses and income"
    },
    {
      icon: <Tag className="h-5 w-5 text-green-600" />,
      title: "Analytics & Reports",
      description: "Visualize your finances with powerful charts and reports"
    }
  ];
  
  const faqs = [
    {
      question: "How do I add a new expense?",
      answer: "You can add a new expense by clicking on the 'Add Expense' button on your dashboard. Fill in the required details like amount, date, category, and description. You can also attach a receipt photo if needed."
    },
    {
      question: "How do I set up a budget?",
      answer: "To set up a budget, navigate to the Budgets page from the sidebar. Click on 'Create New Budget', select a category, set your spending limit, and choose a time period (weekly, monthly, quarterly, or yearly). Your budget will be active immediately and you'll start receiving alerts when approaching your limits."
    },
    {
      question: "How do I track my income?",
      answer: "Navigate to the Income section from the sidebar. Click 'Record Income' and enter the source, amount, and date. You can categorize your income and set up recurring income entries like your salary."
    },
    {
      question: "How do I set up recurring expenses?",
      answer: "When adding a new expense, toggle the 'Recurring' option. You'll be able to set the frequency (daily, weekly, monthly) and duration for the recurring expense. PennyPath will automatically create new entries based on your settings."
    },
    {
      question: "How do I create and track financial goals?",
      answer: "Navigate to Financial Goals in the sidebar. Click 'Create New Goal', enter a title, target amount, and deadline. You can categorize your goal and add notes. Your progress will be automatically calculated based on your savings."
    },
    {
      question: "How do I view reports and analytics?",
      answer: "Access the Analytics section from the sidebar. You'll see spending overviews, category analysis, time-based analysis, and budget performance visualizations. You can also generate comparative reports and export them as PDF or CSV files."
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Help & Support</h1>
      
      {/* PennyPath Basics */}
      <div className="bg-white rounded-lg shadow p-6 mb-10">
        <div className="flex items-center mb-6">
          <Book className="h-8 w-8 text-green-600 mr-3" />
          <h2 className="text-xl font-semibold">PennyPath Basics</h2>
        </div>
        
        <p className="text-gray-600 mb-6">PennyPath helps you take control of your finances with these powerful features:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-green-100 rounded-full mr-3">
                  {feature.icon}
                </div>
                <h3 className="font-medium text-gray-800">{feature.title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Contact */}
      <div className="bg-white rounded-lg shadow p-6 mb-10">
        <div className="flex items-center mb-4">
          <Mail className="h-8 w-8 text-green-600 mr-3" />
          <h2 className="text-xl font-semibold">Contact Us</h2>
        </div>
        <p className="text-gray-600 mb-4">Need additional help? Our support team is ready to assist you.</p>
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 inline-block">
          <p className="font-medium mb-1">Email:</p>
          <a href="mailto:support@pennypath.com" className="text-green-600 hover:text-green-800 text-lg">
            support@pennypath.com
          </a>
          <p className="text-sm text-gray-500 mt-2">We typically respond within 24 hours during business days.</p>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <HelpCircle className="h-6 w-6 text-green-600 mr-2" />
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                className="flex justify-between items-center w-full p-4 text-left bg-gray-50 hover:bg-gray-100"
                onClick={() => toggleAccordion(index)}
              >
                <span className="font-medium">{faq.question}</span>
                <svg
                  className={`w-5 h-5 transition-transform ${activeAccordion === index ? 'transform rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              {activeAccordion === index && (
                <div className="p-4 bg-white">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpAndSupport;