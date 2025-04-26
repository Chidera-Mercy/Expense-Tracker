import UserTypeCard from "./UserTypeCard";

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
            <p className="text-lg">All inclusive. Manage expenses, track spending, and create expense reports.</p>
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
              title="Manage expenses for a small team" 
              subtitle="(1-9 employees)" 
              selected={false} 
            />
            
            <UserTypeCard 
              icon="🌐" 
              title="Control expenses for a larger organization" 
              subtitle="(10+ employees)" 
              selected={false} 
            />
          </div>
          
          <div className="mt-8">
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email or phone number" 
                className="bg-emerald-950 border border-emerald-700 rounded-full px-6 py-3 w-full md:w-2/3"
              />
              <button className="bg-emerald-400 text-emerald-900 font-bold rounded-full px-6 py-3">
                Get Started
              </button>
            </div>
            
            <div className="mt-4 flex items-center gap-2">
              <p>Or get started with</p>
              <button className="bg-white rounded-full p-2">
                <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }