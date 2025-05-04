import UserTypeCard from "./UserTypeCard";
import { Link } from "react-router-dom";


export default function HeroSection() {
    return (
      <div className="px-6 py-16 max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Travel and expense, <span className="italic">at the speed of chat</span>
        </h1>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p className="text-lg">All inclusive. Manage expenses, track spending, and create reports.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p className="text-lg">Custom categories. Create your own expense categories to organize your spending.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p className="text-lg">100% Free. No hidden fees, no paid plans, just a truly free expense tracker.</p>
          </div>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl mb-6">I want to:</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UserTypeCard 
              icon="💰" 
              title="Organize my own expenses" 
              selected={true} 
            />
            
            <UserTypeCard 
              icon="🚀" 
              title="Manage my income streams" 
              selected={true} 
            />
            
            <UserTypeCard 
              icon="🌐" 
              title="Set Fiancial goals" 
              selected={true} 
            />
          </div>
          
          <div className="mt-8">
            <Link to="/login">
              <button className="bg-emerald-400 text-emerald-900 font-bold rounded-full px-6 py-3 cursor-pointer">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }