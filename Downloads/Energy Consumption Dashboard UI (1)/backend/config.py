"""
SmartEnergy Backend Configuration
Environment-specific settings and constants
"""

import os
from typing import List

class Config:
    """Configuration class for SmartEnergy backend"""

    # Model settings
    MODEL_PATH = os.getenv('MODEL_PATH', 'random_forest_model.pkl')

    # Server settings
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))

    # CORS settings
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'https://energy-consumption-dashboard-ui-1.vercel.app,http://localhost:3000').split(',')

    # Rate limiting
    RATE_LIMIT_REQUESTS = int(os.getenv('RATE_LIMIT_REQUESTS', 200))
    RATE_LIMIT_PERIOD = os.getenv('RATE_LIMIT_PERIOD', '1 day')

    # Validation settings
    VALIDATION_STRICT = os.getenv('VALIDATION_STRICT', 'False').lower() == 'true'

    # Validation rules
    VALIDATION_RULES = {
        'temperature': {'min': -50, 'max': 60, 'required': True},
        'humidity': {'min': 0, 'max': 100, 'required': True},
        'occupancy': {'min': 0, 'max': 10000, 'required': True},
        'renewable': {'min': 0, 'max': 100, 'required': True},
        'timestamp': {'required': True},
    }

    # API settings
    API_PREFIX = os.getenv('API_PREFIX', '/api')
    API_VERSION = os.getenv('API_VERSION', 'v1')

    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'smartenergy.log')

    @classmethod
    def get_cors_origins(cls) -> List[str]:
        """Get CORS origins as a list"""
        return [origin.strip() for origin in cls.CORS_ORIGINS]

    @classmethod
    def is_production(cls) -> bool:
        """Check if running in production"""
        return not cls.DEBUG

    @classmethod
    def get_rate_limit_string(cls) -> str:
        """Get rate limit as string for flask-limiter"""
        return f"{cls.RATE_LIMIT_REQUESTS} per {cls.RATE_LIMIT_PERIOD}"

# Global config instance
config = Config()