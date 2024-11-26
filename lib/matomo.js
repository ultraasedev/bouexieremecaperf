import MatomoTracker from 'matomo-tracker';

// Remplacez par l'URL de votre installation Matomo
const matomo = new MatomoTracker(1, 'http://localhost/matomo/matomo.php');

export const trackPageView = (url, title) => {
  matomo.track({
    url, // URL de la page
    action_name: title, // Titre de la page
  });
};

export const trackEvent = (category, action, name, value) => {
  matomo.track({
    e_c: category, // Catégorie d'événement
    e_a: action,   // Action d'événement
    e_n: name,     // Nom de l'événement
    e_v: value,    // Valeur de l'événement (facultatif)
  });
};
