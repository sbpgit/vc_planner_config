import React, { useState, useMemo } from 'react';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  Globe, 
  Cpu, 
  Layers, 
  Filter, 
  ChevronDown, 
  ChevronRight,
  Save,
  Edit3,
  Copy,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  Package,
  Sliders,
  GitBranch,
  Shield,
  Zap
} from 'lucide-react';

// Sample initial data structure for a vehicle configuration
const initialProductData = {
  product: {
    id: 'VEHICLE_2025',
    name: 'Premium Vehicle Series 2025',
    description: 'Configurable vehicle platform with multiple options'
  },
  classes: [
    {
      id: 'ENGINE',
      name: 'Engine Configuration',
      description: 'Powertrain options',
      type: 'Class',
      required: true,
      characteristics: [
        { id: 'ENG_1_5T', name: '1.5L Turbo Petrol', code: 'ENG001', active: true },
        { id: 'ENG_2_0T', name: '2.0L Turbo Petrol', code: 'ENG002', active: true },
        { id: 'ENG_2_0D', name: '2.0L Diesel', code: 'ENG003', active: true },
        { id: 'ENG_HYB', name: '1.8L Hybrid', code: 'ENG004', active: true },
        { id: 'ENG_EV', name: 'Full Electric', code: 'ENG005', active: true }
      ]
    },
    {
      id: 'TRANSMISSION',
      name: 'Transmission Type',
      description: 'Gearbox configuration',
      type: 'Class',
      required: true,
      characteristics: [
        { id: 'TRN_M5', name: '5-Speed Manual', code: 'TRN001', active: true },
        { id: 'TRN_M6', name: '6-Speed Manual', code: 'TRN002', active: true },
        { id: 'TRN_A6', name: '6-Speed Auto', code: 'TRN003', active: true },
        { id: 'TRN_A8', name: '8-Speed Auto', code: 'TRN004', active: true },
        { id: 'TRN_CVT', name: 'CVT', code: 'TRN005', active: true },
        { id: 'TRN_EV', name: 'Single-Speed EV', code: 'TRN006', active: true }
      ]
    },
    {
      id: 'STEERING',
      name: 'Steering Position',
      description: 'Driver position configuration',
      type: 'Class',
      required: true,
      characteristics: [
        { id: 'STR_LHD', name: 'Left Hand Drive', code: 'STR001', active: true },
        { id: 'STR_RHD', name: 'Right Hand Drive', code: 'STR002', active: true }
      ]
    },
    {
      id: 'PACKAGE',
      name: 'Equipment Package',
      description: 'Standard equipment levels',
      type: 'Class',
      required: true,
      characteristics: [
        { id: 'PKG_BASE', name: 'Base', code: 'PKG001', active: true },
        { id: 'PKG_COMFORT', name: 'Comfort', code: 'PKG002', active: true },
        { id: 'PKG_PREMIUM', name: 'Premium', code: 'PKG003', active: true },
        { id: 'PKG_SPORT', name: 'Sport', code: 'PKG004', active: true }
      ]
    },
    {
      id: 'WHEELS',
      name: 'Wheel Size',
      description: 'Wheel and tire configuration',
      type: 'Class',
      required: false,
      characteristics: [
        { id: 'WHL_16', name: '16-inch Alloy', code: 'WHL001', active: true },
        { id: 'WHL_17', name: '17-inch Alloy', code: 'WHL002', active: true },
        { id: 'WHL_18', name: '18-inch Alloy', code: 'WHL003', active: true },
        { id: 'WHL_19', name: '19-inch Sport', code: 'WHL004', active: true }
      ]
    }
  ],
  regions: [
    { id: 'EU', name: 'European Union', code: 'EU' },
    { id: 'UK', name: 'United Kingdom', code: 'UK' },
    { id: 'US', name: 'United States', code: 'US' },
    { id: 'JP', name: 'Japan', code: 'JP' },
    { id: 'AU', name: 'Australia', code: 'AU' },
    { id: 'CN', name: 'China', code: 'CN' },
    { id: 'IN', name: 'India', code: 'IN' }
  ],
  restrictions: [
    // EV only with single-speed transmission
    { id: 'R001', name: 'EV Transmission', type: 'REQUIRES', class1: 'ENGINE', char1: 'ENG_EV', class2: 'TRANSMISSION', char2: 'TRN_EV', regions: ['EU', 'UK', 'US', 'JP', 'AU', 'CN', 'IN'], active: true },
    // Hybrid cannot have manual transmission
    { id: 'R002', name: 'Hybrid Auto Only', type: 'EXCLUDES', class1: 'ENGINE', char1: 'ENG_HYB', class2: 'TRANSMISSION', char2: 'TRN_M5', regions: ['EU', 'UK', 'US', 'JP', 'AU', 'CN', 'IN'], active: true },
    { id: 'R003', name: 'Hybrid Auto Only 2', type: 'EXCLUDES', class1: 'ENGINE', char1: 'ENG_HYB', class2: 'TRANSMISSION', char2: 'TRN_M6', regions: ['EU', 'UK', 'US', 'JP', 'AU', 'CN', 'IN'], active: true },
    // US, JP, AU are Left Hand Drive only (US), Right Hand Drive for JP, UK, AU
    { id: 'R004', name: 'US LHD Only', type: 'REQUIRES', class1: 'STEERING', char1: 'STR_LHD', class2: null, char2: null, regions: ['US'], active: true },
    { id: 'R005', name: 'UK RHD Only', type: 'REQUIRES', class1: 'STEERING', char1: 'STR_RHD', class2: null, char2: null, regions: ['UK', 'JP', 'AU'], active: true },
    // Diesel not available in US
    { id: 'R006', name: 'No Diesel US', type: 'EXCLUDES', class1: 'ENGINE', char1: 'ENG_2_0D', class2: null, char2: null, regions: ['US'], active: true },
    // Sport package requires 18" or 19" wheels
    { id: 'R007', name: 'Sport Large Wheels', type: 'EXCLUDES', class1: 'PACKAGE', char1: 'PKG_SPORT', class2: 'WHEELS', char2: 'WHL_16', regions: ['EU', 'UK', 'US', 'JP', 'AU', 'CN', 'IN'], active: true },
    { id: 'R008', name: 'Sport Large Wheels 2', type: 'EXCLUDES', class1: 'PACKAGE', char1: 'PKG_SPORT', class2: 'WHEELS', char2: 'WHL_17', regions: ['EU', 'UK', 'US', 'JP', 'AU', 'CN', 'IN'], active: true },
    // Base package limited to 16" or 17" wheels
    { id: 'R009', name: 'Base Small Wheels', type: 'EXCLUDES', class1: 'PACKAGE', char1: 'PKG_BASE', class2: 'WHEELS', char2: 'WHL_18', regions: ['EU', 'UK', 'US', 'JP', 'AU', 'CN', 'IN'], active: true },
    { id: 'R010', name: 'Base Small Wheels 2', type: 'EXCLUDES', class1: 'PACKAGE', char1: 'PKG_BASE', class2: 'WHEELS', char2: 'WHL_19', regions: ['EU', 'UK', 'US', 'JP', 'AU', 'CN', 'IN'], active: true },
    // EV only available in Premium or Sport package
    { id: 'R011', name: 'EV Premium Only', type: 'EXCLUDES', class1: 'ENGINE', char1: 'ENG_EV', class2: 'PACKAGE', char2: 'PKG_BASE', regions: ['EU', 'UK', 'US', 'JP', 'AU', 'CN', 'IN'], active: true },
    // China-specific: No manual transmission
    { id: 'R012', name: 'CN No Manual', type: 'EXCLUDES', class1: 'TRANSMISSION', char1: 'TRN_M5', class2: null, char2: null, regions: ['CN'], active: true },
    { id: 'R013', name: 'CN No Manual 2', type: 'EXCLUDES', class1: 'TRANSMISSION', char1: 'TRN_M6', class2: null, char2: null, regions: ['CN'], active: true },
    // India: No EV yet
    { id: 'R014', name: 'IN No EV', type: 'EXCLUDES', class1: 'ENGINE', char1: 'ENG_EV', class2: null, char2: null, regions: ['IN'], active: true }
  ]
};

const ProductConfigurationManager = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [productData, setProductData] = useState(initialProductData);
  const [expandedClasses, setExpandedClasses] = useState(['ENGINE']);
  const [selectedRegion, setSelectedRegion] = useState('EU');
  const [configEvaluation, setConfigEvaluation] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(null);
  const [newItemData, setNewItemData] = useState({});

  // Toggle class expansion
  const toggleClassExpansion = (classId) => {
    setExpandedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  // Add new class
  const addClass = () => {
    const newClass = {
      id: `CLASS_${Date.now()}`,
      name: newItemData.name || 'New Class',
      description: newItemData.description || '',
      type: 'Class',
      required: newItemData.required || false,
      characteristics: []
    };
    setProductData(prev => ({
      ...prev,
      classes: [...prev.classes, newClass]
    }));
    setShowAddModal(null);
    setNewItemData({});
  };

  // Add characteristic to class
  const addCharacteristic = (classId) => {
    setProductData(prev => ({
      ...prev,
      classes: prev.classes.map(cls => 
        cls.id === classId
          ? {
              ...cls,
              characteristics: [...cls.characteristics, {
                id: `CHAR_${Date.now()}`,
                name: newItemData.name || 'New Value',
                code: newItemData.code || `CODE${Date.now().toString().slice(-4)}`,
                active: true
              }]
            }
          : cls
      )
    }));
    setShowAddModal(null);
    setNewItemData({});
  };

  // Delete characteristic
  const deleteCharacteristic = (classId, charId) => {
    setProductData(prev => ({
      ...prev,
      classes: prev.classes.map(cls =>
        cls.id === classId
          ? { ...cls, characteristics: cls.characteristics.filter(c => c.id !== charId) }
          : cls
      )
    }));
  };

  // Toggle characteristic active status
  const toggleCharacteristicActive = (classId, charId) => {
    setProductData(prev => ({
      ...prev,
      classes: prev.classes.map(cls =>
        cls.id === classId
          ? {
              ...cls,
              characteristics: cls.characteristics.map(c =>
                c.id === charId ? { ...c, active: !c.active } : c
              )
            }
          : cls
      )
    }));
  };

  // Add restriction
  const addRestriction = () => {
    const newRestriction = {
      id: `R${Date.now()}`,
      name: newItemData.name || 'New Restriction',
      type: newItemData.type || 'EXCLUDES',
      class1: newItemData.class1 || '',
      char1: newItemData.char1 || '',
      class2: newItemData.class2 || null,
      char2: newItemData.char2 || null,
      regions: newItemData.regions || [selectedRegion],
      active: true
    };
    setProductData(prev => ({
      ...prev,
      restrictions: [...prev.restrictions, newRestriction]
    }));
    setShowAddModal(null);
    setNewItemData({});
  };

  // Delete restriction
  const deleteRestriction = (restrictionId) => {
    setProductData(prev => ({
      ...prev,
      restrictions: prev.restrictions.filter(r => r.id !== restrictionId)
    }));
  };

  // Toggle restriction active
  const toggleRestrictionActive = (restrictionId) => {
    setProductData(prev => ({
      ...prev,
      restrictions: prev.restrictions.map(r =>
        r.id === restrictionId ? { ...r, active: !r.active } : r
      )
    }));
  };

  // Update configuration evaluation
  const updateConfigEvaluation = (classId, charId) => {
    setConfigEvaluation(prev => ({
      ...prev,
      [classId]: charId
    }));
  };

  // Evaluate configuration validity
  const evaluateConfiguration = useMemo(() => {
    const result = {
      valid: true,
      violations: [],
      warnings: [],
      availableOptions: {}
    };

    // Check each restriction
    productData.restrictions.filter(r => r.active && r.regions.includes(selectedRegion)).forEach(restriction => {
      const selectedChar1 = configEvaluation[restriction.class1];
      const selectedChar2 = restriction.class2 ? configEvaluation[restriction.class2] : null;

      if (restriction.type === 'REQUIRES') {
        // If char1 is selected, char2 must also be selected (if class2 exists)
        if (selectedChar1 === restriction.char1) {
          if (restriction.class2 && selectedChar2 && selectedChar2 !== restriction.char2) {
            result.valid = false;
            result.violations.push({
              restriction,
              message: `${getCharacteristicName(restriction.class1, restriction.char1)} requires ${getCharacteristicName(restriction.class2, restriction.char2)}`
            });
          }
        }
        // Single class requirement (must select this char in this region)
        if (!restriction.class2 && restriction.char1) {
          if (selectedChar1 && selectedChar1 !== restriction.char1) {
            result.valid = false;
            result.violations.push({
              restriction,
              message: `In ${selectedRegion}, only ${getCharacteristicName(restriction.class1, restriction.char1)} is allowed`
            });
          }
        }
      } else if (restriction.type === 'EXCLUDES') {
        // If char1 is selected, char2 cannot be selected
        if (selectedChar1 === restriction.char1) {
          if (restriction.class2) {
            if (selectedChar2 === restriction.char2) {
              result.valid = false;
              result.violations.push({
                restriction,
                message: `${getCharacteristicName(restriction.class1, restriction.char1)} cannot be combined with ${getCharacteristicName(restriction.class2, restriction.char2)}`
              });
            }
          } else {
            // Single class exclusion (this char not available in this region)
            result.valid = false;
            result.violations.push({
              restriction,
              message: `${getCharacteristicName(restriction.class1, restriction.char1)} is not available in ${selectedRegion}`
            });
          }
        }
      }
    });

    return result;
  }, [configEvaluation, selectedRegion, productData.restrictions]);

  // Get characteristic name helper
  const getCharacteristicName = (classId, charId) => {
    const cls = productData.classes.find(c => c.id === classId);
    if (!cls) return charId;
    const char = cls.characteristics.find(ch => ch.id === charId);
    return char ? char.name : charId;
  };

  // Get class name helper
  const getClassName = (classId) => {
    const cls = productData.classes.find(c => c.id === classId);
    return cls ? cls.name : classId;
  };

  // Check if characteristic is available in region
  const isCharacteristicAvailable = (classId, charId) => {
    const exclusions = productData.restrictions.filter(r => 
      r.active && 
      r.type === 'EXCLUDES' && 
      r.regions.includes(selectedRegion) &&
      r.class1 === classId &&
      r.char1 === charId &&
      !r.class2
    );
    return exclusions.length === 0;
  };

  // Filter restrictions by region
  const filteredRestrictions = useMemo(() => {
    return productData.restrictions.filter(r => {
      if (searchTerm) {
        return r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               r.id.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });
  }, [productData.restrictions, searchTerm]);

  const tabs = [
    { id: 'classes', label: 'Product Features', icon: Layers },
    { id: 'restrictions', label: 'Configuration Rules', icon: Shield },
    { id: 'evaluate', label: 'Evaluate Configuration', icon: Zap },
    { id: 'regions', label: 'Regional Settings', icon: Globe }
  ];

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
    }}>
      {/* Custom Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        .glass-card {
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.1);
        }
        
        .neon-border {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3),
                      inset 0 0 20px rgba(59, 130, 246, 0.1);
        }
        
        .pulse-glow {
          animation: pulseGlow 2s ease-in-out infinite;
        }
        
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.4); }
          50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.6); }
        }
        
        .error-glow {
          animation: errorGlow 1s ease-in-out infinite;
        }
        
        @keyframes errorGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.6); }
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 3px;
        }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }
        
        .tag-chip {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
      `}</style>

      {/* Header */}
      <header className="glass-card border-b border-slate-700/50" style={{ 
        background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
      }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl neon-border" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}>
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Product Configuration Manager
                </h1>
                <p className="text-slate-400 text-sm">Define features, rules & evaluate configurations</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
                <MapPin className="w-4 h-4 text-blue-400" />
                <select 
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer"
                >
                  {productData.regions.map(region => (
                    <option key={region.id} value={region.id} className="bg-slate-800">
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-medium">
                <Save className="w-4 h-4" />
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="glass-card border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'text-blue-400 border-blue-400 bg-blue-500/10'
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Product Features Tab */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Product Feature Classes
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Define configurable features and their characteristic values
                </p>
              </div>
              <button
                onClick={() => setShowAddModal('class')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors text-white text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Feature Class
              </button>
            </div>

            <div className="grid gap-4">
              {productData.classes.map(cls => (
                <div key={cls.id} className="glass-card rounded-xl overflow-hidden hover-lift">
                  {/* Class Header */}
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
                    onClick={() => toggleClassExpansion(cls.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${cls.required ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-white">{cls.name}</h3>
                          <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-700 text-slate-300">
                            {cls.id}
                          </span>
                          {cls.required && (
                            <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mt-0.5">{cls.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400 text-sm">
                        {cls.characteristics.filter(c => c.active).length} / {cls.characteristics.length} active
                      </span>
                      {expandedClasses.includes(cls.id) ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Characteristics List */}
                  {expandedClasses.includes(cls.id) && (
                    <div className="border-t border-slate-700/50 p-4 bg-slate-800/30">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-slate-300">Characteristic Values</h4>
                        <button
                          onClick={() => {
                            setShowAddModal(`char_${cls.id}`);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Add Value
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {cls.characteristics.map(char => {
                          const available = isCharacteristicAvailable(cls.id, char.id);
                          return (
                            <div 
                              key={char.id}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                char.active && available
                                  ? 'bg-slate-700/50 border-slate-600 hover:border-blue-500/50'
                                  : 'bg-slate-800/50 border-slate-700/50 opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleCharacteristicActive(cls.id, char.id)}
                                  className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                                    char.active ? 'bg-green-500 text-white' : 'bg-slate-600'
                                  }`}
                                >
                                  {char.active && <Check className="w-3 h-3" />}
                                </button>
                                <div>
                                  <p className={`text-sm font-medium ${char.active ? 'text-white' : 'text-slate-500'}`}>
                                    {char.name}
                                  </p>
                                  <p className="text-xs font-mono text-slate-500">{char.code}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {!available && (
                                  <span className="text-xs text-red-400" title={`Not available in ${selectedRegion}`}>
                                    <AlertTriangle className="w-4 h-4" />
                                  </span>
                                )}
                                <button
                                  onClick={() => deleteCharacteristic(cls.id, char.id)}
                                  className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuration Rules Tab */}
        {activeTab === 'restrictions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Configuration Rules & Restrictions
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Define which combinations are allowed or prohibited by region
                </p>
              </div>
              <button
                onClick={() => setShowAddModal('restriction')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors text-white text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Rule
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Rules List */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Rule Name</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Type</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Condition</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Regions</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredRestrictions.map(restriction => (
                      <tr key={restriction.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleRestrictionActive(restriction.id)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                              restriction.active 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-slate-700 text-slate-500'
                            }`}
                          >
                            {restriction.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-white">{restriction.name}</p>
                            <p className="text-xs font-mono text-slate-500">{restriction.id}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            restriction.type === 'REQUIRES'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {restriction.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="tag-chip px-2 py-1 rounded text-blue-300">
                              {getCharacteristicName(restriction.class1, restriction.char1)}
                            </span>
                            <span className="text-slate-500">
                              {restriction.type === 'REQUIRES' ? '→' : '✕'}
                            </span>
                            {restriction.class2 ? (
                              <span className="tag-chip px-2 py-1 rounded text-purple-300">
                                {getCharacteristicName(restriction.class2, restriction.char2)}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-xs italic">
                                (Region restriction)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {restriction.regions.slice(0, 3).map(region => (
                              <span 
                                key={region} 
                                className={`px-1.5 py-0.5 rounded text-xs ${
                                  region === selectedRegion
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-slate-700 text-slate-400'
                                }`}
                              >
                                {region}
                              </span>
                            ))}
                            {restriction.regions.length > 3 && (
                              <span className="px-1.5 py-0.5 rounded text-xs bg-slate-700 text-slate-400">
                                +{restriction.regions.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteRestriction(restriction.id)}
                              className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Evaluate Configuration Tab */}
        {activeTab === 'evaluate' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Configuration Evaluator
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Select options to validate configuration for <span className="text-blue-400 font-medium">{selectedRegion}</span>
                </p>
              </div>
              <button
                onClick={() => setConfigEvaluation({})}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-white text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Clear Selection
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configuration Selector */}
              <div className="lg:col-span-2 space-y-4">
                {productData.classes.map(cls => (
                  <div key={cls.id} className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${cls.required ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                        <Sliders className="w-4 h-4" />
                      </div>
                      <h3 className="text-lg font-medium text-white">{cls.name}</h3>
                      {cls.required && (
                        <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {cls.characteristics.filter(c => c.active).map(char => {
                        const available = isCharacteristicAvailable(cls.id, char.id);
                        const selected = configEvaluation[cls.id] === char.id;
                        
                        return (
                          <button
                            key={char.id}
                            onClick={() => available && updateConfigEvaluation(cls.id, char.id)}
                            disabled={!available}
                            className={`p-3 rounded-lg text-left transition-all ${
                              selected
                                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                : available
                                  ? 'bg-slate-700/50 text-slate-200 hover:bg-slate-700 hover:text-white'
                                  : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{char.name}</span>
                              {!available && <AlertTriangle className="w-4 h-4 text-red-400" />}
                              {selected && <Check className="w-4 h-4" />}
                            </div>
                            <span className="text-xs font-mono opacity-60">{char.code}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Validation Result */}
              <div className="space-y-4">
                {/* Status Card */}
                <div className={`glass-card rounded-xl p-6 ${
                  evaluateConfiguration.valid ? 'pulse-glow' : 'error-glow'
                }`} style={{
                  background: evaluateConfiguration.valid 
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)'
                }}>
                  <div className="flex items-center gap-4 mb-4">
                    {evaluateConfiguration.valid ? (
                      <CheckCircle2 className="w-12 h-12 text-green-400" />
                    ) : (
                      <XCircle className="w-12 h-12 text-red-400" />
                    )}
                    <div>
                      <h3 className={`text-xl font-bold ${evaluateConfiguration.valid ? 'text-green-400' : 'text-red-400'}`}>
                        {evaluateConfiguration.valid ? 'Valid Configuration' : 'Invalid Configuration'}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {evaluateConfiguration.violations.length} rule violations
                      </p>
                    </div>
                  </div>
                </div>

                {/* Selected Configuration */}
                <div className="glass-card rounded-xl p-4">
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Current Selection</h4>
                  <div className="space-y-2">
                    {productData.classes.map(cls => {
                      const selected = configEvaluation[cls.id];
                      return (
                        <div key={cls.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                          <span className="text-sm text-slate-400">{cls.name}</span>
                          {selected ? (
                            <span className="text-sm font-medium text-white">
                              {getCharacteristicName(cls.id, selected)}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-500 italic">Not selected</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Violations */}
                {evaluateConfiguration.violations.length > 0 && (
                  <div className="glass-card rounded-xl p-4">
                    <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Rule Violations
                    </h4>
                    <div className="space-y-2">
                      {evaluateConfiguration.violations.map((violation, index) => (
                        <div key={index} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                          <p className="text-sm text-red-300">{violation.message}</p>
                          <p className="text-xs text-slate-500 mt-1 font-mono">
                            Rule: {violation.restriction.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Regional Settings Tab */}
        {activeTab === 'regions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Regional Configuration Summary
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Overview of restrictions and available options by region
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {productData.regions.map(region => {
                const regionRestrictions = productData.restrictions.filter(r => 
                  r.active && r.regions.includes(region.id)
                );
                const exclusions = regionRestrictions.filter(r => r.type === 'EXCLUDES' && !r.class2);
                const requirements = regionRestrictions.filter(r => r.type === 'REQUIRES' && !r.class2);
                
                return (
                  <div 
                    key={region.id}
                    className={`glass-card rounded-xl p-4 hover-lift cursor-pointer transition-all ${
                      selectedRegion === region.id 
                        ? 'ring-2 ring-blue-500 bg-blue-500/5' 
                        : ''
                    }`}
                    onClick={() => setSelectedRegion(region.id)}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedRegion === region.id 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{region.name}</h3>
                        <span className="text-xs font-mono text-slate-500">{region.code}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Total Rules</span>
                        <span className="text-sm font-medium text-white">{regionRestrictions.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Exclusions</span>
                        <span className="text-sm font-medium text-red-400">{exclusions.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Requirements</span>
                        <span className="text-sm font-medium text-blue-400">{requirements.length}</span>
                      </div>
                    </div>

                    {exclusions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <h4 className="text-xs font-medium text-slate-500 mb-2">Not Available:</h4>
                        <div className="flex flex-wrap gap-1">
                          {exclusions.slice(0, 3).map(ex => (
                            <span key={ex.id} className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">
                              {getCharacteristicName(ex.class1, ex.char1)}
                            </span>
                          ))}
                          {exclusions.length > 3 && (
                            <span className="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-400">
                              +{exclusions.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Detailed Region View */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Detailed Rules for {productData.regions.find(r => r.id === selectedRegion)?.name}
              </h3>
              <div className="grid gap-3">
                {productData.restrictions
                  .filter(r => r.active && r.regions.includes(selectedRegion))
                  .map(restriction => (
                    <div key={restriction.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        restriction.type === 'REQUIRES'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {restriction.type}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-white">{restriction.name}</p>
                        <p className="text-xs text-slate-400">
                          {getCharacteristicName(restriction.class1, restriction.char1)}
                          {restriction.class2 && (
                            <> → {getCharacteristicName(restriction.class2, restriction.char2)}</>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl p-6 w-full max-w-lg mx-4 neon-border">
            <h3 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {showAddModal === 'class' && 'Add Feature Class'}
              {showAddModal === 'restriction' && 'Add Configuration Rule'}
              {showAddModal.startsWith('char_') && 'Add Characteristic Value'}
            </h3>

            {/* Add Class Form */}
            {showAddModal === 'class' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Class Name</label>
                  <input
                    type="text"
                    value={newItemData.name || ''}
                    onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Interior Color"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                  <input
                    type="text"
                    value={newItemData.description || ''}
                    onChange={(e) => setNewItemData({ ...newItemData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Interior color options"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={newItemData.required || false}
                    onChange={(e) => setNewItemData({ ...newItemData, required: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="required" className="text-sm text-slate-400">Required Selection</label>
                </div>
              </div>
            )}

            {/* Add Characteristic Form */}
            {showAddModal.startsWith('char_') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Value Name</label>
                  <input
                    type="text"
                    value={newItemData.name || ''}
                    onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Midnight Black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Code</label>
                  <input
                    type="text"
                    value={newItemData.code || ''}
                    onChange={(e) => setNewItemData({ ...newItemData, code: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., COL001"
                  />
                </div>
              </div>
            )}

            {/* Add Restriction Form */}
            {showAddModal === 'restriction' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Rule Name</label>
                  <input
                    type="text"
                    value={newItemData.name || ''}
                    onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., EV Premium Only"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Rule Type</label>
                  <select
                    value={newItemData.type || 'EXCLUDES'}
                    onChange={(e) => setNewItemData({ ...newItemData, type: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="EXCLUDES">EXCLUDES (Cannot combine)</option>
                    <option value="REQUIRES">REQUIRES (Must combine)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Class 1</label>
                    <select
                      value={newItemData.class1 || ''}
                      onChange={(e) => setNewItemData({ ...newItemData, class1: e.target.value, char1: '' })}
                      className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select class...</option>
                      {productData.classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Value 1</label>
                    <select
                      value={newItemData.char1 || ''}
                      onChange={(e) => setNewItemData({ ...newItemData, char1: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                      disabled={!newItemData.class1}
                    >
                      <option value="">Select value...</option>
                      {newItemData.class1 && productData.classes
                        .find(c => c.id === newItemData.class1)
                        ?.characteristics.map(char => (
                          <option key={char.id} value={char.id}>{char.name}</option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Class 2 (Optional)</label>
                    <select
                      value={newItemData.class2 || ''}
                      onChange={(e) => setNewItemData({ ...newItemData, class2: e.target.value || null, char2: '' })}
                      className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">None (Region restriction)</option>
                      {productData.classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Value 2</label>
                    <select
                      value={newItemData.char2 || ''}
                      onChange={(e) => setNewItemData({ ...newItemData, char2: e.target.value || null })}
                      className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                      disabled={!newItemData.class2}
                    >
                      <option value="">Select value...</option>
                      {newItemData.class2 && productData.classes
                        .find(c => c.id === newItemData.class2)
                        ?.characteristics.map(char => (
                          <option key={char.id} value={char.id}>{char.name}</option>
                        ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Applicable Regions</label>
                  <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-slate-800 border border-slate-700">
                    {productData.regions.map(region => (
                      <label key={region.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(newItemData.regions || []).includes(region.id)}
                          onChange={(e) => {
                            const current = newItemData.regions || [];
                            if (e.target.checked) {
                              setNewItemData({ ...newItemData, regions: [...current, region.id] });
                            } else {
                              setNewItemData({ ...newItemData, regions: current.filter(r => r !== region.id) });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-slate-300">{region.code}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(null);
                  setNewItemData({});
                }}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showAddModal === 'class') addClass();
                  else if (showAddModal === 'restriction') addRestriction();
                  else if (showAddModal.startsWith('char_')) {
                    const classId = showAddModal.replace('char_', '');
                    addCharacteristic(classId);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductConfigurationManager;
