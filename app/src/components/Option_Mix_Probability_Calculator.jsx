import React, { useState, useMemo, useCallback } from 'react';
import { 
  Calculator,
  Percent,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Download,
  Upload,
  Settings,
  BarChart3,
  PieChart,
  GitBranch,
  Layers,
  Target,
  Zap,
  Info,
  CheckCircle,
  XCircle,
  ArrowRight,
  Globe,
  Lock,
  Unlock,
  Copy,
  Save,
  Play,
  Lightbulb,
   Sliders
} from 'lucide-react';

// Product configuration data
const initialProductData = {
  product: {
    id: 'VEHICLE_2025',
    name: 'Premium Vehicle Series 2025',
    baseVolume: 10000 // Units per period
  },
  classes: [
    {
      id: 'ENGINE',
      name: 'Engine',
      color: '#3b82f6',
      type: 'independent', // Can be set directly
      characteristics: [
        { id: 'ENG_1_5T', name: '1.5L Turbo', code: 'ENG001', baseProbability: 0.25 },
        { id: 'ENG_2_0T', name: '2.0L Turbo', code: 'ENG002', baseProbability: 0.30 },
        { id: 'ENG_2_0D', name: '2.0L Diesel', code: 'ENG003', baseProbability: 0.15 },
        { id: 'ENG_HYB', name: '1.8L Hybrid', code: 'ENG004', baseProbability: 0.20 },
        { id: 'ENG_EV', name: 'Full Electric', code: 'ENG005', baseProbability: 0.10 }
      ]
    },
    {
      id: 'PACKAGE',
      name: 'Package',
      color: '#f59e0b',
      type: 'independent',
      characteristics: [
        { id: 'PKG_BASE', name: 'Base', code: 'PKG001', baseProbability: 0.20 },
        { id: 'PKG_COMFORT', name: 'Comfort', code: 'PKG002', baseProbability: 0.35 },
        { id: 'PKG_PREMIUM', name: 'Premium', code: 'PKG003', baseProbability: 0.30 },
        { id: 'PKG_SPORT', name: 'Sport', code: 'PKG004', baseProbability: 0.15 }
      ]
    },
    {
      id: 'TRANSMISSION',
      name: 'Transmission',
      color: '#8b5cf6',
      type: 'dependent', // Derived from rules
      characteristics: [
        { id: 'TRN_M5', name: '5-Speed Manual', code: 'TRN001', baseProbability: 0 },
        { id: 'TRN_M6', name: '6-Speed Manual', code: 'TRN002', baseProbability: 0 },
        { id: 'TRN_A6', name: '6-Speed Auto', code: 'TRN003', baseProbability: 0 },
        { id: 'TRN_A8', name: '8-Speed Auto', code: 'TRN004', baseProbability: 0 },
        { id: 'TRN_CVT', name: 'CVT', code: 'TRN005', baseProbability: 0 },
        { id: 'TRN_EV', name: 'Single-Speed EV', code: 'TRN006', baseProbability: 0 }
      ]
    },
    {
      id: 'WHEELS',
      name: 'Wheels',
      color: '#ec4899',
      type: 'dependent',
      characteristics: [
        { id: 'WHL_16', name: '16" Alloy', code: 'WHL001', baseProbability: 0 },
        { id: 'WHL_17', name: '17" Alloy', code: 'WHL002', baseProbability: 0 },
        { id: 'WHL_18', name: '18" Alloy', code: 'WHL003', baseProbability: 0 },
        { id: 'WHL_19', name: '19" Sport', code: 'WHL004', baseProbability: 0 }
      ]
    },
    {
      id: 'DRIVETRAIN',
      name: 'Drivetrain',
      color: '#06b6d4',
      type: 'dependent',
      characteristics: [
        { id: 'DRV_FWD', name: 'Front Wheel Drive', code: 'DRV001', baseProbability: 0 },
        { id: 'DRV_RWD', name: 'Rear Wheel Drive', code: 'DRV002', baseProbability: 0 },
        { id: 'DRV_AWD', name: 'All Wheel Drive', code: 'DRV003', baseProbability: 0 }
      ]
    },
    {
      id: 'STEERING',
      name: 'Steering',
      color: '#10b981',
      type: 'regional', // Based on region
      characteristics: [
        { id: 'STR_LHD', name: 'Left Hand Drive', code: 'STR001', baseProbability: 0 },
        { id: 'STR_RHD', name: 'Right Hand Drive', code: 'STR002', baseProbability: 0 }
      ]
    }
  ],
  regions: [
    { id: 'EU', name: 'European Union', steering: 'STR_LHD', volumeShare: 0.30 },
    { id: 'UK', name: 'United Kingdom', steering: 'STR_RHD', volumeShare: 0.10 },
    { id: 'US', name: 'United States', steering: 'STR_LHD', volumeShare: 0.25, excludeEngines: ['ENG_2_0D'] },
    { id: 'JP', name: 'Japan', steering: 'STR_RHD', volumeShare: 0.10 },
    { id: 'AU', name: 'Australia', steering: 'STR_RHD', volumeShare: 0.05 },
    { id: 'CN', name: 'China', steering: 'STR_LHD', volumeShare: 0.15, excludeTransmissions: ['TRN_M5', 'TRN_M6'] },
    { id: 'IN', name: 'India', steering: 'STR_LHD', volumeShare: 0.05, excludeEngines: ['ENG_EV'] }
  ],
  // Dependency rules for probability calculation
  dependencyRules: [
    // Engine -> Transmission mappings
    {
      id: 'DEP_001',
      name: 'EV Transmission',
      sourceClass: 'ENGINE',
      sourceValues: ['ENG_EV'],
      targetClass: 'TRANSMISSION',
      distribution: { 'TRN_EV': 1.0 } // 100% of EV gets single-speed
    },
    {
      id: 'DEP_002',
      name: 'Hybrid Transmission',
      sourceClass: 'ENGINE',
      sourceValues: ['ENG_HYB'],
      targetClass: 'TRANSMISSION',
      distribution: { 'TRN_CVT': 0.60, 'TRN_A6': 0.25, 'TRN_A8': 0.15 }
    },
    {
      id: 'DEP_003',
      name: 'Petrol 1.5T Transmission',
      sourceClass: 'ENGINE',
      sourceValues: ['ENG_1_5T'],
      targetClass: 'TRANSMISSION',
      distribution: { 'TRN_M5': 0.15, 'TRN_M6': 0.20, 'TRN_A6': 0.35, 'TRN_CVT': 0.30 }
    },
    {
      id: 'DEP_004',
      name: 'Petrol 2.0T Transmission',
      sourceClass: 'ENGINE',
      sourceValues: ['ENG_2_0T'],
      targetClass: 'TRANSMISSION',
      distribution: { 'TRN_M6': 0.25, 'TRN_A8': 0.55, 'TRN_A6': 0.20 }
    },
    {
      id: 'DEP_005',
      name: 'Diesel Transmission',
      sourceClass: 'ENGINE',
      sourceValues: ['ENG_2_0D'],
      targetClass: 'TRANSMISSION',
      distribution: { 'TRN_M6': 0.40, 'TRN_A6': 0.35, 'TRN_A8': 0.25 }
    },
    // Package -> Wheels mappings
    {
      id: 'DEP_006',
      name: 'Base Package Wheels',
      sourceClass: 'PACKAGE',
      sourceValues: ['PKG_BASE'],
      targetClass: 'WHEELS',
      distribution: { 'WHL_16': 0.70, 'WHL_17': 0.30 }
    },
    {
      id: 'DEP_007',
      name: 'Comfort Package Wheels',
      sourceClass: 'PACKAGE',
      sourceValues: ['PKG_COMFORT'],
      targetClass: 'WHEELS',
      distribution: { 'WHL_16': 0.20, 'WHL_17': 0.50, 'WHL_18': 0.30 }
    },
    {
      id: 'DEP_008',
      name: 'Premium Package Wheels',
      sourceClass: 'PACKAGE',
      sourceValues: ['PKG_PREMIUM'],
      targetClass: 'WHEELS',
      distribution: { 'WHL_17': 0.25, 'WHL_18': 0.50, 'WHL_19': 0.25 }
    },
    {
      id: 'DEP_009',
      name: 'Sport Package Wheels',
      sourceClass: 'PACKAGE',
      sourceValues: ['PKG_SPORT'],
      targetClass: 'WHEELS',
      distribution: { 'WHL_18': 0.40, 'WHL_19': 0.60 }
    },
    // Engine + Package -> Drivetrain (compound rule)
    {
      id: 'DEP_010',
      name: 'EV Drivetrain',
      sourceClass: 'ENGINE',
      sourceValues: ['ENG_EV'],
      targetClass: 'DRIVETRAIN',
      distribution: { 'DRV_AWD': 0.60, 'DRV_RWD': 0.40 }
    },
    {
      id: 'DEP_011',
      name: 'Sport Package Drivetrain',
      sourceClass: 'PACKAGE',
      sourceValues: ['PKG_SPORT'],
      targetClass: 'DRIVETRAIN',
      distribution: { 'DRV_RWD': 0.45, 'DRV_AWD': 0.55 }
    },
    {
      id: 'DEP_012',
      name: 'Standard Drivetrain',
      sourceClass: 'PACKAGE',
      sourceValues: ['PKG_BASE', 'PKG_COMFORT', 'PKG_PREMIUM'],
      targetClass: 'DRIVETRAIN',
      distribution: { 'DRV_FWD': 0.55, 'DRV_AWD': 0.30, 'DRV_RWD': 0.15 }
    }
  ]
};

const ProbabilityCalculator = () => {
  const [productData, setProductData] = useState(initialProductData);
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [inputProbabilities, setInputProbabilities] = useState(() => {
    const initial = {};
    initialProductData.classes.forEach(cls => {
      if (cls.type === 'independent') {
        initial[cls.id] = {};
        cls.characteristics.forEach(char => {
          initial[cls.id][char.id] = char.baseProbability;
        });
      }
    });
    return initial;
  });
  const [expandedClasses, setExpandedClasses] = useState(['ENGINE', 'PACKAGE', 'TRANSMISSION']);
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);
  const [scenarioName, setScenarioName] = useState('Base Scenario');

  // Update probability for a characteristic
  const updateProbability = (classId, charId, value) => {
    const numValue = Math.max(0, Math.min(1, parseFloat(value) || 0));
    setInputProbabilities(prev => ({
      ...prev,
      [classId]: {
        ...prev[classId],
        [charId]: numValue
      }
    }));
  };

  // Normalize probabilities for a class to sum to 1
  const normalizeProbabilities = (classId) => {
    const classProbabilities = inputProbabilities[classId];
    if (!classProbabilities) return;
    
    const sum = Object.values(classProbabilities).reduce((a, b) => a + b, 0);
    if (sum === 0) return;
    
    const normalized = {};
    Object.entries(classProbabilities).forEach(([charId, prob]) => {
      normalized[charId] = prob / sum;
    });
    
    setInputProbabilities(prev => ({
      ...prev,
      [classId]: normalized
    }));
  };

  // Calculate derived probabilities
  const calculatedProbabilities = useMemo(() => {
    const results = {
      independent: {},
      dependent: {},
      regional: {},
      byRegion: {},
      calculationSteps: []
    };

    // Copy independent probabilities
    productData.classes.filter(c => c.type === 'independent').forEach(cls => {
      results.independent[cls.id] = { ...inputProbabilities[cls.id] };
    });

    // Calculate regional adjustments
    const activeRegions = selectedRegion === 'ALL' 
      ? productData.regions 
      : productData.regions.filter(r => r.id === selectedRegion);

    // Initialize dependent class probabilities
    productData.classes.filter(c => c.type === 'dependent' || c.type === 'regional').forEach(cls => {
      results.dependent[cls.id] = {};
      cls.characteristics.forEach(char => {
        results.dependent[cls.id][char.id] = 0;
      });
    });

    // Calculate steering based on region
    const steeringClass = productData.classes.find(c => c.id === 'STEERING');
    if (steeringClass) {
      results.regional['STEERING'] = {};
      steeringClass.characteristics.forEach(char => {
        results.regional['STEERING'][char.id] = 0;
      });

      if (selectedRegion === 'ALL') {
        // Weight by regional volume share
        productData.regions.forEach(region => {
          results.regional['STEERING'][region.steering] += region.volumeShare;
        });
        results.calculationSteps.push({
          type: 'regional',
          description: 'Steering position calculated from regional volume shares',
          details: productData.regions.map(r => `${r.id}: ${r.steering} (${(r.volumeShare * 100).toFixed(0)}%)`).join(', ')
        });
      } else {
        const region = productData.regions.find(r => r.id === selectedRegion);
        if (region) {
          results.regional['STEERING'][region.steering] = 1.0;
          results.calculationSteps.push({
            type: 'regional',
            description: `Steering for ${region.name}`,
            details: `100% ${region.steering === 'STR_LHD' ? 'Left Hand Drive' : 'Right Hand Drive'}`
          });
        }
      }
    }

    // Apply regional exclusions to adjust input probabilities
    let adjustedInputProbs = JSON.parse(JSON.stringify(inputProbabilities));
    
    if (selectedRegion !== 'ALL') {
      const region = productData.regions.find(r => r.id === selectedRegion);
      if (region) {
        // Handle engine exclusions
        if (region.excludeEngines) {
          const engineProbs = { ...adjustedInputProbs['ENGINE'] };
          let excludedSum = 0;
          region.excludeEngines.forEach(engId => {
            excludedSum += engineProbs[engId] || 0;
            engineProbs[engId] = 0;
          });
          
          if (excludedSum > 0) {
            // Redistribute excluded probability
            const remainingSum = Object.values(engineProbs).reduce((a, b) => a + b, 0);
            if (remainingSum > 0) {
              Object.keys(engineProbs).forEach(key => {
                if (engineProbs[key] > 0) {
                  engineProbs[key] = engineProbs[key] / remainingSum;
                }
              });
            }
            adjustedInputProbs['ENGINE'] = engineProbs;
            
            results.calculationSteps.push({
              type: 'exclusion',
              description: `Engine exclusions for ${region.name}`,
              details: `Excluded: ${region.excludeEngines.join(', ')}. Probabilities redistributed.`
            });
          }
        }
      }
    }

    // Calculate dependent probabilities using dependency rules
    productData.dependencyRules.forEach(rule => {
      const sourceProbs = adjustedInputProbs[rule.sourceClass] || results.dependent[rule.sourceClass];
      if (!sourceProbs) return;

      // Calculate probability contribution from this rule
      let ruleContribution = 0;
      rule.sourceValues.forEach(sourceVal => {
        ruleContribution += sourceProbs[sourceVal] || 0;
      });

      if (ruleContribution > 0) {
        // Apply distribution to target
        Object.entries(rule.distribution).forEach(([targetChar, proportion]) => {
          const contribution = ruleContribution * proportion;
          
          if (!results.dependent[rule.targetClass]) {
            results.dependent[rule.targetClass] = {};
          }
          
          results.dependent[rule.targetClass][targetChar] = 
            (results.dependent[rule.targetClass][targetChar] || 0) + contribution;
        });

        results.calculationSteps.push({
          type: 'dependency',
          rule: rule.name,
          source: `${rule.sourceClass}: ${rule.sourceValues.join(', ')}`,
          contribution: ruleContribution,
          distribution: Object.entries(rule.distribution)
            .map(([k, v]) => `${k}: ${(v * 100).toFixed(0)}%`)
            .join(', ')
        });
      }
    });

    // Handle transmission exclusions for China
    if (selectedRegion === 'CN' || selectedRegion === 'ALL') {
      const region = productData.regions.find(r => r.id === 'CN');
      if (region?.excludeTransmissions && results.dependent['TRANSMISSION']) {
        const transProbs = results.dependent['TRANSMISSION'];
        let excludedSum = 0;
        
        region.excludeTransmissions.forEach(transId => {
          excludedSum += transProbs[transId] || 0;
        });

        if (excludedSum > 0 && selectedRegion === 'CN') {
          // Zero out excluded and redistribute
          region.excludeTransmissions.forEach(transId => {
            transProbs[transId] = 0;
          });
          
          const remainingSum = Object.values(transProbs).reduce((a, b) => a + b, 0);
          if (remainingSum > 0) {
            Object.keys(transProbs).forEach(key => {
              if (transProbs[key] > 0) {
                transProbs[key] = transProbs[key] / remainingSum;
              }
            });
          }
          
          results.calculationSteps.push({
            type: 'exclusion',
            description: 'China transmission exclusions',
            details: `Manual transmissions excluded. Probabilities redistributed.`
          });
        }
      }
    }

    // Normalize all dependent probabilities
    Object.keys(results.dependent).forEach(classId => {
      const probs = results.dependent[classId];
      const sum = Object.values(probs).reduce((a, b) => a + b, 0);
      if (sum > 0 && Math.abs(sum - 1) > 0.001) {
        Object.keys(probs).forEach(key => {
          probs[key] = probs[key] / sum;
        });
      }
    });

    // Calculate by-region breakdown
    productData.regions.forEach(region => {
      results.byRegion[region.id] = {
        volumeShare: region.volumeShare,
        steering: region.steering,
        adjustments: []
      };
      
      if (region.excludeEngines) {
        results.byRegion[region.id].adjustments.push(`No ${region.excludeEngines.join(', ')}`);
      }
      if (region.excludeTransmissions) {
        results.byRegion[region.id].adjustments.push(`No manual transmission`);
      }
    });

    return results;
  }, [inputProbabilities, selectedRegion, productData]);

  // Calculate volumes
  const calculatedVolumes = useMemo(() => {
    const baseVolume = productData.product.baseVolume;
    const volumes = {};

    productData.classes.forEach(cls => {
      volumes[cls.id] = {};
      const probs = cls.type === 'independent' 
        ? inputProbabilities[cls.id] 
        : cls.type === 'regional'
          ? calculatedProbabilities.regional[cls.id]
          : calculatedProbabilities.dependent[cls.id];

      if (probs) {
        cls.characteristics.forEach(char => {
          const prob = probs[char.id] || 0;
          volumes[cls.id][char.id] = Math.round(baseVolume * prob);
        });
      }
    });

    return volumes;
  }, [inputProbabilities, calculatedProbabilities, productData]);

  // Get probability validation
  const getProbabilityValidation = (classId) => {
    const probs = inputProbabilities[classId];
    if (!probs) return { valid: true, sum: 0 };
    
    const sum = Object.values(probs).reduce((a, b) => a + b, 0);
    return {
      valid: Math.abs(sum - 1) < 0.01,
      sum
    };
  };

  // Get class helper
  const getClass = (classId) => productData.classes.find(c => c.id === classId);
  const getCharacteristic = (classId, charId) => {
    const cls = getClass(classId);
    return cls?.characteristics.find(c => c.id === charId);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    const initial = {};
    productData.classes.forEach(cls => {
      if (cls.type === 'independent') {
        initial[cls.id] = {};
        cls.characteristics.forEach(char => {
          initial[cls.id][char.id] = char.baseProbability;
        });
      }
    });
    setInputProbabilities(initial);
  };

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(145deg, #0a0d14 0%, #111827 50%, #0d1117 100%)',
      fontFamily: "'Inter', -apple-system, sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        .glass { background: rgba(17, 24, 39, 0.8); backdrop-filter: blur(20px); }
        
        .probability-bar {
          transition: width 0.5s ease-out;
        }
        
        .input-glow:focus {
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
        }
        
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        
        .scroll-thin::-webkit-scrollbar { width: 6px; }
        .scroll-thin::-webkit-scrollbar-track { background: rgba(30, 41, 59, 0.3); }
        .scroll-thin::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 3px; }
        
        .derived-pulse {
          animation: derivedPulse 2s ease-in-out infinite;
        }
        @keyframes derivedPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        input[type="range"] {
          -webkit-appearance: none;
          background: transparent;
        }
        input[type="range"]::-webkit-slider-track {
          height: 6px;
          background: rgba(51, 65, 85, 0.5);
          border-radius: 3px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 50%;
          cursor: pointer;
          margin-top: -6px;
          box-shadow: 0 2px 10px rgba(99, 102, 241, 0.4);
        }
      `}</style>

      {/* Header */}
      <header className="glass border-b border-indigo-500/20">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" 
                   style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}>
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Option Mix Probability Calculator</h1>
                <p className="text-slate-400 text-sm">Calculate derived feature probabilities from configuration rules</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-slate-700/50">
                <Globe className="w-4 h-4 text-indigo-400" />
                <select 
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900">All Regions (Global)</option>
                  {productData.regions.map(region => (
                    <option key={region.id} value={region.id} className="bg-slate-900">
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                onClick={resetToDefaults}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}>
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="glass rounded-2xl p-4 border border-slate-700/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Base Volume</p>
                <p className="text-xl font-bold text-white">{productData.product.baseVolume.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 border border-slate-700/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Layers className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Feature Classes</p>
                <p className="text-xl font-bold text-white">{productData.classes.length}</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 border border-slate-700/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Dependency Rules</p>
                <p className="text-xl font-bold text-white">{productData.dependencyRules.length}</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 border border-slate-700/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Region</p>
                <p className="text-xl font-bold text-white">
                  {selectedRegion === 'ALL' ? 'Global' : selectedRegion}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Probabilities Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                Input Probabilities
              </h2>
              <span className="text-xs text-slate-500">Set base probabilities for independent features</span>
            </div>

            {productData.classes.filter(c => c.type === 'independent').map(cls => {
              const validation = getProbabilityValidation(cls.id);
              const isExpanded = expandedClasses.includes(cls.id);
              
              return (
                <div key={cls.id} className="glass rounded-2xl overflow-hidden border border-slate-700/30">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                    onClick={() => setExpandedClasses(prev => 
                      prev.includes(cls.id) ? prev.filter(id => id !== cls.id) : [...prev, cls.id]
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: cls.color }} />
                      <h3 className="text-base font-semibold text-white">{cls.name}</h3>
                      <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">Input</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                        validation.valid 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {validation.valid ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {(validation.sum * 100).toFixed(0)}%
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); normalizeProbabilities(cls.id); }}
                        className="px-2 py-1 rounded-lg text-xs bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
                      >
                        Normalize
                      </button>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3">
                      {cls.characteristics.map(char => {
                        const prob = inputProbabilities[cls.id]?.[char.id] || 0;
                        const volume = calculatedVolumes[cls.id]?.[char.id] || 0;
                        
                        return (
                          <div key={char.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-300">{char.name}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-500 font-mono">{volume.toLocaleString()} units</span>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={(prob * 100).toFixed(1)}
                                    onChange={(e) => updateProbability(cls.id, char.id, parseFloat(e.target.value) / 100)}
                                    className="w-16 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm text-right focus:outline-none focus:border-indigo-500 input-glow"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                  />
                                  <span className="text-slate-400 text-sm">%</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                value={prob * 100}
                                onChange={(e) => updateProbability(cls.id, char.id, parseFloat(e.target.value) / 100)}
                                className="flex-1"
                                min="0"
                                max="100"
                                step="0.5"
                              />
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                              <div 
                                className="h-full rounded-full probability-bar"
                                style={{ 
                                  width: `${prob * 100}%`,
                                  background: `linear-gradient(90deg, ${cls.color}80, ${cls.color})`
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Calculated Probabilities Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Derived Probabilities
              </h2>
              <button
                onClick={() => setShowCalculationDetails(!showCalculationDetails)}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
              >
                <Info className="w-3 h-3" />
                {showCalculationDetails ? 'Hide' : 'Show'} calculation details
              </button>
            </div>

            {/* Calculation Steps */}
            {showCalculationDetails && calculatedProbabilities.calculationSteps.length > 0 && (
              <div className="glass rounded-2xl p-4 border border-amber-500/20 mb-4">
                <h4 className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Calculation Steps
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto scroll-thin">
                  {calculatedProbabilities.calculationSteps.map((step, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-800/50 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          step.type === 'dependency' ? 'bg-purple-500/20 text-purple-400' :
                          step.type === 'regional' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {step.type.toUpperCase()}
                        </span>
                        <span className="text-slate-300">{step.rule || step.description}</span>
                      </div>
                      {step.source && (
                        <p className="text-slate-500 ml-2">Source: {step.source} ({(step.contribution * 100).toFixed(1)}%)</p>
                      )}
                      {step.distribution && (
                        <p className="text-slate-500 ml-2">→ {step.distribution}</p>
                      )}
                      {step.details && !step.distribution && (
                        <p className="text-slate-500 ml-2">{step.details}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dependent Classes */}
            {productData.classes.filter(c => c.type === 'dependent' || c.type === 'regional').map(cls => {
              const probs = cls.type === 'regional' 
                ? calculatedProbabilities.regional[cls.id] 
                : calculatedProbabilities.dependent[cls.id];
              const isExpanded = expandedClasses.includes(cls.id);
              
              if (!probs) return null;

              return (
                <div key={cls.id} className="glass rounded-2xl overflow-hidden border border-slate-700/30 card-hover">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                    onClick={() => setExpandedClasses(prev => 
                      prev.includes(cls.id) ? prev.filter(id => id !== cls.id) : [...prev, cls.id]
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full derived-pulse" style={{ background: cls.color }} />
                      <h3 className="text-base font-semibold text-white">{cls.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        cls.type === 'regional' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {cls.type === 'regional' ? 'Regional' : 'Derived'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-3 h-3 text-slate-500" />
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3">
                      {cls.characteristics.map(char => {
                        const prob = probs[char.id] || 0;
                        const volume = calculatedVolumes[cls.id]?.[char.id] || 0;
                        
                        return (
                          <div key={char.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-300">{char.name}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-500 font-mono">{volume.toLocaleString()} units</span>
                                <span className="text-sm font-medium text-white">
                                  {(prob * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                              <div 
                                className="h-full rounded-full probability-bar"
                                style={{ 
                                  width: `${prob * 100}%`,
                                  background: `linear-gradient(90deg, ${cls.color}60, ${cls.color})`
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Regional Breakdown */}
            {selectedRegion === 'ALL' && (
              <div className="glass rounded-2xl p-4 border border-slate-700/30">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  Regional Volume Distribution
                </h3>
                <div className="space-y-3">
                  {productData.regions.map(region => (
                    <div key={region.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-300">{region.name}</span>
                          {region.excludeEngines && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                              No {region.excludeEngines.join(', ')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">
                            {Math.round(productData.product.baseVolume * region.volumeShare).toLocaleString()} units
                          </span>
                          <span className="text-sm font-medium text-white">
                            {(region.volumeShare * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                        <div 
                          className="h-full rounded-full probability-bar"
                          style={{ 
                            width: `${region.volumeShare * 100}%`,
                            background: 'linear-gradient(90deg, #6366f180, #6366f1)'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Full Width Summary Table */}
        <div className="mt-8">
          <div className="glass rounded-2xl border border-slate-700/30 overflow-hidden">
            <div className="p-4 border-b border-slate-700/30">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                Complete Option Mix Summary
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/30">
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Feature Class</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Characteristic</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Code</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Type</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-slate-400">Probability</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-slate-400">Volume</th>
                    <th className="px-4 py-3 text-sm font-medium text-slate-400 w-48">Distribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/20">
                  {productData.classes.map(cls => (
                    cls.characteristics.map((char, idx) => {
                      const prob = cls.type === 'independent' 
                        ? (inputProbabilities[cls.id]?.[char.id] || 0)
                        : cls.type === 'regional'
                          ? (calculatedProbabilities.regional[cls.id]?.[char.id] || 0)
                          : (calculatedProbabilities.dependent[cls.id]?.[char.id] || 0);
                      const volume = calculatedVolumes[cls.id]?.[char.id] || 0;
                      
                      return (
                        <tr key={char.id} className="hover:bg-slate-800/20 transition-colors">
                          {idx === 0 && (
                            <td className="px-4 py-3 text-sm" rowSpan={cls.characteristics.length}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ background: cls.color }} />
                                <span className="font-medium text-white">{cls.name}</span>
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-3 text-sm text-slate-300">{char.name}</td>
                          <td className="px-4 py-3 text-xs font-mono text-slate-500">{char.code}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              cls.type === 'independent' ? 'bg-blue-500/20 text-blue-400' :
                              cls.type === 'regional' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {cls.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-white">
                            {(prob * 100).toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-mono text-slate-400">
                            {volume.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(51, 65, 85, 0.3)' }}>
                              <div 
                                className="h-full rounded-full"
                                style={{ 
                                  width: `${prob * 100}%`,
                                  background: cls.color
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Dependency Rules Reference */}
        <div className="mt-6">
          <div className="glass rounded-2xl border border-slate-700/30 overflow-hidden">
            <div className="p-4 border-b border-slate-700/30 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-purple-400" />
                Active Dependency Rules
              </h2>
              <span className="text-xs text-slate-500">{productData.dependencyRules.length} rules</span>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {productData.dependencyRules.map(rule => {
                const sourceClass = getClass(rule.sourceClass);
                const targetClass = getClass(rule.targetClass);
                
                return (
                  <div 
                    key={rule.id}
                    className="p-3 rounded-xl border border-slate-700/30"
                    style={{ background: 'rgba(30, 41, 59, 0.3)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-white">{rule.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mb-2">
                      <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: `${sourceClass?.color}20` }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: sourceClass?.color }} />
                        <span style={{ color: sourceClass?.color }}>
                          {rule.sourceValues.map(v => getCharacteristic(rule.sourceClass, v)?.name).join(', ')}
                        </span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: `${targetClass?.color}20` }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: targetClass?.color }} />
                        <span style={{ color: targetClass?.color }}>{targetClass?.name}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {Object.entries(rule.distribution).map(([charId, prob]) => (
                        <div key={charId} className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">{getCharacteristic(rule.targetClass, charId)?.name}</span>
                          <span className="text-slate-300">{(prob * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProbabilityCalculator;
