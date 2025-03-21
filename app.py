from flask import Flask, request, jsonify
import requests
import os
from dotenv import load_dotenv

# Load API key from .env file
load_dotenv()
GROQ_API_KEY = os.getenv("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")
app = Flask(__name__)

def get_recipe_recommendation(ingredients):
    url = "https://api.groq.com/v1/chat/completions"  # Check Groq API documentation for the latest endpoint
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "llama3-8b",  # Use the correct Groq model
        "messages": [
            {"role": "system", "content": "You are an expert chef. Suggest the best recipes based on given ingredients."},
            {"role": "user", "content": f"I have {ingredients}. What can I cook?"}
        ]
    }

    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code == 200:
        return response.json().get("choices", [{}])[0].get("message", {}).get("content", "No response")
    return "Error fetching response from LLM."

@app.route('/')
def home():
    return "Welcome to the Cooking App!"

@app.route('/recommend', methods=['GET'])
def recommend():
    ingredients = request.args.get('ingredients', '')
    if not ingredients:
        return jsonify({"error": "Please provide ingredients"}), 400
    
    recommendation = get_recipe_recommendation(ingredients)
    return jsonify({"recommendation": recommendation})

if __name__ == '__main__':
    app.run(debug=True)
