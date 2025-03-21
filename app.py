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

# Configure cache
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

# Configure rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    storage_uri="memory://",
    default_limits=["200 per day", "50 per hour"]
)

# Add error handling constants
ERROR_MESSAGES = {
    'api_error': "Error communicating with recipe service. Please try again later.",
    'no_recipes': "No recipes found for these ingredients. Please try different ingredients.",
    'invalid_response': "Received invalid response from service. Please try again.",
}

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
@limiter.limit("30 per minute")
@cache.cached(timeout=300)
def get_recipes():
    """Get recipe suggestions based on ingredients."""
    ingredients = request.args.get('ingredients', '').strip()
    app.logger.info(f"Raw ingredients input: '{ingredients}'")

    if not ingredients or ingredients.isspace():
        app.logger.warning("Empty or whitespace-only ingredients received")
        return jsonify({"error": "Please provide ingredients"}), 400

    messages = [
        {"role": "system", "content": """You are a helpful chef. Provide exactly 3 recipe names based on the given ingredients.
        Format your response as a simple list with each recipe on a new line.
        Do not include numbers, bullets, or any extra text."""},
        {"role": "user", "content": f"What are 3 recipes I can make with these ingredients: {ingredients}?"}
    ]
    
    try:
        recipe_suggestions = query_groq(messages)
        app.logger.info(f"Raw LLM response: {recipe_suggestions}")
        
        if isinstance(recipe_suggestions, str) and "Error" in recipe_suggestions:
            app.logger.error(f"API error: {recipe_suggestions}")
            return jsonify({"error": "Unable to fetch recipes. Please try again later."}), 503

        # Clean and process the recipes
        recipes = []
        for line in recipe_suggestions.split('\n'):
            cleaned_line = line.strip()
            if cleaned_line and not any(cleaned_line.startswith(c) for c in ('-', '*', '1', '2', '3')):
                recipes.append(cleaned_line)

        recipes = recipes[:3]  # Ensure we only get 3 recipes
        
        if not recipes:
            app.logger.error(f"No valid recipes extracted from response: {recipe_suggestions}")
            return jsonify({"error": "No valid recipes found. Please try with different ingredients."}), 404

        app.logger.info(f"Final processed recipes: {recipes}")
        return jsonify({"recipes": recipes})

    except Exception as e:
        app.logger.error(f"Unexpected error in get_recipes: {str(e)}")
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

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