function getRecipes() {
    let ingredients = document.getElementById("ingredients").value;
    
    if (ingredients.trim() === "") {
        alert("Please enter some ingredients!");
        return;
    }

    fetch(`/get_recipes?ingredients=${encodeURIComponent(ingredients)}`)
        .then(response => response.json())
        .then(data => {
            let recipeListDiv = document.getElementById("recipe-list");
            recipeListDiv.innerHTML = "<h3>Suggested Recipes:</h3>";

            if (data.recipes.length === 0) {
                recipeListDiv.innerHTML += "<p>No recipes found.</p>";
                return;
            }

            data.recipes.forEach(recipe => {
                let recipeItem = document.createElement("p");
                recipeItem.innerHTML = `<a href="#" onclick="getRecipeDetails('${recipe}')">${recipe}</a>`;
                recipeListDiv.appendChild(recipeItem);
            });
        })
        .catch(error => {
            console.error("Error fetching recipes:", error);
            document.getElementById("recipe-list").innerHTML = "<p style='color:red;'>Error getting recipes. Try again!</p>";
        });
}

function getRecipeDetails(recipeName) {
    fetch(`/get_recipe_details?recipe=${encodeURIComponent(recipeName)}`)
        .then(response => response.json())
        .then(data => {
            let recipeDetailsDiv = document.getElementById("recipe-details");
            recipeDetailsDiv.innerHTML = `<h3>${recipeName}</h3><p>${data.recipe_details}</p>`;
        })
        .catch(error => {
            console.error("Error fetching recipe details:", error);
            document.getElementById("recipe-details").innerHTML = "<p style='color:red;'>Error fetching recipe details.</p>";
        });
}
