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