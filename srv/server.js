/**
 * VC Planner Configuration Management Server
 * SAP BTP Cloud Foundry Backend Service
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const { v4: uuidv4 } = require('uuid');
const XLSX = require('xlsx');
// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;
const cds = require('@sap/cds');
// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  abortOnLimit: true
}));
// In-memory data store (replace with HANA DB in production)
let dataStore = {
  products: [],
  classes: [],
  characteristics: [],
  regions: [],
  configurationRules: [],
  dependencyRules: [],
  probabilityScenarios: [],
  versions: []
};
cds.on('bootstrap', app => {


// Initialize with sample data
initializeSampleData();

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ============================================
// PRODUCT ENDPOINTS
// ============================================
app.get('/api/products', (req, res) => {
  res.json(dataStore.products);
});

app.get('/api/products/:id', (req, res) => {
  const product = dataStore.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/api/products', (req, res) => {
  const product = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  dataStore.products.push(product);
  res.status(201).json(product);
});

app.put('/api/products/:id', (req, res) => {
  const index = dataStore.products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  dataStore.products[index] = {
    ...dataStore.products[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  res.json(dataStore.products[index]);
});

app.delete('/api/products/:id', (req, res) => {
  const index = dataStore.products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  dataStore.products.splice(index, 1);
  res.status(204).send();
});

// ============================================
// FEATURE CLASS ENDPOINTS
// ============================================
app.get('/api/classes', (req, res) => {
  const { productId } = req.query;
  let classes = dataStore.classes;
  if (productId) {
    classes = classes.filter(c => c.productId === productId);
  }
  res.json(classes);
});

app.get('/api/classes/:id', (req, res) => {
  const cls = dataStore.classes.find(c => c.id === req.params.id);
  if (!cls) return res.status(404).json({ error: 'Class not found' });
  
  // Include characteristics
  cls.characteristics = dataStore.characteristics.filter(ch => ch.classId === cls.id);
  res.json(cls);
});

app.post('/api/classes', (req, res) => {
  const cls = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  dataStore.classes.push(cls);
  res.status(201).json(cls);
});

app.put('/api/classes/:id', (req, res) => {
  const index = dataStore.classes.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Class not found' });
  dataStore.classes[index] = {
    ...dataStore.classes[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  res.json(dataStore.classes[index]);
});

app.delete('/api/classes/:id', (req, res) => {
  const index = dataStore.classes.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Class not found' });
  
  // Also delete associated characteristics
  dataStore.characteristics = dataStore.characteristics.filter(ch => ch.classId !== req.params.id);
  dataStore.classes.splice(index, 1);
  res.status(204).send();
});

// ============================================
// CHARACTERISTIC ENDPOINTS
// ============================================
app.get('/api/characteristics', (req, res) => {
  const { classId } = req.query;
  let characteristics = dataStore.characteristics;
  if (classId) {
    characteristics = characteristics.filter(c => c.classId === classId);
  }
  res.json(characteristics);
});

app.post('/api/characteristics', (req, res) => {
  const characteristic = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  dataStore.characteristics.push(characteristic);
  res.status(201).json(characteristic);
});

app.put('/api/characteristics/:id', (req, res) => {
  const index = dataStore.characteristics.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Characteristic not found' });
  dataStore.characteristics[index] = {
    ...dataStore.characteristics[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  res.json(dataStore.characteristics[index]);
});

app.delete('/api/characteristics/:id', (req, res) => {
  const index = dataStore.characteristics.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Characteristic not found' });
  dataStore.characteristics.splice(index, 1);
  res.status(204).send();
});

// ============================================
// REGION ENDPOINTS
// ============================================
app.get('/api/regions', (req, res) => {
  res.json(dataStore.regions);
});

app.post('/api/regions', (req, res) => {
  const region = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  dataStore.regions.push(region);
  res.status(201).json(region);
});

app.put('/api/regions/:id', (req, res) => {
  const index = dataStore.regions.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Region not found' });
  dataStore.regions[index] = { ...dataStore.regions[index], ...req.body };
  res.json(dataStore.regions[index]);
});

app.delete('/api/regions/:id', (req, res) => {
  const index = dataStore.regions.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Region not found' });
  dataStore.regions.splice(index, 1);
  res.status(204).send();
});

// ============================================
// CONFIGURATION RULES ENDPOINTS
// ============================================
app.get('/api/configuration-rules', (req, res) => {
  const { productId, regionId, active } = req.query;
  let rules = dataStore.configurationRules;
  
  if (productId) rules = rules.filter(r => r.productId === productId);
  if (regionId) rules = rules.filter(r => r.regions.includes(regionId));
  if (active !== undefined) rules = rules.filter(r => r.active === (active === 'true'));
  
  res.json(rules);
});

app.get('/api/configuration-rules/:id', (req, res) => {
  const rule = dataStore.configurationRules.find(r => r.id === req.params.id);
  if (!rule) return res.status(404).json({ error: 'Rule not found' });
  res.json(rule);
});

app.post('/api/configuration-rules', (req, res) => {
  const rule = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  dataStore.configurationRules.push(rule);
  res.status(201).json(rule);
});

app.put('/api/configuration-rules/:id', (req, res) => {
  const index = dataStore.configurationRules.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Rule not found' });
  dataStore.configurationRules[index] = {
    ...dataStore.configurationRules[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  res.json(dataStore.configurationRules[index]);
});

app.delete('/api/configuration-rules/:id', (req, res) => {
  const index = dataStore.configurationRules.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Rule not found' });
  dataStore.configurationRules.splice(index, 1);
  res.status(204).send();
});

// Duplicate rule
app.post('/api/configuration-rules/:id/duplicate', (req, res) => {
  const rule = dataStore.configurationRules.find(r => r.id === req.params.id);
  if (!rule) return res.status(404).json({ error: 'Rule not found' });
  
  const newRule = {
    ...JSON.parse(JSON.stringify(rule)),
    id: uuidv4(),
    name: `${rule.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Generate new IDs for conditions and results
  newRule.conditions = newRule.conditions.map(c => ({ ...c, id: uuidv4() }));
  newRule.results = newRule.results.map(r => ({ ...r, id: uuidv4() }));
  
  dataStore.configurationRules.push(newRule);
  res.status(201).json(newRule);
});

// ============================================
// DEPENDENCY RULES ENDPOINTS
// ============================================
app.get('/api/dependency-rules', (req, res) => {
  const { productId, sourceClass, targetClass } = req.query;
  let rules = dataStore.dependencyRules;
  
  if (productId) rules = rules.filter(r => r.productId === productId);
  if (sourceClass) rules = rules.filter(r => r.sourceClass === sourceClass);
  if (targetClass) rules = rules.filter(r => r.targetClass === targetClass);
  
  res.json(rules);
});

app.post('/api/dependency-rules', (req, res) => {
  const rule = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  dataStore.dependencyRules.push(rule);
  res.status(201).json(rule);
});

app.put('/api/dependency-rules/:id', (req, res) => {
  const index = dataStore.dependencyRules.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Rule not found' });
  dataStore.dependencyRules[index] = { ...dataStore.dependencyRules[index], ...req.body };
  res.json(dataStore.dependencyRules[index]);
});

app.delete('/api/dependency-rules/:id', (req, res) => {
  const index = dataStore.dependencyRules.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Rule not found' });
  dataStore.dependencyRules.splice(index, 1);
  res.status(204).send();
});

// ============================================
// PROBABILITY CALCULATION ENDPOINTS
// ============================================
app.post('/api/probability/calculate', (req, res) => {
  const { inputProbabilities, regionId, productId } = req.body;
  
  try {
    const result = calculateDerivedProbabilities(inputProbabilities, regionId, productId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/probability/scenarios', (req, res) => {
  res.json(dataStore.probabilityScenarios);
});

app.post('/api/probability/scenarios', (req, res) => {
  const scenario = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  dataStore.probabilityScenarios.push(scenario);
  res.status(201).json(scenario);
});

app.delete('/api/probability/scenarios/:id', (req, res) => {
  const index = dataStore.probabilityScenarios.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Scenario not found' });
  dataStore.probabilityScenarios.splice(index, 1);
  res.status(204).send();
});

// ============================================
// CONFIGURATION VALIDATION ENDPOINT
// ============================================
app.post('/api/validate-configuration', (req, res) => {
  const { configuration, regionId, productId } = req.body;
  
  try {
    const result = validateConfiguration(configuration, regionId, productId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// DATA EXPORT ENDPOINTS
// ============================================
app.get('/api/export/sample-data', (req, res) => {
  const sampleData = generateSampleDataExport();
  res.json(sampleData);
});

app.get('/api/export/sample-data/excel', (req, res) => {
  const workbook = generateExcelExport();
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=vc-planner-sample-data.xlsx');
  res.send(buffer);
});

app.get('/api/export/all-data', (req, res) => {
  res.json({
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    data: dataStore
  });
});

app.get('/api/export/all-data/excel', (req, res) => {
  const workbook = generateFullExcelExport();
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=vc-planner-full-export.xlsx');
  res.send(buffer);
});

// ============================================
// DATA IMPORT ENDPOINTS
// ============================================
app.post('/api/import/data', (req, res) => {
  try {
    const { data, mode } = req.body; // mode: 'replace' | 'merge'
    
    if (mode === 'replace') {
      dataStore = { ...dataStore, ...data };
    } else {
      // Merge mode - append new items
      Object.keys(data).forEach(key => {
        if (Array.isArray(data[key]) && Array.isArray(dataStore[key])) {
          const existingIds = new Set(dataStore[key].map(item => item.id));
          data[key].forEach(item => {
            if (!existingIds.has(item.id)) {
              dataStore[key].push(item);
            }
          });
        }
      });
    }
    
    res.json({ success: true, message: 'Data imported successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/import/excel', (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const file = req.files.file;
    const workbook = XLSX.read(file.data, { type: 'buffer' });
    const importedData = parseExcelImport(workbook);
    
    // Merge imported data
    Object.keys(importedData).forEach(key => {
      if (Array.isArray(importedData[key]) && Array.isArray(dataStore[key])) {
        dataStore[key] = importedData[key];
      }
    });
    
    res.json({ success: true, message: 'Excel data imported successfully', summary: importedData.summary });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// VERSION MANAGEMENT
// ============================================
app.get('/api/versions', (req, res) => {
  res.json(dataStore.versions);
});

app.post('/api/versions', (req, res) => {
  const version = {
    id: uuidv4(),
    name: req.body.name || `Version ${dataStore.versions.length + 1}`,
    description: req.body.description,
    snapshot: JSON.parse(JSON.stringify(dataStore)),
    createdAt: new Date().toISOString(),
    createdBy: req.body.createdBy || 'system'
  };
  dataStore.versions.push(version);
  res.status(201).json({ id: version.id, name: version.name, createdAt: version.createdAt });
});

app.post('/api/versions/:id/restore', (req, res) => {
  const version = dataStore.versions.find(v => v.id === req.params.id);
  if (!version) return res.status(404).json({ error: 'Version not found' });
  
  // Save current versions before restore
  const currentVersions = dataStore.versions;
  dataStore = { ...version.snapshot };
  dataStore.versions = currentVersions;
  
  res.json({ success: true, message: `Restored to version: ${version.name}` });
});
})

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateDerivedProbabilities(inputProbabilities, regionId, productId) {
  const result = {
    independent: {},
    dependent: {},
    regional: {},
    calculationSteps: [],
    volumes: {}
  };
  
  const product = dataStore.products.find(p => p.id === productId) || { baseVolume: 10000 };
  const region = regionId !== 'ALL' ? dataStore.regions.find(r => r.id === regionId) : null;
  
  // Copy and adjust input probabilities
  const classes = dataStore.classes.filter(c => c.productId === productId || !productId);
  const characteristics = dataStore.characteristics;
  const dependencyRules = dataStore.dependencyRules.filter(r => r.productId === productId || !productId);
  
  // Initialize independent probabilities
  classes.filter(c => c.type === 'independent').forEach(cls => {
    result.independent[cls.id] = { ...inputProbabilities[cls.id] };
    
    // Apply regional exclusions
    if (region && region.excludeCharacteristics) {
      const exclusions = region.excludeCharacteristics[cls.id] || [];
      if (exclusions.length > 0) {
        let excludedSum = 0;
        exclusions.forEach(charId => {
          excludedSum += result.independent[cls.id][charId] || 0;
          result.independent[cls.id][charId] = 0;
        });
        
        // Redistribute
        if (excludedSum > 0) {
          const remainingSum = Object.values(result.independent[cls.id]).reduce((a, b) => a + b, 0);
          if (remainingSum > 0) {
            Object.keys(result.independent[cls.id]).forEach(key => {
              if (result.independent[cls.id][key] > 0) {
                result.independent[cls.id][key] /= remainingSum;
              }
            });
          }
          
          result.calculationSteps.push({
            type: 'exclusion',
            description: `${region.name} exclusions for ${cls.name}`,
            details: `Excluded: ${exclusions.join(', ')}`
          });
        }
      }
    }
  });
  
  // Initialize dependent class probabilities
  classes.filter(c => c.type === 'dependent' || c.type === 'regional').forEach(cls => {
    result.dependent[cls.id] = {};
    characteristics.filter(ch => ch.classId === cls.id).forEach(char => {
      result.dependent[cls.id][char.id] = 0;
    });
  });
  
  // Calculate regional steering
  const steeringClass = classes.find(c => c.id === 'STEERING' || c.name === 'Steering');
  if (steeringClass && region) {
    result.regional[steeringClass.id] = {};
    characteristics.filter(ch => ch.classId === steeringClass.id).forEach(char => {
      result.regional[steeringClass.id][char.id] = char.id === region.steering ? 1.0 : 0;
    });
  }
  
  // Apply dependency rules
  dependencyRules.forEach(rule => {
    const sourceProbs = result.independent[rule.sourceClass] || result.dependent[rule.sourceClass];
    if (!sourceProbs) return;
    
    let ruleContribution = 0;
    rule.sourceValues.forEach(sourceVal => {
      ruleContribution += sourceProbs[sourceVal] || 0;
    });
    
    if (ruleContribution > 0) {
      Object.entries(rule.distribution).forEach(([targetChar, proportion]) => {
        if (!result.dependent[rule.targetClass]) {
          result.dependent[rule.targetClass] = {};
        }
        result.dependent[rule.targetClass][targetChar] = 
          (result.dependent[rule.targetClass][targetChar] || 0) + (ruleContribution * proportion);
      });
      
      result.calculationSteps.push({
        type: 'dependency',
        rule: rule.name,
        source: `${rule.sourceClass}: ${rule.sourceValues.join(', ')}`,
        contribution: ruleContribution,
        distribution: Object.entries(rule.distribution).map(([k, v]) => `${k}: ${(v * 100).toFixed(0)}%`).join(', ')
      });
    }
  });
  
  // Normalize dependent probabilities
  Object.keys(result.dependent).forEach(classId => {
    const probs = result.dependent[classId];
    const sum = Object.values(probs).reduce((a, b) => a + b, 0);
    if (sum > 0 && Math.abs(sum - 1) > 0.001) {
      Object.keys(probs).forEach(key => {
        probs[key] /= sum;
      });
    }
  });
  
  // Calculate volumes
  const baseVolume = product.baseVolume || 10000;
  classes.forEach(cls => {
    result.volumes[cls.id] = {};
    const probs = result.independent[cls.id] || result.dependent[cls.id] || result.regional[cls.id];
    if (probs) {
      Object.entries(probs).forEach(([charId, prob]) => {
        result.volumes[cls.id][charId] = Math.round(baseVolume * prob);
      });
    }
  });
  
  return result;
}

function validateConfiguration(configuration, regionId, productId) {
  const result = { valid: true, violations: [], warnings: [] };
  
  const rules = dataStore.configurationRules.filter(r => 
    r.active && 
    (r.productId === productId || !productId) &&
    (regionId === 'ALL' || r.regions.includes(regionId))
  );
  
  rules.forEach(rule => {
    // Check conditions
    let conditionsMet = true;
    if (rule.conditions && rule.conditions.length > 0) {
      conditionsMet = rule.conditions.every(condition => {
        const selectedValue = configuration[condition.classId];
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
    
    // If conditions met, check results
    if (conditionsMet) {
      rule.results.forEach(res => {
        const selectedValue = configuration[res.classId];
        
        switch (res.operator) {
          case 'MUST_BE':
            if (selectedValue && !res.values.includes(selectedValue)) {
              result.valid = false;
              result.violations.push({
                ruleId: rule.id,
                ruleName: rule.name,
                classId: res.classId,
                message: `Must be one of: ${res.values.join(', ')}`
              });
            }
            break;
          case 'MUST_BE_ONE_OF':
            if (selectedValue && !res.values.includes(selectedValue)) {
              result.valid = false;
              result.violations.push({
                ruleId: rule.id,
                ruleName: rule.name,
                classId: res.classId,
                message: `Must be one of: ${res.values.join(', ')}`
              });
            }
            break;
          case 'CANNOT_BE':
            if (selectedValue && res.values.includes(selectedValue)) {
              result.valid = false;
              result.violations.push({
                ruleId: rule.id,
                ruleName: rule.name,
                classId: res.classId,
                message: `Cannot be: ${selectedValue}`
              });
            }
            break;
        }
      });
    }
  });
  
  return result;
}

function generateSampleDataExport() {
  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    products: dataStore.products,
    classes: dataStore.classes,
    characteristics: dataStore.characteristics,
    regions: dataStore.regions,
    configurationRules: dataStore.configurationRules,
    dependencyRules: dataStore.dependencyRules
  };
}

function generateExcelExport() {
  const workbook = XLSX.utils.book_new();
  
  // Products sheet
  const productsSheet = XLSX.utils.json_to_sheet(dataStore.products);
  XLSX.utils.book_append_sheet(workbook, productsSheet, 'Products');
  
  // Classes sheet
  const classesSheet = XLSX.utils.json_to_sheet(dataStore.classes);
  XLSX.utils.book_append_sheet(workbook, classesSheet, 'Classes');
  
  // Characteristics sheet
  const charsSheet = XLSX.utils.json_to_sheet(dataStore.characteristics);
  XLSX.utils.book_append_sheet(workbook, charsSheet, 'Characteristics');
  
  // Regions sheet
  const regionsSheet = XLSX.utils.json_to_sheet(dataStore.regions);
  XLSX.utils.book_append_sheet(workbook, regionsSheet, 'Regions');
  
  // Configuration Rules sheet
  const rulesData = dataStore.configurationRules.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    active: r.active,
    regions: r.regions.join(','),
    conditions: JSON.stringify(r.conditions),
    results: JSON.stringify(r.results)
  }));
  const rulesSheet = XLSX.utils.json_to_sheet(rulesData);
  XLSX.utils.book_append_sheet(workbook, rulesSheet, 'ConfigurationRules');
  
  // Dependency Rules sheet
  const depRulesData = dataStore.dependencyRules.map(r => ({
    id: r.id,
    name: r.name,
    sourceClass: r.sourceClass,
    sourceValues: r.sourceValues.join(','),
    targetClass: r.targetClass,
    distribution: JSON.stringify(r.distribution)
  }));
  const depRulesSheet = XLSX.utils.json_to_sheet(depRulesData);
  XLSX.utils.book_append_sheet(workbook, depRulesSheet, 'DependencyRules');
  
  return workbook;
}

function generateFullExcelExport() {
  return generateExcelExport();
}

function parseExcelImport(workbook) {
  const result = { summary: {} };
  
  // Parse Products
  if (workbook.Sheets['Products']) {
    result.products = XLSX.utils.sheet_to_json(workbook.Sheets['Products']);
    result.summary.products = result.products.length;
  }
  
  // Parse Classes
  if (workbook.Sheets['Classes']) {
    result.classes = XLSX.utils.sheet_to_json(workbook.Sheets['Classes']);
    result.summary.classes = result.classes.length;
  }
  
  // Parse Characteristics
  if (workbook.Sheets['Characteristics']) {
    result.characteristics = XLSX.utils.sheet_to_json(workbook.Sheets['Characteristics']);
    result.summary.characteristics = result.characteristics.length;
  }
  
  // Parse Regions
  if (workbook.Sheets['Regions']) {
    result.regions = XLSX.utils.sheet_to_json(workbook.Sheets['Regions']);
    result.summary.regions = result.regions.length;
  }
  
  // Parse Configuration Rules
  if (workbook.Sheets['ConfigurationRules']) {
    const rulesData = XLSX.utils.sheet_to_json(workbook.Sheets['ConfigurationRules']);
    result.configurationRules = rulesData.map(r => ({
      ...r,
      regions: r.regions ? r.regions.split(',') : [],
      conditions: r.conditions ? JSON.parse(r.conditions) : [],
      results: r.results ? JSON.parse(r.results) : []
    }));
    result.summary.configurationRules = result.configurationRules.length;
  }
  
  // Parse Dependency Rules
  if (workbook.Sheets['DependencyRules']) {
    const depRulesData = XLSX.utils.sheet_to_json(workbook.Sheets['DependencyRules']);
    result.dependencyRules = depRulesData.map(r => ({
      ...r,
      sourceValues: r.sourceValues ? r.sourceValues.split(',') : [],
      distribution: r.distribution ? JSON.parse(r.distribution) : {}
    }));
    result.summary.dependencyRules = result.dependencyRules.length;
  }
  
  return result;
}

function initializeSampleData() {
  // Sample Product
  dataStore.products = [{
    id: 'PROD_001',
    name: 'Premium Vehicle Series 2025',
    description: 'Configurable vehicle platform with multiple options',
    baseVolume: 10000,
    createdAt: new Date().toISOString()
  }];
  
  // Sample Regions
  dataStore.regions = [
    { id: 'EU', name: 'European Union', code: 'EU', steering: 'STR_LHD', volumeShare: 0.30, excludeCharacteristics: {} },
    { id: 'UK', name: 'United Kingdom', code: 'UK', steering: 'STR_RHD', volumeShare: 0.10, excludeCharacteristics: {} },
    { id: 'US', name: 'United States', code: 'US', steering: 'STR_LHD', volumeShare: 0.25, excludeCharacteristics: { ENGINE: ['ENG_2_0D'] } },
    { id: 'JP', name: 'Japan', code: 'JP', steering: 'STR_RHD', volumeShare: 0.10, excludeCharacteristics: {} },
    { id: 'AU', name: 'Australia', code: 'AU', steering: 'STR_RHD', volumeShare: 0.05, excludeCharacteristics: {} },
    { id: 'CN', name: 'China', code: 'CN', steering: 'STR_LHD', volumeShare: 0.15, excludeCharacteristics: { TRANSMISSION: ['TRN_M5', 'TRN_M6'] } },
    { id: 'IN', name: 'India', code: 'IN', steering: 'STR_LHD', volumeShare: 0.05, excludeCharacteristics: { ENGINE: ['ENG_EV'] } }
  ];
  
  // Sample Classes
  dataStore.classes = [
    { id: 'ENGINE', name: 'Engine', color: '#3b82f6', type: 'independent', required: true, productId: 'PROD_001' },
    { id: 'PACKAGE', name: 'Package', color: '#f59e0b', type: 'independent', required: true, productId: 'PROD_001' },
    { id: 'TRANSMISSION', name: 'Transmission', color: '#8b5cf6', type: 'dependent', required: true, productId: 'PROD_001' },
    { id: 'WHEELS', name: 'Wheels', color: '#ec4899', type: 'dependent', required: false, productId: 'PROD_001' },
    { id: 'DRIVETRAIN', name: 'Drivetrain', color: '#06b6d4', type: 'dependent', required: false, productId: 'PROD_001' },
    { id: 'STEERING', name: 'Steering', color: '#10b981', type: 'regional', required: true, productId: 'PROD_001' }
  ];
  
  // Sample Characteristics
  dataStore.characteristics = [
    // Engine
    { id: 'ENG_1_5T', name: '1.5L Turbo', code: 'ENG001', classId: 'ENGINE', baseProbability: 0.25, active: true },
    { id: 'ENG_2_0T', name: '2.0L Turbo', code: 'ENG002', classId: 'ENGINE', baseProbability: 0.30, active: true },
    { id: 'ENG_2_0D', name: '2.0L Diesel', code: 'ENG003', classId: 'ENGINE', baseProbability: 0.15, active: true },
    { id: 'ENG_HYB', name: '1.8L Hybrid', code: 'ENG004', classId: 'ENGINE', baseProbability: 0.20, active: true },
    { id: 'ENG_EV', name: 'Full Electric', code: 'ENG005', classId: 'ENGINE', baseProbability: 0.10, active: true },
    // Package
    { id: 'PKG_BASE', name: 'Base', code: 'PKG001', classId: 'PACKAGE', baseProbability: 0.20, active: true },
    { id: 'PKG_COMFORT', name: 'Comfort', code: 'PKG002', classId: 'PACKAGE', baseProbability: 0.35, active: true },
    { id: 'PKG_PREMIUM', name: 'Premium', code: 'PKG003', classId: 'PACKAGE', baseProbability: 0.30, active: true },
    { id: 'PKG_SPORT', name: 'Sport', code: 'PKG004', classId: 'PACKAGE', baseProbability: 0.15, active: true },
    // Transmission
    { id: 'TRN_M5', name: '5-Speed Manual', code: 'TRN001', classId: 'TRANSMISSION', active: true },
    { id: 'TRN_M6', name: '6-Speed Manual', code: 'TRN002', classId: 'TRANSMISSION', active: true },
    { id: 'TRN_A6', name: '6-Speed Auto', code: 'TRN003', classId: 'TRANSMISSION', active: true },
    { id: 'TRN_A8', name: '8-Speed Auto', code: 'TRN004', classId: 'TRANSMISSION', active: true },
    { id: 'TRN_CVT', name: 'CVT', code: 'TRN005', classId: 'TRANSMISSION', active: true },
    { id: 'TRN_EV', name: 'Single-Speed EV', code: 'TRN006', classId: 'TRANSMISSION', active: true },
    // Wheels
    { id: 'WHL_16', name: '16" Alloy', code: 'WHL001', classId: 'WHEELS', active: true },
    { id: 'WHL_17', name: '17" Alloy', code: 'WHL002', classId: 'WHEELS', active: true },
    { id: 'WHL_18', name: '18" Alloy', code: 'WHL003', classId: 'WHEELS', active: true },
    { id: 'WHL_19', name: '19" Sport', code: 'WHL004', classId: 'WHEELS', active: true },
    // Drivetrain
    { id: 'DRV_FWD', name: 'Front Wheel Drive', code: 'DRV001', classId: 'DRIVETRAIN', active: true },
    { id: 'DRV_RWD', name: 'Rear Wheel Drive', code: 'DRV002', classId: 'DRIVETRAIN', active: true },
    { id: 'DRV_AWD', name: 'All Wheel Drive', code: 'DRV003', classId: 'DRIVETRAIN', active: true },
    // Steering
    { id: 'STR_LHD', name: 'Left Hand Drive', code: 'STR001', classId: 'STEERING', active: true },
    { id: 'STR_RHD', name: 'Right Hand Drive', code: 'STR002', classId: 'STEERING', active: true }
  ];
  
  // Sample Configuration Rules
  dataStore.configurationRules = [
    {
      id: 'RULE_001',
      name: 'EV Powertrain Configuration',
      description: 'Electric vehicles require specific transmission',
      active: true,
      productId: 'PROD_001',
      regions: ['EU', 'UK', 'US', 'JP', 'AU', 'CN'],
      conditions: [{ id: 'c1', classId: 'ENGINE', operator: 'EQUALS', values: ['ENG_EV'], logic: 'AND' }],
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
      productId: 'PROD_001',
      regions: ['EU', 'UK', 'US', 'JP', 'AU', 'CN', 'IN'],
      conditions: [{ id: 'c1', classId: 'ENGINE', operator: 'EQUALS', values: ['ENG_HYB'], logic: 'AND' }],
      results: [{ id: 'r1', classId: 'TRANSMISSION', operator: 'CANNOT_BE', values: ['TRN_M5', 'TRN_M6'] }]
    },
    {
      id: 'RULE_003',
      name: 'Sport Package Wheels',
      description: 'Sport package requires large wheels',
      active: true,
      productId: 'PROD_001',
      regions: ['EU', 'UK', 'US', 'JP', 'AU', 'CN', 'IN'],
      conditions: [{ id: 'c1', classId: 'PACKAGE', operator: 'EQUALS', values: ['PKG_SPORT'], logic: 'AND' }],
      results: [{ id: 'r1', classId: 'WHEELS', operator: 'MUST_BE_ONE_OF', values: ['WHL_18', 'WHL_19'] }]
    },
    {
      id: 'RULE_004',
      name: 'US Market - LHD Only',
      description: 'US requires left hand drive',
      active: true,
      productId: 'PROD_001',
      regions: ['US'],
      conditions: [],
      results: [
        { id: 'r1', classId: 'STEERING', operator: 'MUST_BE', values: ['STR_LHD'] },
        { id: 'r2', classId: 'ENGINE', operator: 'CANNOT_BE', values: ['ENG_2_0D'] }
      ]
    },
    {
      id: 'RULE_005',
      name: 'UK/JP/AU Market - RHD Only',
      description: 'These markets require right hand drive',
      active: true,
      productId: 'PROD_001',
      regions: ['UK', 'JP', 'AU'],
      conditions: [],
      results: [{ id: 'r1', classId: 'STEERING', operator: 'MUST_BE', values: ['STR_RHD'] }]
    }
  ];
  
  // Sample Dependency Rules
  dataStore.dependencyRules = [
    { id: 'DEP_001', name: 'EV Transmission', productId: 'PROD_001', sourceClass: 'ENGINE', sourceValues: ['ENG_EV'], targetClass: 'TRANSMISSION', distribution: { 'TRN_EV': 1.0 } },
    { id: 'DEP_002', name: 'Hybrid Transmission', productId: 'PROD_001', sourceClass: 'ENGINE', sourceValues: ['ENG_HYB'], targetClass: 'TRANSMISSION', distribution: { 'TRN_CVT': 0.60, 'TRN_A6': 0.25, 'TRN_A8': 0.15 } },
    { id: 'DEP_003', name: 'Petrol 1.5T Transmission', productId: 'PROD_001', sourceClass: 'ENGINE', sourceValues: ['ENG_1_5T'], targetClass: 'TRANSMISSION', distribution: { 'TRN_M5': 0.15, 'TRN_M6': 0.20, 'TRN_A6': 0.35, 'TRN_CVT': 0.30 } },
    { id: 'DEP_004', name: 'Petrol 2.0T Transmission', productId: 'PROD_001', sourceClass: 'ENGINE', sourceValues: ['ENG_2_0T'], targetClass: 'TRANSMISSION', distribution: { 'TRN_M6': 0.25, 'TRN_A8': 0.55, 'TRN_A6': 0.20 } },
    { id: 'DEP_005', name: 'Diesel Transmission', productId: 'PROD_001', sourceClass: 'ENGINE', sourceValues: ['ENG_2_0D'], targetClass: 'TRANSMISSION', distribution: { 'TRN_M6': 0.40, 'TRN_A6': 0.35, 'TRN_A8': 0.25 } },
    { id: 'DEP_006', name: 'Base Package Wheels', productId: 'PROD_001', sourceClass: 'PACKAGE', sourceValues: ['PKG_BASE'], targetClass: 'WHEELS', distribution: { 'WHL_16': 0.70, 'WHL_17': 0.30 } },
    { id: 'DEP_007', name: 'Comfort Package Wheels', productId: 'PROD_001', sourceClass: 'PACKAGE', sourceValues: ['PKG_COMFORT'], targetClass: 'WHEELS', distribution: { 'WHL_16': 0.20, 'WHL_17': 0.50, 'WHL_18': 0.30 } },
    { id: 'DEP_008', name: 'Premium Package Wheels', productId: 'PROD_001', sourceClass: 'PACKAGE', sourceValues: ['PKG_PREMIUM'], targetClass: 'WHEELS', distribution: { 'WHL_17': 0.25, 'WHL_18': 0.50, 'WHL_19': 0.25 } },
    { id: 'DEP_009', name: 'Sport Package Wheels', productId: 'PROD_001', sourceClass: 'PACKAGE', sourceValues: ['PKG_SPORT'], targetClass: 'WHEELS', distribution: { 'WHL_18': 0.40, 'WHL_19': 0.60 } },
    { id: 'DEP_010', name: 'Standard Drivetrain', productId: 'PROD_001', sourceClass: 'PACKAGE', sourceValues: ['PKG_BASE', 'PKG_COMFORT', 'PKG_PREMIUM'], targetClass: 'DRIVETRAIN', distribution: { 'DRV_FWD': 0.55, 'DRV_AWD': 0.30, 'DRV_RWD': 0.15 } },
    { id: 'DEP_011', name: 'Sport Package Drivetrain', productId: 'PROD_001', sourceClass: 'PACKAGE', sourceValues: ['PKG_SPORT'], targetClass: 'DRIVETRAIN', distribution: { 'DRV_RWD': 0.45, 'DRV_AWD': 0.55 } }
  ];
  
  console.log('Sample data initialized');
}

// Start server
// app.listen(PORT, () => {
//   console.log(`VC Planner Configuration Server running on port ${PORT}`);
//   console.log(`Health check: http://localhost:${PORT}/health`);
//   console.log(`API Base URL: http://localhost:${PORT}/api`);
// });
module.exports = cds.server
// module.exports = app;
