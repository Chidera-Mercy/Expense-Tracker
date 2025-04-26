export default function HowItWorksSection() {
    return (
      <div className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">How PennyPath works</h2>
          
          <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16">
            <div className="bg-emerald-950 p-6 rounded-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-emerald-400 text-emerald-900 rounded-full flex items-center justify-center font-bold">1</div>
                <h3 className="text-xl font-bold">Add Expense</h3>
              </div>
              <p className="text-emerald-100">Upload your first receipt with the web app, drag-and-drop on the web, or forward it to receipts@pennypath.com.</p>
            </div>
            
            <div className="bg-emerald-950 p-6 rounded-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-emerald-400 text-emerald-900 rounded-full flex items-center justify-center font-bold">2</div>
                <h3 className="text-xl font-bold">Create Report</h3>
              </div>
              <p className="text-emerald-100">Automatically generate expense reports with categories, tags, and comments to track your spending.</p>
            </div>
            
            <div className="bg-emerald-950 p-6 rounded-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-emerald-400 text-emerald-900 rounded-full flex items-center justify-center font-bold">3</div>
                <h3 className="text-xl font-bold">Analyze & Save</h3>
              </div>
              <p className="text-emerald-100">View insights and analytics on your spending habits to help you save money and reach your financial goals.</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <button className="bg-emerald-400 text-emerald-900 font-bold rounded-full px-8 py-3">
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }