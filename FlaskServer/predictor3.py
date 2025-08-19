import numpy as np
import pandas as pd

def predict_income_with_logic(model, scaler, expense_cols, recommended_ratios, user_data, user_salary=None, avoids=None):
    avoids = avoids or []

   
    # The recommendation logic below explicitly handles the user's request for alcohol.
    filled_expenses = {col: user_data.get(col, 0) for col in expense_cols}
    input_df = pd.DataFrame([filled_expenses])[expense_cols]
    input_scaled = scaler.transform(input_df)

    # Predict income based on the model
    predicted_income = model.predict(input_scaled)[0]
    
    # Determine which salary to use for recommendations
    used_salary = user_salary if user_salary is not None else predicted_income

    # Issue warning if provided salary differs significantly from predicted income
    warning = None
    if user_salary is not None and abs(predicted_income - user_salary) > 0.2 * user_salary:
        warning = (
            f"⚠️ Large mismatch between predicted income ({round(predicted_income, 2)}) "
            f"and provided salary ({round(user_salary, 2)}). Using provided salary for recommendations."
        )

    # Calculate final recommendations with avoids logic and specific alcohol handling
    recommendations = {}
    for col, ratio in recommended_ratios.items():
        if col in avoids:
            continue # Skip this column if it's in the avoids list

        if col == "Alcoholic_Beverages_and_Tobacco_Expenditure":
            # If 'Alcoholic_Beverages_and_Tobacco_Expenditure' was NOT explicitly provided
           
            if col not in user_data or user_data.get(col, 0) == 0:
                recommendations[col] = 0.0
            else:
                recommendations[col] = round(used_salary * ratio, 2)
        else:
            # For all other expense categories, calculate recommendations based on their ratios
            recommendations[col] = round(used_salary * ratio, 2)

    # Overspending logic (checking actual user expenses against recommendations)
    overspending_flags = {}
    for col, actual in filled_expenses.items():
        if col in recommendations: # Only check for overspending if a recommendation exists for this category
            expected = recommendations[col]
            if col == "Total_Food_Expenditure":
                # For food, consider overspending only if it's more than double the recommendation
                if actual > 2 * expected and expected > 0: # Ensure expected is not zero to avoid division by zero conceptual issue
                    overspending_flags[col] = f"⚠️ High spending on {col.replace('_', ' ')}"
            elif actual > 1.5 * expected and expected > 0: # For other categories, 1.5x the recommendation triggers overspending
                overspending_flags[col] = f"⚠️ Overspending on {col.replace('_', ' ')}"

    return {
        'predicted_income': round(predicted_income, 2),
        'used_salary': round(used_salary, 2),
        'recommendations': recommendations,
        'warning': warning,
        'overspending': overspending_flags
    }
