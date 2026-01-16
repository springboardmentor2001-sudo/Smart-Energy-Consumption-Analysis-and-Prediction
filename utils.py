"""
Utility functions for Smart Energy Consumption Analysis
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from datetime import datetime, timedelta

class EnergyDataProcessor:
    """Process and prepare energy data for predictions and analysis"""
    
    def __init__(self, csv_path='Energy_consumption.csv'):
        self.csv_path = csv_path
        self.scaler = MinMaxScaler()
        self.data = None
        self.load_data()
    
    def load_data(self):
        """Load and preprocess the energy consumption data"""
        self.data = pd.read_csv(self.csv_path)
        self.data['Timestamp'] = pd.to_datetime(self.data['Timestamp'])
        
        # Encode categorical variables
        self.data['HVACUsage_encoded'] = (self.data['HVACUsage'] == 'On').astype(int)
        self.data['LightingUsage_encoded'] = (self.data['LightingUsage'] == 'On').astype(int)
        self.data['Holiday_encoded'] = (self.data['Holiday'] == 'Yes').astype(int)
        
        # Encode day of week
        day_mapping = {
            'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3,
            'Friday': 4, 'Saturday': 5, 'Sunday': 6
        }
        self.data['DayOfWeek_encoded'] = self.data['DayOfWeek'].map(day_mapping)
        
    def prepare_prediction_input(self, input_data):
        """
        Prepare input data for LSTM prediction
        
        Args:
            input_data (dict): Dictionary with feature values
            
        Returns:
            np.array: Scaled and shaped input for LSTM model
        """
        # Feature order for model input
        features = [
            'Temperature', 'Humidity', 'SquareFootage', 'Occupancy',
            'HVACUsage_encoded', 'LightingUsage_encoded', 
            'RenewableEnergy', 'DayOfWeek_encoded', 'Holiday_encoded'
        ]
        
        # Create feature array
        feature_values = []
        for feature in features:
            if feature in input_data:
                feature_values.append(input_data[feature])
            elif feature == 'HVACUsage_encoded':
                feature_values.append(1 if input_data.get('HVACUsage') == 'On' else 0)
            elif feature == 'LightingUsage_encoded':
                feature_values.append(1 if input_data.get('LightingUsage') == 'On' else 0)
            elif feature == 'Holiday_encoded':
                feature_values.append(1 if input_data.get('Holiday') == 'Yes' else 0)
            elif feature == 'DayOfWeek_encoded':
                day_mapping = {
                    'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3,
                    'Friday': 4, 'Saturday': 5, 'Sunday': 6
                }
                feature_values.append(day_mapping.get(input_data.get('DayOfWeek', 'Monday'), 0))
        
        # Convert to numpy array and reshape for LSTM (samples, timesteps, features)
        feature_array = np.array(feature_values).reshape(1, 1, -1)
        
        return feature_array
    
    def get_historical_data(self, limit=100):
        """Get recent historical data for visualization"""
        recent_data = self.data.tail(limit).copy()
        
        return {
            'timestamps': recent_data['Timestamp'].dt.strftime('%Y-%m-%d %H:%M').tolist(),
            'consumption': recent_data['EnergyConsumption'].tolist(),
            'temperature': recent_data['Temperature'].tolist(),
            'humidity': recent_data['Humidity'].tolist()
        }
    
    def get_device_analysis(self):
        """Analyze energy consumption by device/factor"""
        
        # HVAC analysis
        hvac_on = self.data[self.data['HVACUsage'] == 'On']['EnergyConsumption'].mean()
        hvac_off = self.data[self.data['HVACUsage'] == 'Off']['EnergyConsumption'].mean()
        
        # Lighting analysis
        light_on = self.data[self.data['LightingUsage'] == 'On']['EnergyConsumption'].mean()
        light_off = self.data[self.data['LightingUsage'] == 'Off']['EnergyConsumption'].mean()
        
        # Occupancy analysis
        occupancy_avg = self.data.groupby('Occupancy')['EnergyConsumption'].mean().to_dict()
        
        return {
            'hvac': {
                'on': round(hvac_on, 2),
                'off': round(hvac_off, 2),
                'impact': round(hvac_on - hvac_off, 2)
            },
            'lighting': {
                'on': round(light_on, 2),
                'off': round(light_off, 2),
                'impact': round(light_on - light_off, 2)
            },
            'occupancy': {k: round(v, 2) for k, v in occupancy_avg.items()}
        }
    
    def get_statistics(self):
        """Get overall energy consumption statistics"""
        return {
            'total_records': len(self.data),
            'avg_consumption': round(self.data['EnergyConsumption'].mean(), 2),
            'max_consumption': round(self.data['EnergyConsumption'].max(), 2),
            'min_consumption': round(self.data['EnergyConsumption'].min(), 2),
            'std_consumption': round(self.data['EnergyConsumption'].std(), 2),
            'avg_temperature': round(self.data['Temperature'].mean(), 2),
            'avg_humidity': round(self.data['Humidity'].mean(), 2),
            'avg_occupancy': round(self.data['Occupancy'].mean(), 2)
        }
    
    def get_smart_suggestions(self, current_data):
        """Generate smart energy-saving suggestions based on current data"""
        suggestions = []
        
        # Temperature-based suggestions
        temp = current_data.get('Temperature', 25)
        if temp > 26:
            suggestions.append({
                'icon': '🌡️',
                'title': 'Temperature Optimization',
                'message': f'Current temperature is {temp}°C. Consider reducing HVAC usage or adjusting thermostat to 24-26°C for optimal efficiency.',
                'savings': '10-15%'
            })
        
        # HVAC suggestions
        if current_data.get('HVACUsage') == 'On' and current_data.get('Occupancy', 0) < 3:
            suggestions.append({
                'icon': '❄️',
                'title': 'HVAC Optimization',
                'message': 'HVAC is running with low occupancy. Consider using zone-based cooling or reducing HVAC intensity.',
                'savings': '15-20%'
            })
        
        # Lighting suggestions
        if current_data.get('LightingUsage') == 'On':
            suggestions.append({
                'icon': '💡',
                'title': 'Lighting Efficiency',
                'message': 'Switch to LED bulbs and use motion sensors to reduce lighting energy consumption.',
                'savings': '5-10%'
            })
        
        # Renewable energy suggestions
        renewable = current_data.get('RenewableEnergy', 0)
        if renewable < 15:
            suggestions.append({
                'icon': '☀️',
                'title': 'Renewable Energy',
                'message': f'Current renewable contribution is {renewable:.1f}%. Consider installing solar panels to increase renewable energy usage.',
                'savings': '20-30%'
            })
        
        # Occupancy-based suggestions
        occupancy = current_data.get('Occupancy', 0)
        if occupancy > 7:
            suggestions.append({
                'icon': '👥',
                'title': 'High Occupancy Alert',
                'message': 'High occupancy detected. Ensure efficient use of shared spaces and consider staggered schedules.',
                'savings': '5-8%'
            })
        
        # Default suggestion if none triggered
        if not suggestions:
            suggestions.append({
                'icon': '✅',
                'title': 'Optimal Performance',
                'message': 'Your energy usage is well-optimized! Continue monitoring for further improvements.',
                'savings': '0%'
            })
        
        return suggestions
    
    def get_hourly_pattern(self):
        """Get hourly consumption pattern"""
        self.data['Hour'] = self.data['Timestamp'].dt.hour
        hourly_avg = self.data.groupby('Hour')['EnergyConsumption'].mean()
        
        return {
            'hours': list(range(24)),
            'consumption': [round(hourly_avg.get(h, 0), 2) for h in range(24)]
        }
    
    def get_daily_pattern(self):
        """Get daily consumption pattern"""
        day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        daily_avg = self.data.groupby('DayOfWeek')['EnergyConsumption'].mean()
        
        return {
            'days': day_order,
            'consumption': [round(daily_avg.get(day, 0), 2) for day in day_order]
        }
