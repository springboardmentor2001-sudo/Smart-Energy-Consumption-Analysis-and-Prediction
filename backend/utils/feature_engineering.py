def create_backend_features(df, history):
    df['Energy_lag1'] = history[-1]
    df['Energy_lag7'] = history[-7]
    df['Energy_roll7'] = sum(history[-7:]) / 7
    return df
