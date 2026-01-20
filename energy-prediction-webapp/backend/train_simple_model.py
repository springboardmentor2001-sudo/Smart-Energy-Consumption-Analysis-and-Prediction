"""
Simple Energy Prediction Model Training Script
Uses ensemble learning with XGBoost, LightGBM, and RandomForest
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error, mean_absolute_percentage_error
import xgboost as xgb
import lightgbm as lgb
from sklearn.ensemble import RandomForestRegressor, VotingRegressor
import joblib
import warnings
warnings.filterwarnings('ignore')

def create_synthetic_training_data(n_samples=5000):
    """Generate synthetic energy consumption data"""
    np.random.seed(42)
    
    data = {
        'Temperature': np.random.uniform(-5, 40, n_samples),
        'Humidity': np.random.uniform(20, 90, n_samples),
        'SquareFootage': np.random.uniform(1000, 20000, n_samples),
        'Month': np.random.randint(1, 13, n_samples),
        'Hour': np.random.randint(0, 24, n_samples),
        'HVAC_Appliances': np.random.randint(0, 10, n_samples),
    }
    
    df = pd.DataFrame(data)
    
    # Calculate target
    base = 500 + (df['SquareFootage'] / 1000) * 100
    temp_impact = np.abs(df['Temperature'] - 20) * 15
    humidity_impact = np.abs(df['Humidity'] - 50) * 2
    hour_impact = np.where((df['Hour'] >= 14) & (df['Hour'] <= 19), 50, 0)
    seasonal_multiplier = np.where(df['Month'].isin([12, 1, 2]), 1.3,
                                   np.where(df['Month'].isin([6, 7, 8]), 1.25, 1.0))
    appliances_impact = df['HVAC_Appliances'] * 30
    noise = np.random.normal(0, 50, n_samples)
    
    df['Energy_Consumption'] = (
        (base + temp_impact + humidity_impact + hour_impact + appliances_impact) * seasonal_multiplier + noise
    ).clip(lower=200)
    
    return df

def engineer_features(df):
    """Create advanced features"""
    df_copy = df.copy()
    
    # Cyclical encoding
    df_copy['Month_sin'] = np.sin(2 * np.pi * df_copy['Month'] / 12)
    df_copy['Month_cos'] = np.cos(2 * np.pi * df_copy['Month'] / 12)
    df_copy['Hour_sin'] = np.sin(2 * np.pi * df_copy['Hour'] / 24)
    df_copy['Hour_cos'] = np.cos(2 * np.pi * df_copy['Hour'] / 24)
    
    # Degree days
    df_copy['HDD'] = np.maximum(65 - df_copy['Temperature'], 0)
    df_copy['CDD'] = np.maximum(df_copy['Temperature'] - 65, 0)
    df_copy['HDD_Squared'] = df_copy['HDD'] ** 2
    df_copy['CDD_Squared'] = df_copy['CDD'] ** 2
    
    # Interactions
    df_copy['HDD_x_SquareFootage'] = df_copy['HDD'] * df_copy['SquareFootage']
    df_copy['CDD_x_SquareFootage'] = df_copy['CDD'] * df_copy['SquareFootage']
    
    # Binary features
    df_copy['Heating_On'] = (df_copy['Temperature'] < 60).astype(int)
    df_copy['Cooling_On'] = (df_copy['Temperature'] > 75).astype(int)
    df_copy['Peak_Hours'] = ((df_copy['Hour'] >= 14) & (df_copy['Hour'] <= 19)).astype(int)
    df_copy['Night_Hours'] = ((df_copy['Hour'] >= 22) | (df_copy['Hour'] <= 6)).astype(int)
    
    # Season one-hot
    df_copy['Season_Winter'] = df_copy['Month'].isin([12, 1, 2]).astype(int)
    df_copy['Season_Spring'] = df_copy['Month'].isin([3, 4, 5]).astype(int)
    df_copy['Season_Summer'] = df_copy['Month'].isin([6, 7, 8]).astype(int)
    df_copy['Season_Fall'] = df_copy['Month'].isin([9, 10, 11]).astype(int)
    
    # HVAC type (dummy)
    df_copy['HVAC_CentralAC'] = 1
    df_copy['HVAC_HeatPump'] = 0
    df_copy['HVAC_WindowAC'] = 0
    df_copy['HVAC_Baseboard'] = 0
    df_copy['HVAC_Other'] = 0
    
    # Multiplications
    df_copy['Temp_Humidity'] = df_copy['Temperature'] * df_copy['Humidity']
    df_copy['Temp_SquareFootage'] = df_copy['Temperature'] * df_copy['SquareFootage']
    df_copy['Humidity_SquareFootage'] = df_copy['Humidity'] * df_copy['SquareFootage']
    df_copy['Appliances_SquareFootage'] = df_copy['HVAC_Appliances'] * df_copy['SquareFootage']
    
    # Deviations
    df_copy['Temp_Range_Deviation'] = np.abs(df_copy['Temperature'] - df_copy['Temperature'].mean())
    df_copy['Humidity_Deviation'] = np.abs(df_copy['Humidity'] - df_copy['Humidity'].mean())
    
    # Categorization
    df_copy['SquareFootage_Category'] = pd.cut(df_copy['SquareFootage'], bins=5, labels=False)
    
    return df_copy

def train_models(X_train, X_test, y_train, y_test):
    """Train ensemble models"""
    
    print("\n[STEP 1] Training XGBoost...")
    xgb_model = xgb.XGBRegressor(
        n_estimators=100,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.8,
        random_state=42,
        n_jobs=1
    )
    xgb_model.fit(X_train, y_train)
    xgb_pred = xgb_model.predict(X_test)
    xgb_r2 = r2_score(y_test, xgb_pred)
    print(f"  XGBoost R2: {xgb_r2:.4f}")
    
    print("\n[STEP 2] Training LightGBM...")
    lgb_model = lgb.LGBMRegressor(
        n_estimators=100,
        learning_rate=0.05,
        max_depth=6,
        num_leaves=31,
        random_state=42,
        n_jobs=1,
        verbose=-1
    )
    lgb_model.fit(X_train, y_train)
    lgb_pred = lgb_model.predict(X_test)
    lgb_r2 = r2_score(y_test, lgb_pred)
    print(f"  LightGBM R2: {lgb_r2:.4f}")
    
    print("\n[STEP 3] Training RandomForest...")
    rf_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=15,
        random_state=42,
        n_jobs=1
    )
    rf_model.fit(X_train, y_train)
    rf_pred = rf_model.predict(X_test)
    rf_r2 = r2_score(y_test, rf_pred)
    print(f"  RandomForest R2: {rf_r2:.4f}")
    
    print("\n[STEP 4] Creating Ensemble...")
    ensemble = VotingRegressor(
        estimators=[
            ('xgb', xgb_model),
            ('lgb', lgb_model),
            ('rf', rf_model)
        ],
        weights=[0.4, 0.4, 0.2]
    )
    ensemble.fit(X_train, y_train)
    ensemble_pred = ensemble.predict(X_test)
    ensemble_r2 = r2_score(y_test, ensemble_pred)
    ensemble_rmse = np.sqrt(mean_squared_error(y_test, ensemble_pred))
    ensemble_mae = mean_absolute_error(y_test, ensemble_pred)
    
    mape = mean_absolute_percentage_error(y_test, ensemble_pred)
    accuracy = (1 - mape) * 100 if mape <= 1 else 0
    
    print(f"  Ensemble R2: {ensemble_r2:.4f}")
    print(f"  Ensemble RMSE: {ensemble_rmse:.2f}")
    print(f"  Ensemble MAE: {ensemble_mae:.2f}")
    print(f"  Ensemble Accuracy: {accuracy:.2f}%")
    
    return ensemble, {
        'r2': ensemble_r2,
        'rmse': ensemble_rmse,
        'mae': ensemble_mae,
        'accuracy': accuracy
    }

def main():
    print("=" * 80)
    print("ENERGY PREDICTION MODEL TRAINING")
    print("=" * 80)
    
    print("\n[STEP 1] Generating training data...")
    df = create_synthetic_training_data(5000)
    print(f"  Samples: {len(df)}")
    print(f"  Energy range: {df['Energy_Consumption'].min():.0f} - {df['Energy_Consumption'].max():.0f} kWh")
    
    print("\n[STEP 2] Engineering features...")
    df_engineered = engineer_features(df)
    feature_cols = [col for col in df_engineered.columns if col != 'Energy_Consumption']
    print(f"  Total features: {len(feature_cols)}")
    
    X = df_engineered[feature_cols]
    y = df_engineered['Energy_Consumption']
    
    print("\n[STEP 3] Scaling features...")
    scaler = MinMaxScaler()
    X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=X.columns)
    
    print("\n[STEP 4] Train/test split...")
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    print(f"  Training: {len(X_train)} samples")
    print(f"  Testing: {len(X_test)} samples")
    
    print("\n[STEP 5] Training models...")
    ensemble, metrics = train_models(X_train, X_test, y_train, y_test)
    
    print("\n[STEP 6] Saving models...")
    joblib.dump(ensemble, 'energy_model.pkl')
    joblib.dump(scaler, 'feature_scaler.pkl')
    joblib.dump(metrics, 'model_performance.pkl')
    print("  Models saved successfully!")
    
    print("\n" + "=" * 80)
    print("TRAINING COMPLETE")
    print("=" * 80)
    print(f"Best Model: ENSEMBLE")
    print(f"Accuracy: {metrics['accuracy']:.2f}%")
    print(f"Ready for deployment!")

if __name__ == '__main__':
    main()
