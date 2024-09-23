const gallery = document.querySelector(".gallery");


async function getWorks() {
  const reponse = await fetch("http://localhost:5678/api/works");
  const works = await reponse.json();
  //console.log(works);
  return works;
}

function displayWorks(category) {
  const works = getWorks();
  works.then((data) => {
    //console.log(data);
    const filteredData = category
      ? data.filter((work) => work.category.id === category.id)
      : data;
    console.log(filteredData);

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
  });
}
displayWorks();

async function getCategories() {
  const reponse = await fetch("http://localhost:5678/api/categories");
  const categories = await reponse.json();
  //console.log(works);
  return categories;
}
const containerCategories = document.querySelector(".categories");
function createCategoryButton(category) {
  const button = document.createElement("button");
  button.className = `button-category ${!category ? "active" : ""}`;
  button.textContent = category ? category.name : "Tous";
  button.addEventListener("click", () => handleSelectCategory(category));
  containerCategories.appendChild(button);
}
function createFilters() {
  const categories = getCategories();
  categories.then((data) => {
    createCategoryButton();
    for (let i = 0; i < data.length; i++) {
      const category = data[i];
      createCategoryButton(category);
    }
  });
}
createFilters();

function handleSelectCategory(category) {
  gallery.innerHTML = "";
  displayWorks(category);
  // Sélectionne tous les boutons de catégorie
  const buttons = document.querySelectorAll(".button-category");
  // Ajoute un écouteur d'événement pour chaque bouton
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      // Retire la classe 'active' de tous les boutons
      buttons.forEach(btn => btn.classList.remove("active"));
      // Ajoute la classe 'active' au bouton cliqué
      button.classList.add("active");
    })
  })
}
