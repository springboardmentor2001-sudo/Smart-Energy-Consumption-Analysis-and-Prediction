def validate_input(data):
    required = [
        'HVACUsage','Occupancy','Temperature',
        'RenewableEnergy','Hour','IsWeekend'
    ]
    return all(k in data for k in required)
