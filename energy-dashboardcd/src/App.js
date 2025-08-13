import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Lightbulb, Zap, TrendingDown, Volume2, Settings, Home, Leaf, DollarSign, Clock, AlertCircle, Activity, Brain, Target } from 'lucide-react';

const EnergyDashboard = () => {
  const [currentView, setCurrentView] = useState('overview');
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [fontSize, setFontSize] = useState('large');
  const [currentPrediction, setCurrentPrediction] = useState(null);
  
  // Smart efficiency calculation based on user inputs and usage patterns
  const calculateKitchenEfficiency = (appliances, usage, timings) => {
    let efficiency = 0.7; // Base efficiency
    
    // Energy-efficient appliances boost
    if (appliances.includes('induction')) efficiency += 0.1;
    if (appliances.includes('microwave')) efficiency += 0.05;
    if (appliances.includes('led_lighting')) efficiency += 0.05;
    
    // Usage pattern optimization
    if (usage === 'optimized') efficiency += 0.1;
    if (usage === 'wasteful') efficiency -= 0.2;
    
    // Off-peak timing bonus
    if (timings === 'off_peak') efficiency += 0.05;
    
    return Math.min(1.0, Math.max(0.3, efficiency));
  };

  const calculateLaundryEfficiency = (machines, habits, temperature) => {
    let efficiency = 0.65; // Base efficiency
    
    // Energy-efficient machines
    if (machines.includes('front_load')) efficiency += 0.15;
    if (machines.includes('inverter')) efficiency += 0.1;
    
    // Good habits
    if (habits === 'full_loads') efficiency += 0.1;
    if (habits === 'air_dry') efficiency += 0.05;
    
    // Temperature settings
    if (temperature === 'cold_wash') efficiency += 0.1;
    if (temperature === 'hot_wash') efficiency -= 0.1;
    
    return Math.min(1.0, Math.max(0.3, efficiency));
  };

  const calculateClimateEfficiency = (hvac, insulation, maintenance, settings) => {
    let efficiency = 0.6; // Base efficiency
    
    // HVAC system quality
    if (hvac === 'inverter_ac') efficiency += 0.15;
    if (hvac === 'split_ac') efficiency += 0.1;
    if (hvac === 'old_ac') efficiency -= 0.1;
    
    // Insulation quality
    if (insulation === 'good') efficiency += 0.1;
    if (insulation === 'poor') efficiency -= 0.1;
    
    // Regular maintenance
    if (maintenance === 'regular') efficiency += 0.08;
    if (maintenance === 'never') efficiency -= 0.15;
    
    // Smart settings
    if (settings === 'optimal_temp') efficiency += 0.05;
    
    return Math.min(1.0, Math.max(0.3, efficiency));
  };

  // User profile for efficiency calculation
  const [userProfile, setUserProfile] = useState({
    kitchen: {
      appliances: ['induction', 'microwave'],
      usage: 'optimized',
      timings: 'off_peak'
    },
    laundry: {
      machines: ['front_load'],
      habits: 'full_loads',
      temperature: 'cold_wash'
    },
    climate: {
      hvac: 'inverter_ac',
      insulation: 'good',
      maintenance: 'regular',
      settings: 'optimal_temp'
    }
  });

  // Calculate efficiencies based on user profile
  const calculatedEfficiencies = {
    Kitchen_Efficiency: calculateKitchenEfficiency(
      userProfile.kitchen.appliances,
      userProfile.kitchen.usage,
      userProfile.kitchen.timings
    ),
    Laundry_Efficiency: calculateLaundryEfficiency(
      userProfile.laundry.machines,
      userProfile.laundry.habits,
      userProfile.laundry.temperature
    ),
    Climate_Efficiency: calculateClimateEfficiency(
      userProfile.climate.hvac,
      userProfile.climate.insulation,
      userProfile.climate.maintenance,
      userProfile.climate.settings
    )
  };

  // Model Features State - matches your RF model exactly
  const [modelInputs, setModelInputs] = useState({
    Hour: new Date().getHours(),
    Month: new Date().getMonth() + 1,
    DayofWeek: new Date().getDay(),
    Kitchen_Efficiency: calculatedEfficiencies.Kitchen_Efficiency,
    Laundry_Efficiency: calculatedEfficiencies.Laundry_Efficiency,
    Climate_Efficiency: calculatedEfficiencies.Climate_Efficiency
  });

  // Simulated model prediction function - replace this with actual API call to your model
  const predictGlobalActivePower = (features) => {
    // This simulates your Random Forest model prediction
    // Replace this with actual API call to your deployed model
    const baseConsumption = 2.5;
    const hourEffect = Math.sin((features.Hour - 6) * Math.PI / 12) * 1.5 + 1.5;
    const monthEffect = 1 + (features.Month > 6 ? 0.3 : 0.1);
    const weekdayEffect = features.DayofWeek === 0 || features.DayofWeek === 6 ? 0.9 : 1.1;
    const efficiencyEffect = (features.Kitchen_Efficiency + features.Laundry_Efficiency + features.Climate_Efficiency) / 3;
    
    return Math.max(0.1, baseConsumption * hourEffect * monthEffect * weekdayEffect * (2 - efficiencyEffect));
  };

  // Update efficiencies when user profile changes
  useEffect(() => {
    const newEfficiencies = {
      Kitchen_Efficiency: calculateKitchenEfficiency(
        userProfile.kitchen.appliances,
        userProfile.kitchen.usage,
        userProfile.kitchen.timings
      ),
      Laundry_Efficiency: calculateLaundryEfficiency(
        userProfile.laundry.machines,
        userProfile.laundry.habits,
        userProfile.laundry.temperature
      ),
      Climate_Efficiency: calculateClimateEfficiency(
        userProfile.climate.hvac,
        userProfile.climate.insulation,
        userProfile.climate.maintenance,
        userProfile.climate.settings
      )
    };
    
    setModelInputs(prev => ({
      ...prev,
      ...newEfficiencies
    }));
  }, [userProfile]);

  // Real-time prediction update
  useEffect(() => {
    const prediction = predictGlobalActivePower(modelInputs);
    setCurrentPrediction(prediction);
  }, [modelInputs]);

  // Generate historical data based on model features
  const generateHistoricalData = () => {
    const data = [];
    const currentHour = new Date().getHours();
    
    for (let i = 23; i >= 0; i--) {
      const hour = (currentHour - i + 24) % 24;
      const features = {
        Hour: hour,
        Month: modelInputs.Month,
        DayofWeek: modelInputs.DayofWeek,
        Kitchen_Efficiency: modelInputs.Kitchen_Efficiency + (Math.random() - 0.5) * 0.1,
        Laundry_Efficiency: modelInputs.Laundry_Efficiency + (Math.random() - 0.5) * 0.1,
        Climate_Efficiency: modelInputs.Climate_Efficiency + (Math.random() - 0.5) * 0.1
      };
      
      data.push({
        hour: `${hour}:00`,
        consumption: predictGlobalActivePower(features),
        cost: predictGlobalActivePower(features) * 6.5, // ₹6.5 per kWh (Indian rate)
        efficiency: (features.Kitchen_Efficiency + features.Laundry_Efficiency + features.Climate_Efficiency) / 3 * 100
      });
    }
    return data;
  };

  // Generate efficiency comparison data
  const generateEfficiencyData = () => {
    return [
      { 
        appliance: 'Kitchen', 
        current: modelInputs.Kitchen_Efficiency * 100,
        optimal: 85,
        consumption: predictGlobalActivePower({...modelInputs, Kitchen_Efficiency: modelInputs.Kitchen_Efficiency}),
        color: '#FF6B6B'
      },
      { 
        appliance: 'Laundry', 
        current: modelInputs.Laundry_Efficiency * 100,
        optimal: 80,
        consumption: predictGlobalActivePower({...modelInputs, Laundry_Efficiency: modelInputs.Laundry_Efficiency}),
        color: '#4ECDC4'
      },
      { 
        appliance: 'Climate', 
        current: modelInputs.Climate_Efficiency * 100,
        optimal: 78,
        consumption: predictGlobalActivePower({...modelInputs, Climate_Efficiency: modelInputs.Climate_Efficiency}),
        color: '#45B7D1'
      }
    ];
  };

  // Generate predictions for next 7 days
  const generateWeeklyPredictions = () => {
    const data = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 7; i++) {
      const dayOfWeek = (modelInputs.DayofWeek + i) % 7;
      const dailyConsumption = Array.from({length: 24}, (_, hour) => 
        predictGlobalActivePower({
          ...modelInputs,
          Hour: hour,
          DayofWeek: dayOfWeek
        })
      ).reduce((sum, val) => sum + val, 0);
      
      data.push({
        day: days[dayOfWeek],
        predicted: dailyConsumption,
        target: 45, // Target daily consumption
        cost: dailyConsumption * 6.5 // ₹6.5 per kWh
      });
    }
    return data;
  };

  const historicalData = generateHistoricalData();
  const efficiencyData = generateEfficiencyData();
  const weeklyPredictions = generateWeeklyPredictions();

  // Smart recommendations based on model features
  const generateRecommendations = () => {
    const recommendations = [];
    
    // Kitchen efficiency recommendation
    if (modelInputs.Kitchen_Efficiency < 0.8) {
      recommendations.push({
        id: 1,
        icon: <Lightbulb className="w-8 h-8 text-yellow-500" />,
        title: "Improve Kitchen Efficiency",
        description: `Your kitchen efficiency is at ${(modelInputs.Kitchen_Efficiency * 100).toFixed(1)}%. Consider using energy-efficient appliances during off-peak hours.`,
        savings: `₹${((0.8 - modelInputs.Kitchen_Efficiency) * 30 * 6.5).toFixed(0)}/month`,
        carbonSaving: `${((0.8 - modelInputs.Kitchen_Efficiency) * 30 * 0.7).toFixed(0)} kg CO₂`,
        priority: "high",
        action: () => setModelInputs(prev => ({...prev, Kitchen_Efficiency: Math.min(0.9, prev.Kitchen_Efficiency + 0.1)}))
      });
    }

    // Laundry efficiency recommendation
    if (modelInputs.Laundry_Efficiency < 0.75) {
      recommendations.push({
        id: 2,
        icon: <Clock className="w-8 h-8 text-blue-500" />,
        title: "Optimize Laundry Schedule",
        description: `Your laundry efficiency is ${(modelInputs.Laundry_Efficiency * 100).toFixed(1)}%. Run full loads during low-demand hours (2AM-6AM).`,
        savings: `₹${((0.75 - modelInputs.Laundry_Efficiency) * 20 * 6.5).toFixed(0)}/month`,
        carbonSaving: `${((0.75 - modelInputs.Laundry_Efficiency) * 20 * 0.7).toFixed(0)} kg CO₂`,
        priority: "medium",
        action: () => setModelInputs(prev => ({...prev, Laundry_Efficiency: Math.min(0.85, prev.Laundry_Efficiency + 0.1)}))
      });
    }

    // Climate efficiency recommendation
    if (modelInputs.Climate_Efficiency < 0.7) {
      recommendations.push({
        id: 3,
        icon: <Target className="w-8 h-8 text-green-500" />,
        title: "Enhance Climate Control",
        description: `Your climate efficiency is ${(modelInputs.Climate_Efficiency * 100).toFixed(1)}%. Adjust thermostat settings and improve insulation.`,
        savings: `₹${((0.7 - modelInputs.Climate_Efficiency) * 40 * 6.5).toFixed(0)}/month`,
        carbonSaving: `${((0.7 - modelInputs.Climate_Efficiency) * 40 * 0.7).toFixed(0)} kg CO₂`,
        priority: "high",
        action: () => setModelInputs(prev => ({...prev, Climate_Efficiency: Math.min(0.8, prev.Climate_Efficiency + 0.1)}))
      });
    }

    // Time-based recommendation
    if (modelInputs.Hour >= 17 && modelInputs.Hour <= 21) {
      recommendations.push({
        id: 4,
        icon: <Clock className="w-8 h-8 text-purple-500" />,
        title: "Peak Hour Alert",
        description: "You're in peak consumption hours (5PM-9PM). Consider delaying non-essential appliance use.",
        savings: "₹780/month",
        carbonSaving: "8 kg CO₂",
        priority: "medium",
        action: () => {}
      });
    }

    return recommendations.slice(0, 3); // Return top 3 recommendations
  };

  const speak = (text) => {
    if (speechEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const fontSizeClasses = {
    large: 'text-lg',
    xlarge: 'text-xl',
    xxlarge: 'text-2xl'
  };

  const NavButton = ({ view, icon, label, isActive }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        speak(`Switched to ${label} view`);
      }}
      className={`flex flex-col items-center p-4 rounded-xl transition-all duration-200 ${
        isActive 
          ? 'bg-blue-500 text-white shadow-lg' 
          : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
      } ${fontSizeClasses[fontSize]}`}
    >
      {icon}
      <span className="mt-2 font-semibold">{label}</span>
    </button>
  );

  const MetricCard = ({ title, value, unit, icon, color = "blue", trend, onClick }) => (
    <div 
      className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 border-${color}-500 cursor-pointer hover:shadow-xl transition-shadow`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-gray-600 ${fontSizeClasses[fontSize]} font-medium`}>{title}</p>
          <p className={`text-3xl font-bold text-${color}-600 mt-2`}>{value} <span className="text-lg">{unit}</span></p>
          {trend && (
            <div className="flex items-center mt-2">
              <span className="text-green-500 text-sm font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`text-${color}-500`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const EfficiencySetupWizard = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h3 className={`text-2xl font-bold text-gray-800 mb-4 ${fontSizeClasses[fontSize]}`}>
        <Home className="w-8 h-8 inline mr-2 text-blue-500" />
        Tell Us About Your Home
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kitchen Setup */}
        <div className="space-y-4">
          <h4 className={`font-bold text-gray-700 ${fontSizeClasses[fontSize]}`}>Kitchen Appliances</h4>
          
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={userProfile.kitchen.appliances.includes('induction')}
                onChange={(e) => {
                  const appliances = e.target.checked 
                    ? [...userProfile.kitchen.appliances, 'induction']
                    : userProfile.kitchen.appliances.filter(a => a !== 'induction');
                  setUserProfile(prev => ({
                    ...prev,
                    kitchen: { ...prev.kitchen, appliances }
                  }));
                }}
                className="mr-3 h-5 w-5"
              />
              <span className={fontSizeClasses[fontSize]}>Induction Cooktop (+10% efficiency)</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={userProfile.kitchen.appliances.includes('microwave')}
                onChange={(e) => {
                  const appliances = e.target.checked 
                    ? [...userProfile.kitchen.appliances, 'microwave']
                    : userProfile.kitchen.appliances.filter(a => a !== 'microwave');
                  setUserProfile(prev => ({
                    ...prev,
                    kitchen: { ...prev.kitchen, appliances }
                  }));
                }}
                className="mr-3 h-5 w-5"
              />
              <span className={fontSizeClasses[fontSize]}>Microwave Oven (+5% efficiency)</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={userProfile.kitchen.appliances.includes('led_lighting')}
                onChange={(e) => {
                  const appliances = e.target.checked 
                    ? [...userProfile.kitchen.appliances, 'led_lighting']
                    : userProfile.kitchen.appliances.filter(a => a !== 'led_lighting');
                  setUserProfile(prev => ({
                    ...prev,
                    kitchen: { ...prev.kitchen, appliances }
                  }));
                }}
                className="mr-3 h-5 w-5"
              />
              <span className={fontSizeClasses[fontSize]}>LED Lights (+5% efficiency)</span>
            </label>
          </div>
          
          <div>
            <label className={`block text-gray-700 font-medium mb-2 ${fontSizeClasses[fontSize]}`}>
              Cooking Habits:
            </label>
            <select
              value={userProfile.kitchen.usage}
              onChange={(e) => setUserProfile(prev => ({
                ...prev,
                kitchen: { ...prev.kitchen, usage: e.target.value }
              }))}
              className={`w-full p-3 border-2 border-gray-300 rounded-xl ${fontSizeClasses[fontSize]}`}
            >
              <option value="wasteful">Cook whenever needed (-20%)</option>
              <option value="normal">Regular cooking habits</option>
              <option value="optimized">Plan meals & batch cook (+10%)</option>
            </select>
          </div>
        </div>

        {/* Laundry Setup */}
        <div className="space-y-4">
          <h4 className={`font-bold text-gray-700 ${fontSizeClasses[fontSize]}`}>Laundry Setup</h4>
          
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={userProfile.laundry.machines.includes('front_load')}
                onChange={(e) => {
                  const machines = e.target.checked 
                    ? [...userProfile.laundry.machines, 'front_load']
                    : userProfile.laundry.machines.filter(m => m !== 'front_load');
                  setUserProfile(prev => ({
                    ...prev,
                    laundry: { ...prev.laundry, machines }
                  }));
                }}
                className="mr-3 h-5 w-5"
              />
              <span className={fontSizeClasses[fontSize]}>Front-load Washer (+15% efficiency)</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={userProfile.laundry.machines.includes('inverter')}
                onChange={(e) => {
                  const machines = e.target.checked 
                    ? [...userProfile.laundry.machines, 'inverter']
                    : userProfile.laundry.machines.filter(m => m !== 'inverter');
                  setUserProfile(prev => ({
                    ...prev,
                    laundry: { ...prev.laundry, machines }
                  }));
                }}
                className="mr-3 h-5 w-5"
              />
              <span className={fontSizeClasses[fontSize]}>Inverter Technology (+10% efficiency)</span>
            </label>
          </div>
          
          <div>
            <label className={`block text-gray-700 font-medium mb-2 ${fontSizeClasses[fontSize]}`}>
              Washing Habits:
            </label>
            <select
              value={userProfile.laundry.habits}
              onChange={(e) => setUserProfile(prev => ({
                ...prev,
                laundry: { ...prev.laundry, habits: e.target.value }
              }))}
              className={`w-full p-3 border-2 border-gray-300 rounded-xl ${fontSizeClasses[fontSize]}`}
            >
              <option value="small_loads">Wash small loads frequently</option>
              <option value="full_loads">Always wash full loads (+10%)</option>
              <option value="air_dry">Air dry clothes (+5%)</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-gray-700 font-medium mb-2 ${fontSizeClasses[fontSize]}`}>
              Water Temperature:
            </label>
            <select
              value={userProfile.laundry.temperature}
              onChange={(e) => setUserProfile(prev => ({
                ...prev,
                laundry: { ...prev.laundry, temperature: e.target.value }
              }))}
              className={`w-full p-3 border-2 border-gray-300 rounded-xl ${fontSizeClasses[fontSize]}`}
            >
              <option value="hot_wash">Hot water wash</option>
              <option value="warm_wash">Warm water wash</option>
              <option value="cold_wash">Cold water wash (+10%)</option>
            </select>
          </div>
        </div>

        {/* Climate Setup */}
        <div className="space-y-4">
          <h4 className={`font-bold text-gray-700 ${fontSizeClasses[fontSize]}`}>Climate Control</h4>
          
          <div>
            <label className={`block text-gray-700 font-medium mb-2 ${fontSizeClasses[fontSize]}`}>
              AC Type:
            </label>
            <select
              value={userProfile.climate.hvac}
              onChange={(e) => setUserProfile(prev => ({
                ...prev,
                climate: { ...prev.climate, hvac: e.target.value }
              }))}
              className={`w-full p-3 border-2 border-gray-300 rounded-xl ${fontSizeClasses[fontSize]}`}
            >
              <option value="old_ac">Old AC (>10 years) (-10%)</option>
              <option value="split_ac">Split AC (+10%)</option>
              <option value="inverter_ac">Inverter AC (+15%)</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-gray-700 font-medium mb-2 ${fontSizeClasses[fontSize]}`}>
              Home Insulation:
            </label>
            <select
              value={userProfile.climate.insulation}
              onChange={(e) => setUserProfile(prev => ({
                ...prev,
                climate: { ...prev.climate, insulation: e.target.value }
              }))}
              className={`w-full p-3 border-2 border-gray-300 rounded-xl ${fontSizeClasses[fontSize]}`}
            >
              <option value="poor">Poor insulation (-10%)</option>
              <option value="average">Average insulation</option>
              <option value="good">Good insulation (+10%)</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-gray-700 font-medium mb-2 ${fontSizeClasses[fontSize]}`}>
              Maintenance:
            </label>
            <select
              value={userProfile.climate.maintenance}
              onChange={(e) => setUserProfile(prev => ({
                ...prev,
                climate: { ...prev.climate, maintenance: e.target.value }
              }))}
              className={`w-full p-3 border-2 border-gray-300 rounded-xl ${fontSizeClasses[fontSize]}`}
            >
              <option value="never">Never serviced (-15%)</option>
              <option value="yearly">Yearly service</option>
              <option value="regular">Regular cleaning (+8%)</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-blue-50 rounded-xl p-4">
        <h4 className={`font-bold text-blue-800 mb-2 ${fontSizeClasses[fontSize]}`}>
          Your Current Efficiency Scores:
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-blue-600 font-medium">Kitchen</p>
            <p className="text-2xl font-bold text-blue-800">
              {(calculatedEfficiencies.Kitchen_Efficiency * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-blue-600 font-medium">Laundry</p>
            <p className="text-2xl font-bold text-blue-800">
              {(calculatedEfficiencies.Laundry_Efficiency * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-blue-600 font-medium">Climate</p>
            <p className="text-2xl font-bold text-blue-800">
              {(calculatedEfficiencies.Climate_Efficiency * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <h2 className={`text-3xl font-bold text-gray-800 mb-6 ${fontSizeClasses[fontSize]}`}>
        Smart Energy Analysis
      </h2>
      
      <EfficiencySetupWizard />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Current Power"
          value={currentPrediction?.toFixed(2) || "0.00"}
          unit="kW"
          icon={<Zap className="w-8 h-8" />}
          color="blue"
          trend="Real-time prediction"
          onClick={() => speak(`Current predicted power consumption is ${currentPrediction?.toFixed(2)} kilowatts`)}
        />
        <MetricCard
          title="Hourly Cost"
          value={`₹${(currentPrediction * 6.5)?.toFixed(2) || "0.00"}`}
          unit=""
          icon={<DollarSign className="w-8 h-8" />}
          color="green"
          trend="Based on ₹6.5/kWh"
          onClick={() => speak(`Estimated hourly cost is ${(currentPrediction * 6.5)?.toFixed(2)} rupees`)}
        />
        <MetricCard
          title="Avg Efficiency"
          value={((modelInputs.Kitchen_Efficiency + modelInputs.Laundry_Efficiency + modelInputs.Climate_Efficiency) / 3 * 100).toFixed(1)}
          unit="%"
          icon={<Activity className="w-8 h-8" />}
          color="purple"
          trend="All systems"
          onClick={() => speak(`Average efficiency across all systems is ${((modelInputs.Kitchen_Efficiency + modelInputs.Laundry_Efficiency + modelInputs.Climate_Efficiency) / 3 * 100).toFixed(1)} percent`)}
        />
        <MetricCard
          title="Weekly Prediction"
          value={weeklyPredictions.reduce((sum, day) => sum + day.predicted, 0).toFixed(1)}
          unit="kW"
          icon={<TrendingDown className="w-8 h-8" />}
          color="indigo"
          trend="7-day forecast"
          onClick={() => speak(`Weekly predicted consumption is ${weeklyPredictions.reduce((sum, day) => sum + day.predicted, 0).toFixed(1)} kilowatts`)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className={`text-2xl font-bold text-gray-800 mb-4 ${fontSizeClasses[fontSize]}`}>
            24-Hour Power Prediction
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tick={{ fontSize: 14 }} />
              <YAxis tick={{ fontSize: 14 }} />
              <Tooltip 
                contentStyle={{ fontSize: '16px', padding: '12px' }}
                formatter={(value, name) => [`${value.toFixed(3)} kW`, 'Power Consumption']}
              />
              <Line 
                type="monotone" 
                dataKey="consumption" 
                stroke="#4F46E5" 
                strokeWidth={4}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className={`text-2xl font-bold text-gray-800 mb-4 ${fontSizeClasses[fontSize]}`}>
            System Efficiency Comparison
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={efficiencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="appliance" tick={{ fontSize: 14 }} />
              <YAxis tick={{ fontSize: 14 }} />
              <Tooltip 
                contentStyle={{ fontSize: '16px', padding: '12px' }}
                formatter={(value, name) => [`${value.toFixed(1)}%`, name === 'current' ? 'Current' : 'Optimal']}
              />
              <Bar dataKey="optimal" fill="#E5E7EB" name="optimal" />
              <Bar dataKey="current" fill="#4F46E5" name="current" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderRecommendations = () => {
    const recommendations = generateRecommendations();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-3xl font-bold text-gray-800 ${fontSizeClasses[fontSize]}`}>
            AI-Powered Recommendations
          </h2>
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-500" />
            <span className={`text-purple-600 font-semibold ${fontSizeClasses[fontSize]}`}>
              ML Model Insights
            </span>
          </div>
        </div>

        {recommendations.map((rec) => (
          <div key={rec.id} className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-start space-x-4">
              {rec.icon}
              <div className="flex-1">
                <h3 className={`font-bold text-gray-800 ${fontSizeClasses[fontSize]} mb-2`}>
                  {rec.title}
                </h3>
                <p className={`text-gray-600 ${fontSizeClasses[fontSize]} mb-4 leading-relaxed`}>
                  {rec.description}
                </p>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-green-500 mr-2" />
                    <span className={`font-semibold text-green-600 ${fontSizeClasses[fontSize]}`}>
                      {rec.savings}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Leaf className="w-5 h-5 text-green-500 mr-2" />
                    <span className={`font-semibold text-green-600 ${fontSizeClasses[fontSize]}`}>
                      {rec.carbonSaving}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    rec.action();
                    speak(`Applied recommendation: ${rec.title}`);
                  }}
                  className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors font-semibold mr-4"
                >
                  Apply This Tip
                </button>
                <button
                  onClick={() => speak(`${rec.title}. ${rec.description}. This can save ${rec.savings} per month.`)}
                  className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors font-semibold"
                >
                  Read Aloud
                </button>
              </div>
            </div>
          </div>
        ))}

        {recommendations.length === 0 && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
            <Lightbulb className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className={`text-2xl font-bold text-green-800 mb-2 ${fontSizeClasses[fontSize]}`}>
              Excellent Efficiency!
            </h3>
            <p className={`text-green-700 ${fontSizeClasses[fontSize]}`}>
              Your current settings are already optimized. Keep up the great work!
            </p>
          </div>
        )}

        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
          <h3 className={`text-2xl font-bold text-green-800 mb-4 ${fontSizeClasses[fontSize]}`}>
            Your Potential Impact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">₹21,840</p>
              <p className={`text-green-700 ${fontSizeClasses[fontSize]}`}>Yearly Savings</p>
            </div>
            <div className="text-center">
              <Leaf className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">264 kg</p>
              <p className={`text-green-700 ${fontSizeClasses[fontSize]}`}>CO₂ Reduced</p>
            </div>
            <div className="text-center">
              <Home className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">22%</p>
              <p className={`text-green-700 ${fontSizeClasses[fontSize]}`}>Energy Saved</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className={`text-3xl font-bold text-gray-800 mb-6 ${fontSizeClasses[fontSize]}`}>
        Accessibility & Settings
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className={`text-2xl font-bold text-gray-800 mb-4 ${fontSizeClasses[fontSize]}`}>
            Display Settings
          </h3>
          <div className="space-y-3">
            {['large', 'xlarge', 'xxlarge'].map((size) => (
              <button
                key={size}
                onClick={() => {
                  setFontSize(size);
                  speak(`Text size changed to ${size.replace('x', 'extra ')}`);
                }}
                className={`w-full p-4 text-left rounded-xl border-2 transition-colors ${
                  fontSize === size 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${fontSizeClasses[size]}`}
              >
                {size === 'large' ? 'Large' : size === 'xlarge' ? 'Extra Large' : 'Extra Extra Large'} Text
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className={`text-2xl font-bold text-gray-800 mb-4 ${fontSizeClasses[fontSize]}`}>
            Voice Assistant
          </h3>
          <div className="space-y-4">
            <button
              onClick={() => {
                setSpeechEnabled(!speechEnabled);
                speak(speechEnabled ? 'Voice assistant disabled' : 'Voice assistant enabled');
              }}
              className={`w-full p-4 rounded-xl border-2 transition-colors flex items-center justify-between ${
                speechEnabled 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className={`${fontSizeClasses[fontSize]} font-semibold`}>
                Voice Reading
              </span>
              <Volume2 className={`w-6 h-6 ${speechEnabled ? 'text-green-500' : 'text-gray-400'}`} />
            </button>
            
            <button
              onClick={() => speak(`Current model prediction is ${currentPrediction?.toFixed(3)} kilowatts. Your kitchen efficiency is ${(modelInputs.Kitchen_Efficiency * 100).toFixed(1)} percent. Your laundry efficiency is ${(modelInputs.Laundry_Efficiency * 100).toFixed(1)} percent. Your climate efficiency is ${(modelInputs.Climate_Efficiency * 100).toFixed(1)} percent. Based on Indian electricity rates.`)}
              disabled={!speechEnabled}
              className={`w-full p-4 rounded-xl border-2 transition-colors ${
                speechEnabled
                  ? 'border-blue-500 bg-blue-500 text-white hover:bg-blue-600'
                  : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              } ${fontSizeClasses[fontSize]} font-semibold`}
            >
              Read Model Status
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className={`text-2xl font-bold text-gray-800 mb-4 ${fontSizeClasses[fontSize]}`}>
          Quick Model Tests
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setUserProfile({
                kitchen: { appliances: [], usage: 'wasteful', timings: 'peak' },
                laundry: { machines: [], habits: 'small_loads', temperature: 'hot_wash' },
                climate: { hvac: 'old_ac', insulation: 'poor', maintenance: 'never', settings: 'extreme' }
              });
              speak('Applied high consumption scenario for testing');
            }}
            className="p-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
          >
            <span className={`${fontSizeClasses[fontSize]} font-semibold`}>High Usage Scenario</span>
          </button>
          <button
            onClick={() => {
              setUserProfile({
                kitchen: { appliances: ['induction', 'microwave', 'led_lighting'], usage: 'optimized', timings: 'off_peak' },
                laundry: { machines: ['front_load', 'inverter'], habits: 'air_dry', temperature: 'cold_wash' },
                climate: { hvac: 'inverter_ac', insulation: 'good', maintenance: 'regular', settings: 'optimal_temp' }
              });
              speak('Applied optimal efficiency scenario for testing');
            }}
            className="p-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
          >
            <span className={`${fontSizeClasses[fontSize]} font-semibold`}>Optimal Scenario</span>
          </button>
          <button
            onClick={() => {
              setUserProfile({
                kitchen: { appliances: ['induction', 'microwave'], usage: 'optimized', timings: 'off_peak' },
                laundry: { machines: ['front_load'], habits: 'full_loads', temperature: 'cold_wash' },
                climate: { hvac: 'inverter_ac', insulation: 'good', maintenance: 'regular', settings: 'optimal_temp' }
              });
              speak('Reset to default optimized values');
            }}
            className="p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            <span className={`${fontSizeClasses[fontSize]} font-semibold`}>Reset to Default</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-10 h-10 text-purple-500" />
              <h1 className={`font-bold text-gray-800 ${fontSizeClasses[fontSize]} text-2xl`}>
                GreenSense
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {speechEnabled && (
                <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
                  <Volume2 className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">Voice On</span>
                </div>
              )}
              <div className="bg-purple-100 px-3 py-2 rounded-lg">
                <span className="text-purple-600 font-medium">
                  {currentPrediction?.toFixed(3)} kW
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b-2 border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <NavButton
              view="overview"
              icon={<Home className="w-8 h-8" />}
              label="Home Setup"
              isActive={currentView === 'overview'}
            />
            <NavButton
              view="recommendations"
              icon={<Lightbulb className="w-8 h-8" />}
              label="AI Tips"
              isActive={currentView === 'recommendations'}
            />
            <NavButton
              view="settings"
              icon={<Settings className="w-8 h-8" />}
              label="Settings"
              isActive={currentView === 'settings'}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'overview' && renderOverview()}
        {currentView === 'recommendations' && renderRecommendations()}
        {currentView === 'settings' && renderSettings()}
      </main>
    </div>
  );
};

export default EnergyDashboard