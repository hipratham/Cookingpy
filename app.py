from flask import Flask, request, jsonify, render_template
import requests
import os
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

app = Flask(__name__)

def query_groq(messages):
    url = "https://api.groq.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "llama3-8b",
        "messages": messages
    }

    response = requests.post(url, json=data, headers=headers)
    if response.status_code == 200:
        return response.json().get("choices", [{}])[0].get("message", {}).get("content", "No response")
    return "Error fetching response from LLM."

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_recipes', methods=['GET'])
def get_recipes():
    ingredients = request.args.get('ingredients', '')
    if not ingredients:
        return jsonify({"error": "Please provide ingredients"}), 400

    # Ask the LLM to suggest multiple recipe names
    messages = [
        {"role": "system", "content": "You are a chef. Suggest 3 recipe names based on the given ingredients."},
        {"role": "user", "content": f"I have {ingredients}. What can I cook?"}
    ]
    
    recipe_suggestions = query_groq(messages)
    recipes = recipe_suggestions.split("\n")  # Split by new line

    return jsonify({"recipes": recipes})

@app.route('/get_recipe_details', methods=['GET'])
def get_recipe_details():
    recipe_name = request.args.get('recipe', '')
    if not recipe_name:
        return jsonify({"error": "Please provide a recipe name"}), 400

    # Ask the LLM to provide full details of the recipe
    messages = [
        {"role": "system", "content": "You are a professional chef. Provide a detailed recipe with ingredients, steps, and cooking time."},
        {"role": "user", "content": f"Give me the full recipe details for {recipe_name}."}
    ]
    
    recipe_details = query_groq(messages)

    return jsonify({"recipe_details": recipe_details})

if __name__ == '__main__':
    app.run(debug=True)
