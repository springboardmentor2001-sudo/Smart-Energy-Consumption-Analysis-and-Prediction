"""
Configuration management for SmartEnergy API
Supports multiple environments (development, production, testing)
"""

import os
from typing import List

class Config:
    """Base configuration with defaults"""
    
    # Model Configuration
    MODEL_PATH: str = os.environ.get('MODEL_PATH', 'random_forest_model.pkl')
    
    # Server Configuration
    DEBUG: bool = os.environ.get('DEBUG', 'True').lower() == 'true'
    HOST: str = os.environ.get('HOST', '0.0.0.0')
    PORT: int = int(os.environ.get('PORT', 5000))
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = os.environ.get(
        'CORS_ORIGINS', 
        'http://localhost:5173,http://localhost:3000'
    ).split(',')
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = os.environ.get('RATE_LIMIT_ENABLED', 'True').lower() == 'true'
    RATE_LIMIT_DEFAULT: str = os.environ.get('RATE_LIMIT_DEFAULT', '200 per day, 50 per hour')
    RATE_LIMIT_PREDICT: str = os.environ.get('RATE_LIMIT_PREDICT', '30 per minute')
    
    # Data Validation
    VALIDATION_STRICT: bool = os.environ.get('VALIDATION_STRICT', 'True').lower() == 'true'
    
    # Feature Validation Ranges
    VALIDATION_RULES = {
        'temperature': {'min': -50, 'max': 60, 'name': 'Temperature', 'unit': '°C'},
        'humidity': {'min': 0, 'max': 100, 'name': 'Humidity', 'unit': '%'},
        'occupancy': {'min': 0, 'max': 10000, 'name': 'Occupancy', 'unit': 'people'},
        'renewable': {'min': 0, 'max': 1000, 'name': 'Renewable Energy', 'unit': 'kW'},
        'hvac_status': {'min': 0, 'max': 1, 'name': 'HVAC Status', 'unit': ''},
        'lighting_status': {'min': 0, 'max': 1, 'name': 'Lighting Status', 'unit': ''},
    }
    
    # Warning Thresholds (for unusual but valid values)
    WARNING_THRESHOLDS = {
        'temperature': {'min': -20, 'max': 45},
        'occupancy': {'max': 5000},
        'humidity': {'min': 10, 'max': 90}
    }

class DevelopmentConfig(Config):
    """Development environment configuration"""
    DEBUG = True
    VALIDATION_STRICT = False  # More lenient in development

class ProductionConfig(Config):
    """Production environment configuration"""
    DEBUG = False
    VALIDATION_STRICT = True
    
    # Override with environment variables (required in production)
    def __init__(self):
        if not os.environ.get('SECRET_KEY'):
            raise ValueError("SECRET_KEY must be set in production environment")

class TestingConfig(Config):
    """Testing environment configuration"""
    DEBUG = True
    RATE_LIMIT_ENABLED = False  # Disable rate limiting in tests
    VALIDATION_STRICT = True

# Configuration dictionary
config_map = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

# Get active configuration
ENV = os.environ.get('FLASK_ENV', 'development')
config = config_map.get(ENV, config_map['default'])()

# Print configuration on load
print(f"📝 Configuration loaded: {ENV.upper()}")
print(f"   Model Path: {config.MODEL_PATH}")
print(f"   Debug Mode: {config.DEBUG}")
print(f"   Port: {config.PORT}")
print(f"   Rate Limiting: {config.RATE_LIMIT_ENABLED}")
