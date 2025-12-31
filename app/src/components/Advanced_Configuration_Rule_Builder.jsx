import React, { useState, useMemo, useCallback } from 'react';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  Globe, 
  Layers, 
  ChevronDown, 
  ChevronRight,
  Save,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  Package,
  Sliders,
  Shield,
  Zap,
  GripVertical,
  ArrowRight,
  Link2,
  Unlink,
  Copy,
  Play,
  PlusCircle,
  MinusCircle,
  Move,
  Target,
  GitBranch,
  Workflow
} from 'lucide-react';

// Initial product data
const initialProductData = {
  product: {
    id: 'VEHICLE_2025',
    name: 'Premium Vehicle Series 2025',
    description: 'Configurable vehicle platform with multiple options'
  },
  classes: [
    {
      id: 'ENGINE',
      name: 'Engine',
      color: '#3b82f6',
      required: true,
      characteristics: [
        { id: 'ENG_1_5T', name: '1.5L Turbo', code: 'ENG001' },
        { id: 'ENG_2_0T', name: '2.0L Turbo', code: 'ENG002' },
        { id: 'ENG_2_0D', name: '2.0L Diesel', code: 'ENG003' },
        { id: 'ENG_HYB', name: '1.8L Hybrid', code: 'ENG004' },
        { id: 'ENG_EV', name: 'Full Electric', code: 'ENG005' }
      ]
    },
    {
      id: 'TRANSMISSION',
      name: 'Transmission',
      color: '#8b5cf6',
      required: true,
      characteristics: [
        { id: 'TRN_M5', name: '5-Speed Manual', code: 'TRN001' },
        { id: 'TRN_M6', name: '6-Speed Manual', code: 'TRN002' },
        { id: 'TRN_A6', name: '6-Speed Auto', code: 'TRN003' },
        { id: 'TRN_A8', name: '8-Speed Auto', code: 'TRN004' },
        { id: 'TRN_CVT', name: 'CVT', code: 'TRN005' },
        { id: 'TRN_EV', name: 'Single-Speed EV', code: 'TRN006' }
      ]
    },
    {
      id: 'STEERING',
      name: 'Steering',
      color: '#10b981',
      required: true,
      characteristics: [
        { id: 'STR_LHD', name: 'Left Hand Drive', code: 'STR001' },
        { id: 'STR_RHD', name: 'Right Hand Drive', code: 'STR002' }
      ]
    },
    {
      id: 'PACKAGE',
      name: 'Package',
      color: '#f59e0b',
      required: true,
      characteristics: [
        { id: 'PKG_BASE', name: 'Base', code: 'PKG001' },
        { id: 'PKG_COMFORT', name: 'Comfort', code: 'PKG002' },
        { id: 'PKG_PREMIUM', name: 'Premium', code: 'PKG003' },
        { id: 'PKG_SPORT', name: 'Sport', code: 'PKG004' }
      ]
    },
    {
      id: 'WHEELS',
      name: 'Wheels',
      color: '#ec4899',
      required: false,
      characteristics: [
        { id: 'WHL_16', name: '16" Alloy', code: 'WHL001' },
        { id: 'WHL_17', name: '17" Alloy', code: 'WHL002' },
        { id: 'WHL_18', name: '18" Alloy', code: 'WHL003' },
        { id: 'WHL_19', name: '19" Sport', code: 'WHL004' }
      ]
    },
    {
      id: 'DRIVETRAIN',
      name: 'Drivetrain',
      color: '#06b6d4',
      required: false,
      characteristics: [
        { id: 'DRV_FWD', name: 'Front Wheel Drive', code: 'DRV001' },
        { id: 'DRV_RWD', name: 'Rear Wheel Drive', code: 'DRV002' },
        { id: 'DRV_AWD', name: 'All Wheel Drive', code: 'DRV003' }
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
  rules: [
    {
      id: 'RULE_001',
      name: 'EV Powertrain Configuration',
      description: 'Electric vehicles require specific transmission and drivetrain',
      active: true,
      regions: ['EU', 'UK', 'US', 'JP', 'AU', 'CN'],
      conditions: [
        { id: 'c1', classId: 'ENGINE', operator: 'EQUALS', values: ['ENG_EV'], logic: 'AND' }
      ],
      results: [
        { id: 'r1', classId: 'TRANSMISSION', operator: 'MUST_BE', values: ['TRN_EV'] },
        { id: 'r2', classId: 'PACKAGE', operator: 'MUST_BE_ONE_OF', values: ['PKG_PREMIUM', 'PKG_SPORT'] }
      ]
    },
    {
      id: 'RULE_002',
      name: 'Hybrid Transmission Restriction',
      description: 'Hybrid engines cannot use manual transmission',
      active: true,
      regions: ['EU', 'UK', 'US', 'JP', 'AU', 'CN', 'IN'],
      conditions: [
        { id: 'c1', classId: 'ENGINE', operator: 'EQUALS', values: ['ENG_HYB'], logic: 'AND' }
      ],
      results: [
        { id: 'r1', classId: 'TRANSMISSION', operator: 'CANNOT_BE', values: ['TRN_M5', 'TRN_M6'] }
      ]
    },
    {
      id: 'RULE_003',
      name: 'Sport Package Requirements',
      description: 'Sport package requires large wheels and specific drivetrains',
      active: true,
      regions: ['EU', 'UK', 'US', 'JP', 'AU', 'CN', 'IN'],
      conditions: [
        { id: 'c1', classId: 'PACKAGE', operator: 'EQUALS', values: ['PKG_SPORT'], logic: 'AND' }
      ],
      results: [
        { id: 'r1', classId: 'WHEELS', operator: 'MUST_BE_ONE_OF', values: ['WHL_18', 'WHL_19'] },
        { id: 'r2', classId: 'DRIVETRAIN', operator: 'MUST_BE_ONE_OF', values: ['DRV_RWD', 'DRV_AWD'] }
      ]
    },
    {
      id: 'RULE_004',
      name: 'US Market Configuration',
      description: 'US specific requirements',
      active: true,
      regions: ['US'],
      conditions: [],
      results: [
        { id: 'r1', classId: 'STEERING', operator: 'MUST_BE', values: ['STR_LHD'] },
        { id: 'r2', classId: 'ENGINE', operator: 'CANNOT_BE', values: ['ENG_2_0D'] }
      ]
    },
    {
      id: 'RULE_005',
      name: 'UK/JP/AU Market Configuration',
      description: 'Right-hand drive markets',
      active: true,
      regions: ['UK', 'JP', 'AU'],
      conditions: [],
      results: [
        { id: 'r1', classId: 'STEERING', operator: 'MUST_BE', values: ['STR_RHD'] }
      ]
    },
    {
      id: 'RULE_006',
      name: 'Performance Engine AWD',
      description: '2.0L Turbo with Sport package requires AWD',
      active: true,
      regions: ['EU', 'UK', 'US', 'JP', 'AU', 'CN'],
      conditions: [
        { id: 'c1', classId: 'ENGINE', operator: 'EQUALS', values: ['ENG_2_0T'], logic: 'AND' },
        { id: 'c2', classId: 'PACKAGE', operator: 'EQUALS', values: ['PKG_SPORT'], logic: 'AND' }
      ],
      results: [
        { id: 'r1', classId: 'DRIVETRAIN', operator: 'MUST_BE', values: ['DRV_AWD'] },
        { id: 'r2', classId: 'TRANSMISSION', operator: 'MUST_BE_ONE_OF', values: ['TRN_A8'] }
      ]
    }
  ]
};

const AdvancedConfigManager = () => {
  const [activeTab, setActiveTab] = useState('rules');
  const [productData, setProductData] = useState(initialProductData);
  const [selectedRegion, setSelectedRegion] = useState('EU');
  const [configEvaluation, setConfigEvaluation] = useState({});
  const [expandedRules, setExpandedRules] = useState(['RULE_001']);
  const [editingRule, setEditingRule] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverTarget, setDragOverTarget] = useState(null);

  // Drag and drop handlers
  const handleDragStart = (e, item, type) => {
    setDraggedItem({ ...item, dragType: type });
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', JSON.stringify({ ...item, dragType: type }));
  };

  const handleDragOver = (e, targetId, targetType) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverTarget({ id: targetId, type: targetType });
  };

  const handleDragLeave = () => {
    setDragOverTarget(null);
  };

  const handleDrop = (e, ruleId, targetType) => {
    e.preventDefault();
    setDragOverTarget(null);
    
    if (!draggedItem) return;

    if (targetType === 'conditions' && draggedItem.dragType === 'characteristic') {
      addConditionFromDrop(ruleId, draggedItem);
    } else if (targetType === 'results' && draggedItem.dragType === 'characteristic') {
      addResultFromDrop(ruleId, draggedItem);
    } else if (targetType === 'conditions' && draggedItem.dragType === 'class') {
      // Add all characteristics from class as options
      addConditionFromClassDrop(ruleId, draggedItem);
    } else if (targetType === 'results' && draggedItem.dragType === 'class') {
      addResultFromClassDrop(ruleId, draggedItem);
    }

    setDraggedItem(null);
  };

  const addConditionFromDrop = (ruleId, item) => {
    setProductData(prev => ({
      ...prev,
      rules: prev.rules.map(rule => {
        if (rule.id !== ruleId) return rule;
        
        const existingCondition = rule.conditions.find(c => c.classId === item.classId);
        if (existingCondition) {
          // Add to existing condition values
          if (!existingCondition.values.includes(item.id)) {
            return {
              ...rule,
              conditions: rule.conditions.map(c =>
                c.id === existingCondition.id
                  ? { ...c, values: [...c.values, item.id] }
                  : c
              )
            };
          }
          return rule;
        } else {
          // Create new condition
          return {
            ...rule,
            conditions: [...rule.conditions, {
              id: `c${Date.now()}`,
              classId: item.classId,
              operator: 'EQUALS',
              values: [item.id],
              logic: 'AND'
            }]
          };
        }
      })
    }));
  };

  const addConditionFromClassDrop = (ruleId, item) => {
    setProductData(prev => ({
      ...prev,
      rules: prev.rules.map(rule => {
        if (rule.id !== ruleId) return rule;
        
        const existingCondition = rule.conditions.find(c => c.classId === item.id);
        if (existingCondition) return rule;
        
        return {
          ...rule,
          conditions: [...rule.conditions, {
            id: `c${Date.now()}`,
            classId: item.id,
            operator: 'EQUALS',
            values: [],
            logic: 'AND'
          }]
        };
      })
    }));
  };

  const addResultFromDrop = (ruleId, item) => {
    setProductData(prev => ({
      ...prev,
      rules: prev.rules.map(rule => {
        if (rule.id !== ruleId) return rule;
        
        const existingResult = rule.results.find(r => r.classId === item.classId);
        if (existingResult) {
          if (!existingResult.values.includes(item.id)) {
            return {
              ...rule,
              results: rule.results.map(r =>
                r.id === existingResult.id
                  ? { ...r, values: [...r.values, item.id] }
                  : r
              )
            };
          }
          return rule;
        } else {
          return {
            ...rule,
            results: [...rule.results, {
              id: `r${Date.now()}`,
              classId: item.classId,
              operator: 'MUST_BE',
              values: [item.id]
            }]
          };
        }
      })
    }));
  };

  const addResultFromClassDrop = (ruleId, item) => {
    setProductData(prev => ({
      ...prev,
      rules: prev.rules.map(rule => {
        if (rule.id !== ruleId) return rule;
        
        const existingResult = rule.results.find(r => r.classId === item.id);
        if (existingResult) return rule;
        
        return {
          ...rule,
          results: [...rule.results, {
            id: `r${Date.now()}`,
            classId: item.id,
            operator: 'MUST_BE',
            values: []
          }]
        };
      })
    }));
  };

  const removeCondition = (ruleId, conditionId) => {
    setProductData(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === ruleId
          ? { ...rule, conditions: rule.conditions.filter(c => c.id !== conditionId) }
          : rule
      )
    }));
  };

  const removeResult = (ruleId, resultId) => {
    setProductData(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === ruleId
          ? { ...rule, results: rule.results.filter(r => r.id !== resultId) }
          : rule
      )
    }));
  };

  const removeValueFromCondition = (ruleId, conditionId, valueId) => {
    setProductData(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === ruleId
          ? {
              ...rule,
              conditions: rule.conditions.map(c =>
                c.id === conditionId
                  ? { ...c, values: c.values.filter(v => v !== valueId) }
                  : c
              )
            }
          : rule
      )
    }));
  };

  const removeValueFromResult = (ruleId, resultId, valueId) => {
    setProductData(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === ruleId
          ? {
              ...rule,
              results: rule.results.map(r =>
                r.id === resultId
                  ? { ...r, values: r.values.filter(v => v !== valueId) }
                  : r
              )
            }
          : rule
      )
    }));
  };

  const updateConditionOperator = (ruleId, conditionId, operator) => {
    setProductData(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === ruleId
          ? {
              ...rule,
              conditions: rule.conditions.map(c =>
                c.id === conditionId ? { ...c, operator } : c
              )
            }
          : rule
      )
    }));
  };

  const updateConditionLogic = (ruleId, conditionId, logic) => {
    setProductData(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === ruleId
          ? {
              ...rule,
              conditions: rule.conditions.map(c =>
                c.id === conditionId ? { ...c, logic } : c
              )
            }
          : rule
      )
    }));
  };

  const updateResultOperator = (ruleId, resultId, operator) => {
    setProductData(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === ruleId
          ? {
              ...rule,
              results: rule.results.map(r =>
                r.id === resultId ? { ...r, operator } : r
              )
            }
          : rule
      )
    }));
  };

  const toggleRuleRegion = (ruleId, regionId) => {
    setProductData(prev => ({
      ...prev,
      rules: prev.rules.map(rule => {
        if (rule.id !== ruleId) return rule;
        const hasRegion = rule.regions.includes(regionId);
        return {
          ...rule,
          regions: hasRegion
            ? rule.regions.filter(r => r !== regionId)
            : [...rule.regions, regionId]
        };
      })
    }));
  };

  const addNewRule = () => {
    const newRule = {
      id: `RULE_${Date.now()}`,
      name: 'New Configuration Rule',
      description: 'Drag features to define conditions and results',
      active: true,
      regions: [...productData.regions.map(r => r.id)],
      conditions: [],
      results: []
    };
    setProductData(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }));
    setExpandedRules(prev => [...prev, newRule.id]);
  };

  const deleteRule = (ruleId) => {
    setProductData(prev => ({
      ...prev,
      rules: prev.rules.filter(r => r.id !== ruleId)
    }));
  };

  const toggleRuleActive = (ruleId) => {
    setProductData(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === ruleId ? { ...rule, active: !rule.active } : rule
      )
    }));
  };

  const duplicateRule = (ruleId) => {
    const rule = productData.rules.find(r => r.id === ruleId);
    if (!rule) return;
    
    const newRule = {
      ...rule,
      id: `RULE_${Date.now()}`,
      name: `${rule.name} (Copy)`,
      conditions: rule.conditions.map(c => ({ ...c, id: `c${Date.now()}${Math.random()}` })),
      results: rule.results.map(r => ({ ...r, id: `r${Date.now()}${Math.random()}` }))
    };
    
    setProductData(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }));
  };

  const updateRuleName = (ruleId, name) => {
    setProductData(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === ruleId ? { ...rule, name } : rule
      )
    }));
  };

  const updateRuleDescription = (ruleId, description) => {
    setProductData(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === ruleId ? { ...rule, description } : rule
      )
    }));
  };

  // Get class by ID
  const getClass = (classId) => productData.classes.find(c => c.id === classId);

  // Get characteristic by ID
  const getCharacteristic = (classId, charId) => {
    const cls = getClass(classId);
    return cls?.characteristics.find(c => c.id === charId);
  };

  // Evaluate configuration
  const evaluateConfig = useMemo(() => {
    const result = { valid: true, violations: [], warnings: [] };
    
    const activeRules = productData.rules.filter(r => 
      r.active && r.regions.includes(selectedRegion)
    );

    activeRules.forEach(rule => {
      // Check if conditions are met
      let conditionsMet = true;
      
      if (rule.conditions.length > 0) {
        conditionsMet = rule.conditions.every(condition => {
          const selectedValue = configEvaluation[condition.classId];
          if (!selectedValue) return false;
          
          switch (condition.operator) {
            case 'EQUALS':
              return condition.values.includes(selectedValue);
            case 'NOT_EQUALS':
              return !condition.values.includes(selectedValue);
            case 'ONE_OF':
              return condition.values.includes(selectedValue);
            default:
              return false;
          }
        });
      }

      // If conditions are met (or no conditions), apply results
      if (conditionsMet || rule.conditions.length === 0) {
        rule.results.forEach(res => {
          const selectedValue = configEvaluation[res.classId];
          
          switch (res.operator) {
            case 'MUST_BE':
              if (selectedValue && !res.values.includes(selectedValue)) {
                result.valid = false;
                result.violations.push({
                  rule,
                  message: `${getClass(res.classId)?.name} must be ${res.values.map(v => getCharacteristic(res.classId, v)?.name).join(' or ')}`
                });
              }
              break;
            case 'MUST_BE_ONE_OF':
              if (selectedValue && !res.values.includes(selectedValue)) {
                result.valid = false;
                result.violations.push({
                  rule,
                  message: `${getClass(res.classId)?.name} must be one of: ${res.values.map(v => getCharacteristic(res.classId, v)?.name).join(', ')}`
                });
              }
              break;
            case 'CANNOT_BE':
              if (selectedValue && res.values.includes(selectedValue)) {
                result.valid = false;
                result.violations.push({
                  rule,
                  message: `${getClass(res.classId)?.name} cannot be ${getCharacteristic(res.classId, selectedValue)?.name}`
                });
              }
              break;
          }
        });
      }
    });

    return result;
  }, [configEvaluation, selectedRegion, productData.rules]);

  // Get restricted values for a class
  const getRestrictedValues = (classId) => {
    const restricted = new Set();
    
    productData.rules
      .filter(r => r.active && r.regions.includes(selectedRegion))
      .forEach(rule => {
        // Check unconditional restrictions
        if (rule.conditions.length === 0) {
          rule.results.forEach(res => {
            if (res.classId === classId && res.operator === 'CANNOT_BE') {
              res.values.forEach(v => restricted.add(v));
            }
          });
        }
        
        // Check conditional restrictions where conditions are met
        const conditionsMet = rule.conditions.length === 0 || rule.conditions.every(cond => {
          const selected = configEvaluation[cond.classId];
          return selected && cond.values.includes(selected);
        });
        
        if (conditionsMet) {
          rule.results.forEach(res => {
            if (res.classId === classId && res.operator === 'CANNOT_BE') {
              res.values.forEach(v => restricted.add(v));
            }
          });
        }
      });

    return restricted;
  };

  const tabs = [
    { id: 'rules', label: 'Rule Builder', icon: Workflow },
    { id: 'evaluate', label: 'Test Configuration', icon: Play },
    { id: 'features', label: 'Features', icon: Layers }
  ];

  const operatorLabels = {
    'EQUALS': 'equals',
    'NOT_EQUALS': 'not equals',
    'ONE_OF': 'is one of',
    'MUST_BE': 'must be',
    'MUST_BE_ONE_OF': 'must be one of',
    'CANNOT_BE': 'cannot be'
  };

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(145deg, #0c0f1a 0%, #1a1f35 50%, #0f1629 100%)',
      fontFamily: "'Inter', -apple-system, sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        .glass { background: rgba(26, 31, 53, 0.8); backdrop-filter: blur(20px); }
        .glass-darker { background: rgba(15, 22, 41, 0.9); backdrop-filter: blur(20px); }
        
        .drag-item { cursor: grab; user-select: none; }
        .drag-item:active { cursor: grabbing; }
        
        .drop-zone {
          border: 2px dashed rgba(99, 102, 241, 0.3);
          transition: all 0.3s ease;
        }
        .drop-zone.active {
          border-color: rgba(99, 102, 241, 0.8);
          background: rgba(99, 102, 241, 0.1);
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.2);
        }
        
        .feature-chip {
          transition: all 0.2s ease;
        }
        .feature-chip:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }
        
        .rule-card {
          transition: all 0.3s ease;
          border: 1px solid rgba(99, 102, 241, 0.1);
        }
        .rule-card:hover {
          border-color: rgba(99, 102, 241, 0.3);
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        
        .connector-line {
          position: relative;
        }
        .connector-line::before {
          content: '';
          position: absolute;
          left: 50%;
          top: -20px;
          height: 20px;
          width: 2px;
          background: linear-gradient(to bottom, transparent, rgba(99, 102, 241, 0.5));
        }
        
        .glow-green { box-shadow: 0 0 30px rgba(34, 197, 94, 0.3); }
        .glow-red { box-shadow: 0 0 30px rgba(239, 68, 68, 0.3); }
        
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        .value-tag {
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Header */}
      <header className="glass border-b border-indigo-500/20">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" 
                   style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Configuration Rule Builder</h1>
                <p className="text-slate-400 text-sm">Drag & drop to create complex configuration rules</p>
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
                  {productData.regions.map(region => (
                    <option key={region.id} value={region.id} className="bg-slate-900">
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                <Save className="w-4 h-4" />
                Save Rules
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="glass border-b border-slate-700/30">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'text-indigo-400 border-indigo-400 bg-indigo-500/10'
                      : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800/30'
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

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Rule Builder Tab */}
        {activeTab === 'rules' && (
          <div className="flex gap-6">
            {/* Feature Palette */}
            <div className="w-72 flex-shrink-0">
              <div className="glass rounded-2xl p-4 sticky top-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-400" />
                  Feature Palette
                </h3>
                <p className="text-xs text-slate-400 mb-4">Drag features or values to the rule builder</p>
                
                <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-hide">
                  {productData.classes.map(cls => (
                    <div key={cls.id} className="rounded-xl overflow-hidden" style={{ background: 'rgba(15, 22, 41, 0.6)' }}>
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, { id: cls.id, name: cls.name, color: cls.color }, 'class')}
                        className="flex items-center gap-3 p-3 cursor-grab hover:bg-slate-800/50 transition-colors drag-item"
                      >
                        <div className="w-3 h-3 rounded-full" style={{ background: cls.color }} />
                        <span className="text-sm font-medium text-white flex-1">{cls.name}</span>
                        <GripVertical className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="px-2 pb-2 grid grid-cols-1 gap-1">
                        {cls.characteristics.map(char => (
                          <div
                            key={char.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, { ...char, classId: cls.id, classColor: cls.color }, 'characteristic')}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs cursor-grab hover:bg-slate-700/50 transition-colors drag-item feature-chip"
                            style={{ background: `${cls.color}15`, border: `1px solid ${cls.color}30` }}
                          >
                            <Move className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-200 truncate">{char.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rules List */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Configuration Rules</h2>
                <button
                  onClick={addNewRule}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                  <Plus className="w-4 h-4" />
                  Add Rule
                </button>
              </div>

              {productData.rules.map((rule, ruleIndex) => (
                <div 
                  key={rule.id}
                  className={`glass rounded-2xl overflow-hidden rule-card ${!rule.active ? 'opacity-60' : ''}`}
                >
                  {/* Rule Header */}
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                    onClick={() => setExpandedRules(prev => 
                      prev.includes(rule.id) ? prev.filter(id => id !== rule.id) : [...prev, rule.id]
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleRuleActive(rule.id); }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          rule.active 
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                            : 'bg-slate-700 text-slate-500 hover:bg-slate-600'
                        }`}
                      >
                        {rule.active ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                      </button>
                      <div>
                        <input
                          value={rule.name}
                          onChange={(e) => updateRuleName(rule.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="text-lg font-semibold text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1 -ml-1"
                        />
                        <p className="text-sm text-slate-400">{rule.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {rule.regions.slice(0, 4).map(regionId => (
                          <span 
                            key={regionId}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              regionId === selectedRegion
                                ? 'bg-indigo-500/30 text-indigo-300'
                                : 'bg-slate-700/50 text-slate-400'
                            }`}
                          >
                            {regionId}
                          </span>
                        ))}
                        {rule.regions.length > 4 && (
                          <span className="px-2 py-1 rounded text-xs bg-slate-700/50 text-slate-400">
                            +{rule.regions.length - 4}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); duplicateRule(rule.id); }}
                          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteRule(rule.id); }}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {expandedRules.includes(rule.id) ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Rule Body */}
                  {expandedRules.includes(rule.id) && (
                    <div className="p-4 pt-0 space-y-4">
                      {/* Region Selector */}
                      <div className="flex items-center gap-2 flex-wrap p-3 rounded-xl bg-slate-800/30">
                        <span className="text-sm text-slate-400 mr-2">Applies to:</span>
                        {productData.regions.map(region => (
                          <button
                            key={region.id}
                            onClick={() => toggleRuleRegion(rule.id, region.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              rule.regions.includes(region.id)
                                ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                                : 'bg-slate-700/50 text-slate-500 border border-transparent hover:bg-slate-700'
                            }`}
                          >
                            {region.code}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Conditions (IF) */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-semibold">
                              IF
                            </div>
                            <span className="text-sm text-slate-400">When these conditions are met...</span>
                          </div>
                          
                          <div
                            onDragOver={(e) => handleDragOver(e, rule.id, 'conditions')}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, rule.id, 'conditions')}
                            className={`min-h-[150px] rounded-xl p-3 drop-zone ${
                              dragOverTarget?.id === rule.id && dragOverTarget?.type === 'conditions' ? 'active' : ''
                            }`}
                            style={{ background: 'rgba(15, 22, 41, 0.5)' }}
                          >
                            {rule.conditions.length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                                <Target className="w-8 h-8 mb-2 opacity-50" />
                                <p>Drop features here</p>
                                <p className="text-xs opacity-70">or leave empty for unconditional rule</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {rule.conditions.map((condition, idx) => {
                                  const cls = getClass(condition.classId);
                                  return (
                                    <div key={condition.id} className="space-y-2">
                                      {idx > 0 && (
                                        <div className="flex justify-center">
                                          <select
                                            value={condition.logic}
                                            onChange={(e) => updateConditionLogic(rule.id, condition.id, e.target.value)}
                                            className="px-3 py-1 rounded-lg bg-slate-700 text-indigo-400 text-xs font-semibold border border-slate-600 cursor-pointer"
                                          >
                                            <option value="AND">AND</option>
                                            <option value="OR">OR</option>
                                          </select>
                                        </div>
                                      )}
                                      <div 
                                        className="rounded-xl p-3 border"
                                        style={{ 
                                          background: `${cls?.color}10`,
                                          borderColor: `${cls?.color}30`
                                        }}
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ background: cls?.color }} />
                                            <span className="text-sm font-medium text-white">{cls?.name}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <select
                                              value={condition.operator}
                                              onChange={(e) => updateConditionOperator(rule.id, condition.id, e.target.value)}
                                              className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 border border-slate-700"
                                            >
                                              <option value="EQUALS">equals</option>
                                              <option value="NOT_EQUALS">not equals</option>
                                              <option value="ONE_OF">is one of</option>
                                            </select>
                                            <button
                                              onClick={() => removeCondition(rule.id, condition.id)}
                                              className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                          {condition.values.map(valueId => {
                                            const char = getCharacteristic(condition.classId, valueId);
                                            return (
                                              <span 
                                                key={valueId}
                                                className="value-tag inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                                                style={{ background: `${cls?.color}30`, color: cls?.color }}
                                              >
                                                {char?.name}
                                                <button
                                                  onClick={() => removeValueFromCondition(rule.id, condition.id, valueId)}
                                                  className="hover:text-white"
                                                >
                                                  <X className="w-3 h-3" />
                                                </button>
                                              </span>
                                            );
                                          })}
                                          {condition.values.length === 0 && (
                                            <span className="text-xs text-slate-500 italic">Drop values here</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Results (THEN) */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm font-semibold">
                              THEN
                            </div>
                            <span className="text-sm text-slate-400">Apply these restrictions...</span>
                          </div>
                          
                          <div
                            onDragOver={(e) => handleDragOver(e, rule.id, 'results')}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, rule.id, 'results')}
                            className={`min-h-[150px] rounded-xl p-3 drop-zone ${
                              dragOverTarget?.id === rule.id && dragOverTarget?.type === 'results' ? 'active' : ''
                            }`}
                            style={{ background: 'rgba(15, 22, 41, 0.5)' }}
                          >
                            {rule.results.length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                                <Shield className="w-8 h-8 mb-2 opacity-50" />
                                <p>Drop features here</p>
                                <p className="text-xs opacity-70">to define restrictions</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {rule.results.map((result) => {
                                  const cls = getClass(result.classId);
                                  return (
                                    <div 
                                      key={result.id}
                                      className="rounded-xl p-3 border"
                                      style={{ 
                                        background: `${cls?.color}10`,
                                        borderColor: `${cls?.color}30`
                                      }}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full" style={{ background: cls?.color }} />
                                          <span className="text-sm font-medium text-white">{cls?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <select
                                            value={result.operator}
                                            onChange={(e) => updateResultOperator(rule.id, result.id, e.target.value)}
                                            className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 border border-slate-700"
                                          >
                                            <option value="MUST_BE">must be</option>
                                            <option value="MUST_BE_ONE_OF">must be one of</option>
                                            <option value="CANNOT_BE">cannot be</option>
                                          </select>
                                          <button
                                            onClick={() => removeResult(rule.id, result.id)}
                                            className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {result.values.map(valueId => {
                                          const char = getCharacteristic(result.classId, valueId);
                                          return (
                                            <span 
                                              key={valueId}
                                              className={`value-tag inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                                                result.operator === 'CANNOT_BE' 
                                                  ? 'bg-red-500/30 text-red-400' 
                                                  : ''
                                              }`}
                                              style={result.operator !== 'CANNOT_BE' ? { 
                                                background: `${cls?.color}30`, 
                                                color: cls?.color 
                                              } : {}}
                                            >
                                              {result.operator === 'CANNOT_BE' && <X className="w-3 h-3" />}
                                              {char?.name}
                                              <button
                                                onClick={() => removeValueFromResult(rule.id, result.id, valueId)}
                                                className="hover:text-white"
                                              >
                                                <X className="w-3 h-3" />
                                              </button>
                                            </span>
                                          );
                                        })}
                                        {result.values.length === 0 && (
                                          <span className="text-xs text-slate-500 italic">Drop values here</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Configuration Tab */}
        {activeTab === 'evaluate' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">
                Test Configuration for <span className="text-indigo-400">{selectedRegion}</span>
              </h2>
              
              {productData.classes.map(cls => {
                const restricted = getRestrictedValues(cls.id);
                return (
                  <div key={cls.id} className="glass rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 rounded-full" style={{ background: cls.color }} />
                      <h3 className="text-lg font-medium text-white">{cls.name}</h3>
                      {cls.required && (
                        <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">Required</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {cls.characteristics.map(char => {
                        const isRestricted = restricted.has(char.id);
                        const isSelected = configEvaluation[cls.id] === char.id;
                        
                        return (
                          <button
                            key={char.id}
                            onClick={() => !isRestricted && setConfigEvaluation(prev => ({
                              ...prev,
                              [cls.id]: prev[cls.id] === char.id ? null : char.id
                            }))}
                            disabled={isRestricted}
                            className={`p-3 rounded-xl text-left transition-all ${
                              isSelected
                                ? 'ring-2 text-white'
                                : isRestricted
                                  ? 'opacity-40 cursor-not-allowed'
                                  : 'hover:bg-slate-700/50 text-slate-300'
                            }`}
                            style={{
                              background: isSelected ? `${cls.color}30` : 'rgba(30, 41, 59, 0.5)',
                              borderColor: isSelected ? cls.color : 'transparent',
                              ringColor: cls.color
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{char.name}</span>
                              {isRestricted && <X className="w-4 h-4 text-red-400" />}
                              {isSelected && <Check className="w-4 h-4" style={{ color: cls.color }} />}
                            </div>
                            <span className="text-xs opacity-60 font-mono">{char.code}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Validation Panel */}
            <div className="space-y-4">
              <div 
                className={`glass rounded-2xl p-6 ${evaluateConfig.valid ? 'glow-green' : 'glow-red'}`}
                style={{
                  background: evaluateConfig.valid 
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)'
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  {evaluateConfig.valid ? (
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                  ) : (
                    <XCircle className="w-12 h-12 text-red-400" />
                  )}
                  <div>
                    <h3 className={`text-xl font-bold ${evaluateConfig.valid ? 'text-green-400' : 'text-red-400'}`}>
                      {evaluateConfig.valid ? 'Valid' : 'Invalid'}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {evaluateConfig.violations.length} violations
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setConfigEvaluation({})}
                  className="w-full py-2 rounded-lg bg-slate-700/50 text-slate-300 text-sm hover:bg-slate-700 transition-colors"
                >
                  Clear Selection
                </button>
              </div>

              {/* Current Selection */}
              <div className="glass rounded-2xl p-4">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Current Selection</h4>
                <div className="space-y-2">
                  {productData.classes.map(cls => {
                    const selected = configEvaluation[cls.id];
                    const char = selected ? getCharacteristic(cls.id, selected) : null;
                    return (
                      <div key={cls.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: cls.color }} />
                          <span className="text-sm text-slate-400">{cls.name}</span>
                        </div>
                        {char ? (
                          <span className="text-sm font-medium text-white">{char.name}</span>
                        ) : (
                          <span className="text-sm text-slate-500 italic">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Violations */}
              {evaluateConfig.violations.length > 0 && (
                <div className="glass rounded-2xl p-4">
                  <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Violations
                  </h4>
                  <div className="space-y-2">
                    {evaluateConfig.violations.map((v, i) => (
                      <div key={i} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-red-300">{v.message}</p>
                        <p className="text-xs text-slate-500 mt-1">Rule: {v.rule.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productData.classes.map(cls => (
              <div key={cls.id} className="glass rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${cls.color}20` }}>
                    <Package className="w-5 h-5" style={{ color: cls.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{cls.name}</h3>
                    <span className="text-xs font-mono text-slate-500">{cls.id}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {cls.characteristics.map(char => (
                    <div 
                      key={char.id}
                      className="flex items-center justify-between p-2 rounded-lg"
                      style={{ background: `${cls.color}10` }}
                    >
                      <span className="text-sm text-slate-200">{char.name}</span>
                      <span className="text-xs font-mono text-slate-500">{char.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdvancedConfigManager;
