import FeatureCard from "./FeatureCard";

export default function FeaturesSection() {
    return (
      <div className="py-16 px-6 bg-emerald-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="💵" 
              title="Spend management" 
              description="Manage expenses, vendors, and track spending trends across categories." 
            />
            
            <FeatureCard 
              icon="🧾" 
              title="Receipt tracking" 
              description="Upload receipts of different expenses, so you never lose them" 
            />
            
            <FeatureCard 
              icon="📊" 
              title="Expense reports" 
              description="Create detailed reports to understand your spending habits." 
            />
            
            <FeatureCard 
              icon="📅" 
              title="Budget planning" 
              description="Set budgets for categories and track your spending against targets." 
            />
            
            <FeatureCard 
              icon="💬" 
              title="Expense reminders" 
              description="Get notifications for recurring bills and expenses to never miss a payment." 
            />
          </div>
        </div>
      </div>
    );
  }