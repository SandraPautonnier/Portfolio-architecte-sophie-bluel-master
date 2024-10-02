const gallery = document.querySelector(".gallery");
const logText = document.querySelector(".log-text");
const token = localStorage.getItem('token');

logText.innerHTML = "login";

// Fonction asynchrone pour récupérer la liste des projets
async function getWorks() {
  const reponse = await fetch("http://localhost:5678/api/works");
  const works = await reponse.json();
  return works;
}

// Fonction pour faire apparaître les différents projets avec les photos correspondantes
async function displayWorks(category) {
  const works = await getWorks(); // Les projets sont récupérés
  const filteredData = category
    ? works.filter((work) => work.category.id === category.id)
    : works; // Si category est null ou undefined, utilisez tous les projets

  gallery.innerHTML = ""; // Réinitialiser le contenu de la galerie

  for (let i = 0; i < filteredData.length; i++) {
    const work = filteredData[i];
    const figureElement = document.createElement("figure"); 
    const imageElement = document.createElement("img");
    imageElement.src = work.imageUrl;
    imageElement.alt = work.title;
    const figCaptionElement = document.createElement("figcaption");
    figCaptionElement.textContent = work.title;

    figureElement.appendChild(imageElement);
    figureElement.appendChild(figCaptionElement);
    gallery.appendChild(figureElement);
  }
}


// Fonction asynchrone pour récupérer les catégories
async function getCategories() {
  const reponse = await fetch("http://localhost:5678/api/categories");
  const categories = await reponse.json();
  return categories;
}

// Fonction pour créer le container et les boutons
const containerCategories = document.querySelector(".categories");

function createCategoryButton(category) {
  const button = document.createElement("button");
  button.className = `button-category ${!category ? "active" : ""}`; // Ajoutez "active" pour le bouton "Tous"
  button.textContent = category ? category.name : "Tous";
  button.addEventListener("click", () => handleSelectCategory(category)); 
  containerCategories.appendChild(button);
}

// Fonction pour créer les filtres des catégories
async function createFilters() {
  const categories = await getCategories();
  createCategoryButton(); // Créez le bouton "Tous" sans catégorie

  // Afficher les projets pour "Tous" lors du chargement
  await displayWorks(null); // Passer null pour afficher tous les projets

  // Maintenant, mettez le bouton "Tous" comme actif
  const buttons = document.querySelectorAll(".button-category");
  buttons[0].classList.add("active"); // Activez le premier bouton qui est "Tous"

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    createCategoryButton(category); // Créez les boutons pour chaque catégorie
  }
}

createFilters();

async function handleSelectCategory(category) {
  // Si "Tous" est sélectionné, passez null
  if (!category) {
    category = null; // "Tous" est représenté par null
  }

  await displayWorks(category); // Affichez les projets en fonction de la catégorie

  const buttons = document.querySelectorAll(".button-category");

  // Retirer la classe 'active' de tous les boutons
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("active");
  }

  // Ajouter la classe 'active' au bouton correspondant à la catégorie
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];

    // Vérifiez si le bouton correspond à category.name ou s'il est le bouton "Tous"
    if (!category && button.textContent === "Tous") { // Vérifiez si la catégorie est null (pour le bouton "Tous")
      button.classList.add("active");
      break; // Sortir de la boucle une fois que le bon bouton est trouvé
    } else if (button.textContent === category.name) {
      button.classList.add("active");
      break; // Sortir de la boucle une fois que le bon bouton est trouvé
    }
  }
}

// Pour ajouter automatiquement la classe 'active' au menu
const links = document.querySelectorAll("nav a");
const currentUrl = window.location.href;

links.forEach((link) => {
  if (link.href === currentUrl) {
    link.classList.add("active");
  }
});

/////////////////////////////////////////////////////////////////////////////////////////////

// Fonction pour permettre la connexion via le login et mot de passe (et stockage du token)
async function connectForm(e) {
  e.preventDefault(); // Empêche le rechargement de la page

  // Récupère les valeurs d'email et de mot de passe du formulaire
  const coupleEmailPassword = {
    email: e.target.querySelector("[name=email]").value,
    password: e.target.querySelector("[name=password]").value
  };

  // Envoie la requête de connexion
  const reponse = await fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(coupleEmailPassword) // envoie en JSON l'email et le mot de passe
  });

  const errorMessage = document.querySelector('.error-message');

  // Vérifie si la réponse est correcte
  if (reponse.ok) {
    const data = await reponse.json(); // Récupère les données du serveur (en JSON)

    // Si la connexion est réussie
    if (data.token) {
      localStorage.setItem('token', data.token); // Stocke le token dans le localStorage
      logText.innerHTML = "logout";
      window.location.href = "index.html"; // Redirige vers la page d'accueil
      
    } else {
      errorMessage.innerHTML = "<strong>Erreur dans l’identifiant ou le mot de passe</strong>";
    }
  } else {
    errorMessage.innerHTML = "<strong>Erreur dans l’identifiant ou le mot de passe</strong>";
  }
}

// Fonction pour mettre à jour le texte de connexion
function updateLoginText() {
  logText.innerHTML = token ? "logout" : "login";
}

// Fonction pour gérer la déconnexion
function handleLogout() {
  localStorage.removeItem('token'); // Supprime le token du localStorage
  updateLoginText(); // Met à jour le texte
}

// Vérifie et met à jour le texte de connexion au chargement de la page
window.onload = updateLoginText;

// Ajoute un événement de clic sur le texte de connexion/déconnexion
logText.addEventListener("click", () => {
  
  if (token) {
    handleLogout(); // Déconnexion
  } else {
    document.querySelector(".login-form"); // Affiche le formulaire de connexion
  }
});

//Mode edition

const editBanner = document.querySelector(".edit-banner");
const header = document.querySelector("header")
const portfolioEdit = document.querySelector(".portfolio-edit");

window.onload = () => {
  updateLoginText();
  if (token) {
    editBanner.style.display = "flex";
    header.style.marginTop = "70px";
    portfolioEdit.style.display = "block";
  }
  // Sélection du formulaire et ajout de l'événement
  const loginForm = document.querySelector(".login-form");
  if(loginForm) {
    loginForm.addEventListener("submit", connectForm);
  }
};

portfolioEdit.addEventListener("click", ())