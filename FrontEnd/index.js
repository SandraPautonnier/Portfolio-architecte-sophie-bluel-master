const gallery = document.querySelector(".gallery");
const logText = document.querySelector(".log-text");
const token = localStorage.getItem("token");
const modalProjectsGrid = document.querySelector(".modal-projects-grid");
const categorySelect = document.querySelector(".custom-select");
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
    : works; // Si category est null ou undefined, met tous les projets

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
  button.className = `button-category ${!category ? "active" : ""}`; // Ajoute "active" pour le bouton "Tous"
  button.textContent = category ? category.name : "Tous";
  button.addEventListener("click", () => handleSelectCategory(category));
  containerCategories.appendChild(button);
}

// Fonction pour créer les filtres des catégories
async function createFilters() {
  const categories = await getCategories();
  createCategoryButton(); // Crée le bouton "Tous" sans catégorie

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

    // Vérifie si le bouton correspond à category.name ou s'il est le bouton "Tous"
    if (!category && button.textContent === "Tous") {
      // Vérifie si la catégorie est null (pour le bouton "Tous")
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
      errorMessage.innerHTML ="<strong>Erreur dans l’identifiant ou le mot de passe</strong>";
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Mode edition
//Ouverture et fermeture de la modale + Vue photo Galerie

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

//Ouvrir et fermer la modale
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

//Fonction pour supprimer un projet
async function deleteWork(workId) {
  const reponse = await fetch(`http://localhost:5678/api/works/${workId}`, { method: 'DELETE', headers: {Authorization: `Bearer ${token}`} });
  return reponse.ok;
}


//Vue Ajout photo
const addNewProject = document.querySelector(".add-new-project"); //button afficher vue "Ajouter un projet"
const addProjectView = document.querySelector(".add-project-view"); //Vue "Ajouter un projet"
const addProjectForm = document.querySelector(".add-project-form"); //Formulaire ajouter un projet
const galleryView = document.querySelector(".gallery-view"); //Vue galerie
const backToGalleryBtn = document.querySelector(".back-btn"); //button revenir à la gallerie
const btnProjectValidate = document.querySelector(".add-project-validate");//button Valider
const titleProjectForm = document.querySelector(".title-project-form");//Titre du projet à ajouter
const faChevronUp = document.querySelector(".fa-chevron-down"); //Chevron de select personnalisé
const faImage = document.querySelector(".fa-image"); //icone image
const btnAddPhoto = document.querySelector(".btn-add-photo") //bouton ajout photo
const desAddPhoto = document.querySelector(".des-add-photo") //description ajout photo

// Basculer vers la vue Ajout photo
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

//Afficher la photo télécharger depuis le PC
const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");

imageInput.addEventListener("change", function () {
  const file = imageInput.files[0];

  // Si un fichier est sélectionné et que c'est une image
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();

    // Quand le fichier est chargé, on l'affiche dans l'élément <img>
    reader.onload = function (e) {
      imagePreview.src = e.target.result; // Définit la source de l'image
      imagePreview.style.display = "block"; // Affiche l'élément <img>

      //Fais disparaître les éléments derrière la prévisualisation de l'image
      faImage.style.color = "transparent";
      btnAddPhoto.style.backgroundColor = "transparent"; 
      btnAddPhoto.style.color = "transparent";
      desAddPhoto.style.color = "transparent";
    };

    reader.readAsDataURL(file); // Lit le fichier et génère une URL
  } else {
    imagePreview.style.display = "none"; // Cache l'aperçu si ce n'est pas une image
  }
});


//Fonction pour l'élément select avec les catégories
async function createCategoriesSelect() {
  const reponse = await fetch("http://localhost:5678/api/categories");
  const categories = await reponse.json();
  const categorySelect = document.querySelector(".custom-select");

  // Ajouter chaque catégorie dans le champ select
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;  // La valeur est l'ID de la catégorie
    option.textContent = category.name;  // Le texte affiché est le nom de la catégorie
    categorySelect.appendChild(option);
  });
}

// Appel de la fonction pour remplir les catégories au chargement
createCategoriesSelect();

//Lorsqu'on clique sur select le chevron change de sens
categorySelect.addEventListener("click", () => {
  faChevronUp.classList.toggle('rotate');
} )

// Fonction pour vérifier si tous les champs sont remplis
function isFormValid() {
  return categorySelect.value && titleProjectForm.value && imageInput.files[0];
}

// Changement de couleur du bouton "Valider" une fois que l'image, le titre et la catégorie sont remplis
addProjectForm.addEventListener("change", function () {
  if (isFormValid()) {
    btnProjectValidate.style.backgroundColor = "#1D6154"; // Vert
  } else {
    btnProjectValidate.style.backgroundColor = "#A7A7A7"; // Gris
  }
});

// Ajout des nouveaux projets dans l'API
addProjectForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Empêche le rechargement de la page

  // Crée un objet FormData pour envoyer les données du formulaire
  const formData = new FormData(addProjectForm);

  const reponse = await fetch("http://localhost:5678/api/works", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  if (!isFormValid) {
    return alert("Veuillez remplir tous les champs !");
  }
  if (!reponse.ok) {
    return alert("Veuillez remplir tous les champs !");
  }
    displayWorks(selectedCategory);
    addProjectForm.reset(); // Réinitialise le formulaire après envoi
    imagePreview.style.display = "none"; // Fais disparaître la prévisualisation de l'image
    btnProjectValidate.style.backgroundColor = "#A7A7A7"; // Remet le bouton "Valider" en gris
    openModal.style.display = "none";
    alert("Projet ajouté avec succès !")
    // Fais réapparaître les éléments derrière la prévisualisation de l'image
    faImage.style.color = "#cbd6dc";
    btnAddPhoto.style.backgroundColor = "#cbd6dc";
    btnAddPhoto.style.color = "#306685";
    desAddPhoto.style.color = "#444444";
  }
);


/* Nous aurions pu améliorer l'expérience utilisateur en ajoutant une fonctionnalité 
de mise en avant de certains projets avec un système de drag & drop, 
ou encore une fonctionnalité de favoris*/