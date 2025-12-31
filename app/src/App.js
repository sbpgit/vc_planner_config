import React, { useState } from 'react';

import ProductConfigurationManager from './components/Product_Configuration_Manager';
import OptionMixProbabilityCalculator from './components/Option_Mix_Probability_Calculator';
import AdvancedConfigurationRuleBuilder from './components/Advanced_Configuration_Rule_Builder';

function App() {
  const [view, setView] = useState('products');

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="flex gap-4 p-4 border-b border-slate-700">
        <button onClick={() => setView('products')}>Products</button>
        <button onClick={() => setView('rules')}>Rules</button>
        <button onClick={() => setView('probability')}>Probability</button>
      </header>

      <main className="p-4">
        {view === 'products' && <ProductConfigurationManager />}
        {view === 'rules' && <AdvancedConfigurationRuleBuilder />}
        {view === 'probability' && <OptionMixProbabilityCalculator />}
      </main>
    </div>
  );
}

export default App;
