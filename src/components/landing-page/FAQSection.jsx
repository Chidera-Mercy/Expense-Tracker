import React, { useState } from 'react';

export default function FAQSection() {
    const [openFaq, setOpenFaq] = useState(null);
    
    const faqs = [
      {
        question: "What is PennyPath?",
        answer: "PennyPath is a completely free expense tracking application that helps individuals their finances. Track expenses, create budgets, and gain insights into your spending habits."
      },
      {
        question: "Is PennyPath really free?",
        answer: "Yes! PennyPath is 100% free with no hidden costs or premium tiers. We believe financial management tools should be accessible to everyone."
      },
      {
        question: "What kind of expenses can I track?",
        answer: "You can track any type of expense - from daily coffee purchases to monthly rent payments, business expenses, travel costs, and more. PennyPath offers customizable categories to organize all your expenses."
      },
      {
        question: "How do I upload expenses?",
        answer: "You can add expenses through our web interface. For now we also support manual entry."
      },
      {
        question: "How quickly can I get set up?",
        answer: "Creating an account takes less than a minute, and you can start tracking expenses immediately afterward. Our intuitive interface makes it easy to get started without a learning curve."
      },
      {
        question: "How do I get started?",
        answer: "Simply click the 'Get Started' button, enter your email, and follow the quick setup process. You'll be tracking expenses in no time!"
      }
    ];
    
    return (
      <div className="py-16 px-6 bg-emerald-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">FAQ</h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-emerald-950 rounded-lg overflow-hidden">
                <button 
                  className="w-full text-left p-6 flex justify-between items-center"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-bold text-lg">{faq.question}</span>
                  <svg 
                    className={`w-6 h-6 transform ${openFaq === index ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {openFaq === index && (
                  <div className="p-6 pt-0 text-emerald-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }