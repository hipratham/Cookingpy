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
        "model": "mixtral-8x7b-32768",  # Updated model name
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1000
    }

    try:
        app.logger.info(f"Sending request to Groq API with data: {data}")
        response = requests.post(url, json=data, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        app.logger.info(f"API Response: {result}")
        
        if not result.get("choices"):
            app.logger.error("No choices in API response")
            return "Error: No response choices available"
            
        content = result["choices"][0]["message"]["content"]
        return content.strip()
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Error querying Groq API: {e}")
        app.logger.error(f"Response: {response.text if 'response' in locals() else 'No response'}")
        return "Error fetching response from LLM."
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return "Error: Something went wrong"

@app.route('/')
def home():
    """Render the homepage."""
    return render_template('index.html')

@app.route('/get_recipes', methods=['GET'])
@limiter.limit("30 per minute")  # Increased rate limit for testing
@cache.cached(timeout=300)
def get_recipes():
    """Get recipe suggestions based on ingredients."""
    ingredients = request.args.get('ingredients', '')
    if not ingredients:
        return jsonify({"error": "Please provide ingredients"}), 400

    app.logger.info(f"Received ingredients: {ingredients}")  # Add debug logging

    messages = [
        {"role": "system", "content": """You are a helpful chef. Provide exactly 3 recipe names based on the given ingredients.
        Format your response as a simple list with each recipe on a new line.
        Do not include numbers, bullets, or any extra text."""},
        {"role": "user", "content": f"What are 3 recipes I can make with these ingredients: {ingredients}?"}
    ]
    
    recipe_suggestions = query_groq(messages)
    app.logger.info(f"Raw LLM response: {recipe_suggestions}")  # Add debug logging
    
    if "Error" in recipe_suggestions:
        return jsonify({"error": recipe_suggestions}), 500

    # Clean and parse the response
    recipes = [recipe.strip() for recipe in recipe_suggestions.split('\n') 
              if recipe.strip() and not recipe.startswith(('-', '*', '1', '2', '3'))]
    
    # Ensure we have at least one recipe
    if not recipes:
        return jsonify({"error": "No valid recipes found. Please try again."}), 500

    # Take only the first 3 recipes if we got more
    recipes = recipes[:3]
    
    app.logger.info(f"Processed recipes: {recipes}")
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
    app.debug = True  # Enable debug mode during testing
    app.run(debug=True)