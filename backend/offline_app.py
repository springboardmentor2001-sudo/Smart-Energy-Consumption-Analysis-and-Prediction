from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route("/offline-predict", methods=["POST"])
def offline_predict():
    try:
        # 1️⃣ Get uploaded model
        model_file = request.files.get("model")
        if not model_file:
            return jsonify({"status": "error", "message": "Model not uploaded"})

        model = pickle.load(model_file)

        # 2️⃣ Get input features
        features = [
            int(request.form["HVACUsage"]),
            int(request.form["Occupancy"]),
            float(request.form["Temperature"]),
            float(request.form["RenewableEnergy"]),
            int(request.form["Hour"]),
            int(request.form["IsWeekend"])
        ]

        X = np.array([features])

        # 3️⃣ Predict
        prediction = model.predict(X)[0]

        return jsonify({
            "status": "success",
            "prediction": round(float(prediction), 2),
            "mode": "offline"
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })

if __name__ == "__main__":
    app.run(port=5001, debug=True)
