import React, { useState } from 'react';
import { Search, Book, HelpCircle, MessageSquare, FileText, Video, Mail, ExternalLink } from 'lucide-react';

const HelpAndSupport = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAccordion, setActiveAccordion] = useState(null);
  
  const toggleAccordion = (index) => {
    if (activeAccordion === index) {
      setActiveAccordion(null);
    } else {
      setActiveAccordion(index);
    }
  };
  
  const faqs = [
    {
      question: "How do I add a new expense?",
      answer: "You can add a new expense by clicking on the 'Add Expense' button on your dashboard. Fill in the required details like amount, date, category, and description. You can also attach a receipt photo if needed."
    },
    {
      question: "How do I set up a budget?",
      answer: "To set up a budget, navigate to the Budgets page from the sidebar. Click on 'Create New Budget', select a category, set your spending limit, and choose a time period (weekly, monthly, etc.). Your budget will be active immediately and you'll start receiving alerts when approaching your limits."
    },
    {
      question: "Can I export my financial data?",
      answer: "Yes! Go to the Reports page, generate the report you want to export, and click on the 'Export' button. You can choose between PDF and CSV formats for your exported data."
    },
    {
      question: "How do I set up recurring expenses?",
      answer: "When adding a new expense, toggle the 'Recurring' option. You'll be able to set the frequency (daily, weekly, monthly) and duration for the recurring expense. PennyPath will automatically create new entries based on your settings."
    },
    {
      question: "How do I track my financial goals?",
      answer: "Navigate to Financial Goals in the sidebar. Click 'Create New Goal', enter a title, target amount, and deadline. You can categorize your goal and add notes. Your progress will be automatically calculated based on your savings."
    }
  ];
  
  const videoTutorials = [
    { title: "Getting Started with PennyPath", duration: "5:23" },
    { title: "Setting Up Your First Budget", duration: "4:17" },
    { title: "Advanced Expense Tracking", duration: "7:45" },
    { title: "Financial Reporting & Analytics", duration: "6:12" },
    { title: "Managing Financial Goals", duration: "3:59" }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Help & Support</h1>
      
      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Search for help topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Help Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Book className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-lg font-semibold">User Guide</h2>
          </div>
          <p className="text-gray-600 mb-4">Complete documentation on how to use all features of PennyPath.</p>
          <button className="text-green-600 hover:text-green-800 font-medium flex items-center">
            Read Guide
            <ExternalLink className="ml-1 h-4 w-4" />
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Video className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-lg font-semibold">Video Tutorials</h2>
          </div>
          <p className="text-gray-600 mb-4">Watch step-by-step tutorials on how to use PennyPath effectively.</p>
          <button className="text-green-600 hover:text-green-800 font-medium flex items-center">
            Watch Videos
            <ExternalLink className="ml-1 h-4 w-4" />
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <MessageSquare className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-lg font-semibold">Contact Support</h2>
          </div>
          <p className="text-gray-600 mb-4">Get in touch with our support team for personalized assistance.</p>
          <button className="text-green-600 hover:text-green-800 font-medium flex items-center">
            Contact Us
            <ExternalLink className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-10">
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
      
      {/* Video Tutorials */}
      <div className="bg-white rounded-lg shadow p-6 mb-10">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Video className="h-6 w-6 text-green-600 mr-2" />
          Video Tutorials
        </h2>
        
        <div className="space-y-4">
          {videoTutorials.map((video, index) => (
            <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="bg-green-100 p-2 rounded-lg mr-4">
                <Video className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{video.title}</h3>
                <p className="text-gray-500 text-sm">{video.duration}</p>
              </div>
              <button className="text-green-600 hover:text-green-800">
                <ExternalLink className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Contact Support */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Mail className="h-6 w-6 text-green-600 mr-2" />
          Contact Support
        </h2>
        
        <form>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="subject">Subject</label>
            <select
              id="subject"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select a topic</option>
              <option value="technical">Technical Issue</option>
              <option value="account">Account Management</option>
              <option value="billing">Billing Question</option>
              <option value="feature">Feature Request</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="message">Message</label>
            <textarea
              id="message"
              rows="4"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Describe your issue or question..."
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Where should we send our response?"
              defaultValue="alex@example.com"
            />
          </div>
          
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="attachLogs"
              className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="attachLogs" className="text-gray-700">Attach diagnostic logs</label>
            <span className="ml-1 text-gray-500 text-sm">(Helps us troubleshoot technical issues)</span>
          </div>
          
          <button
            type="submit"
            className="w-full md:w-auto bg-green-600 text-white px-6 py-2 rounded flex items-center justify-center hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default HelpAndSupport;