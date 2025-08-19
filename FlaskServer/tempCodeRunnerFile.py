from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from predictor3 import predict_income_with_logic

app = Flask(__name__)
CORS(app)

# Load model components
model_path = os.path.join(os.path.dirname(__file__), 'model5.pkl')

try:
    model, scaler, expense_cols, recommended_ratios = joblib.load(model_path)
    print(" Loaded model, scaler, columns, and ratios.")
except Exception as e:
    print(f" Failed to load model.pkl: {e}")
    model, scaler, expense_cols, recommended_ratios = None, None, None, None

@app.route('/', methods=['GET'])
def home():
    return "Flask backend is running! 🚀"

@app.route('/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        data = request.json
        features = data.get("features", {})
        print(f"Received features: {features}")
        salary = data.get("salary", None)

        avoids = data.get("avoids", [])

        if not features and salary is None:
            return jsonify({'error': "Please provide either features or salary"}), 400

        result = predict_income_with_logic(
            model=model,
            scaler=scaler,
            expense_cols=expense_cols,
            recommended_ratios=recommended_ratios,
            user_data=features,
            user_salary=salary,
            avoids=avoids
        )

        return jsonify(result)

    except Exception as e:
        print(f"🔥 Error in /predict: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
