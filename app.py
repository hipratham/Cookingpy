from flask import Flask, request, jsonify, render_template
import requests
import os
from dotenv import load_dotenv
from flask_caching import Cache
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging
from logging.handlers import RotatingFileHandler

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize Flask app
app = Flask(__name__)

# Configure caching
cache = Cache(app, config={'CACHE_TYPE': 'SimpleCache'})

# Configure rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    storage_uri="memory://",  # Use in-memory storage for development
    # storage_uri="redis://localhost:6379",  # Use Redis for production
    default_limits=["200 per day", "50 per hour"]
)

# Configure logging
logging.basicConfig(level=logging.INFO)
handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=3)
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
app.logger.addHandler(handler)

def query_groq(messages):
    """Query the Groq API for recipe suggestions or details."""
    url = "https://api.groq.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "llama3-8b",
        "messages": messages
    }

    try:
        response = requests.post(url, json=data, headers=headers)
        response.raise_for_status()  # Raise an exception for HTTP errors
        app.logger.info(f"API Response: {response.json()}")
        return response.json().get("choices", [{}])[0].get("message", {}).get("content", "No response")
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Error querying Groq API: {e}")
        app.logger.error(f"Response: {response.text if 'response' in locals() else 'No response'}")
        return "Error fetching response from LLM."

@app.route('/')
def home():
    """Render the homepage."""
    return render_template('index.html')

@app.route('/get_recipes', methods=['GET'])
@limiter.limit("10 per minute")
@cache.cached(timeout=300)
def get_recipes():
    """Get recipe suggestions based on ingredients."""
    ingredients = request.args.get('ingredients', '')
    if not ingredients:
        return jsonify({"error": "Please provide ingredients"}), 400

    messages = [
        {"role": "system", "content": "You are a chef. Suggest 3 recipe names based on the given ingredients."},
        {"role": "user", "content": f"I have {ingredients}. What can I cook?"}
    ]
    
    recipe_suggestions = query_groq(messages)
    if recipe_suggestions == "Error fetching response from LLM.":
        return jsonify({"error": "Failed to fetch recipes. Please try again later."}), 500

    recipes = recipe_suggestions.split("\n")  # Split by new line
    return jsonify({"recipes": recipes})

@app.route('/get_recipe_details', methods=['GET'])
@limiter.limit("10 per minute")
def get_recipe_details():
    """Get detailed instructions for a specific recipe."""
    recipe_name = request.args.get('recipe', '')
    if not recipe_name:
        return jsonify({"error": "Please provide a recipe name"}), 400

    messages = [
        {"role": "system", "content": "You are a professional chef. Provide a detailed recipe with ingredients, steps, and cooking time."},
        {"role": "user", "content": f"Give me the full recipe details for {recipe_name}."}
    ]
    
    recipe_details = query_groq(messages)
    if recipe_details == "Error fetching response from LLM.":
        return jsonify({"error": "Failed to fetch recipe details. Please try again later."}), 500

    return jsonify({"recipe_details": recipe_details})

if __name__ == '__main__':
    app.run(debug=False)