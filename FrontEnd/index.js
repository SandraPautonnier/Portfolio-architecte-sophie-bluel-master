const gallery = document.querySelector(".gallery");
const logText = document.querySelector(".log-text");
const token = localStorage.getItem("token");
const modalProjectsGrid = document.querySelector(".modal-projects-grid");
let selectedCategory;

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

  // Mettre le bouton "Tous" comme actif
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
    selectedCategory = null;
  }

  selectedCategory = category

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
    if (!category && button.textContent === "Tous") {
      // Vérifiez si la catégorie est null (pour le bouton "Tous")
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
    password: e.target.querySelector("[name=password]").value,
  };

  // Envoie la requête de connexion
  const reponse = await fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(coupleEmailPassword), // envoie en JSON l'email et le mot de passe
  });

  const errorMessage = document.querySelector(".error-message");

  // Vérifie si la réponse est correcte
  if (reponse.ok) {
    const data = await reponse.json(); // Récupère les données du serveur (en JSON)

    // Si la connexion est réussie
    if (data.token) {
      localStorage.setItem("token", data.token); // Stocke le token dans le localStorage
      logText.innerHTML = "logout";
      window.location.href = "index.html"; // Redirige vers la page d'accueil
    } else {
      errorMessage.innerHTML =
        "<strong>Erreur dans l’identifiant ou le mot de passe</strong>";
    }
  } else {
    errorMessage.innerHTML =
      "<strong>Erreur dans l’identifiant ou le mot de passe</strong>";
  }
}

// Fonction pour mettre à jour le texte de connexion
function updateLoginText() {
  logText.innerHTML = token ? "logout" : "login";
}

// Fonction pour gérer la déconnexion
function handleLogout() {
  localStorage.removeItem("token"); // Supprime le token du localStorage
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
const header = document.querySelector("header");
const portfolioEdit = document.querySelector(".portfolio-edit");
const titleProject = document.querySelector(".portfolio-header");

window.onload = () => {
  updateLoginText();
  if (token) {
    editBanner.style.display = "flex";
    header.style.marginTop = "100px";
    portfolioEdit.style.display = "block";
    containerCategories.style.display = "none";
    titleProject.style.paddingBottom = "75px";
    titleProject.style.paddingTop = "50px";
  }
  // Sélection du formulaire et ajout de l'événement
  const loginForm = document.querySelector(".login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", connectForm);
  }
};

const openModal = document.querySelector(".modal");
const closeModal = document.querySelector(".close");
const footer = document.querySelector("footer");


portfolioEdit.addEventListener("click", () => {
  
  openModal.style.display = "flex";
  displayModalProjects(); // Afficher les projets dans la modale
});

closeModal.addEventListener("click", () => {
  openModal.style.display = "none";
  footer.style.background = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === openModal) openModal.style.display = "none";
});

// Fonction pour afficher les projets dans la modale
async function displayModalProjects() {
  const works = await getWorks(); // Fonction pour récupérer les projets depuis l'API

  modalProjectsGrid.innerHTML = ""; // Vider la galerie avant d'ajouter les projets

  works.forEach((work) => {
    const figureElement = document.createElement("figure");
    const imageElement = document.createElement("img");
    imageElement.src = work.imageUrl;

    const figCaptionElement = document.createElement("figcaption");

    const deleteButton = document.createElement("i");
    deleteButton.classList.add("fa-solid", "fa-trash-can");
    deleteButton.classList.add("delete-project");

    // Supprimer le projet via l'API et du DOM dans la modale
    deleteButton.addEventListener("click", async () => {
      if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
        const deleted = await deleteWork(work.id); // Fonction pour supprimer le projet de l'API
        if (deleted) {
          figureElement.remove(); // Retirer l'élément du DOM dans la modale
          displayWorks(selectedCategory);
        }
      }
    });

    figureElement.appendChild(imageElement);
    figureElement.appendChild(figCaptionElement);
    figureElement.appendChild(deleteButton);
    modalProjectsGrid.appendChild(figureElement);
  });
}

async function deleteWork(workId) {
  const reponse = await fetch(`http://localhost:5678/api/works/${workId}`, { method: 'DELETE', headers: {Authorization: `Bearer ${token}`} });
  return reponse.ok;
}

const addNewProject = document.querySelector(".add-new-project"); //button afficher vue "Ajouter un projet"
const addProjectView = document.querySelector(".add-project-view"); //Vue "Ajouter un projet"
const addProjectForm = document.querySelector(".add-project-form"); //button enregistrer un projet
const galleryView = document.querySelector(".gallery-view"); //Vue galerie
const backToGalleryBtn = document.querySelector(".back-btn"); //button revenir à la gallerie

// Basculer vers la vue "Ajouter un projet"
addNewProject.addEventListener('click', () => {
  galleryView.classList.add('hidden');
  addProjectView.classList.remove('hidden');
});

// Revenir à la vue galerie
backToGalleryBtn.addEventListener('click', (e) => {
  e.preventDefault();
  galleryView.classList.remove('hidden');
  addProjectView.classList.add('hidden');
});