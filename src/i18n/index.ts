import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const fr = {
  common: {
    app_name: 'RecapLink',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    confirm: 'Confirmer',
    back: 'Retour',
    loading: 'Chargement...',
    error: "Une erreur s'est produite",
    empty: 'Aucun résultat',
    search: 'Rechercher...',
    see_all: 'Tout voir',
    send: 'Envoyer',
    edit: 'Modifier',
    close: 'Fermer',
    yes: 'Oui',
    no: 'Non',
    nav: { home: 'Accueil', offers: 'Offres', messaging: 'Messagerie', settings: 'Paramètres', profile: 'Compte' },
    roles: { collecteur: 'Collecteur', recycleur: 'Recycleur', vendeur_plastique: 'Vendeur Plastique', admin: 'Administrateur' },
    plastic: { PET: 'PET', HDPE: 'HDPE', PP: 'PP', PVC: 'PVC', Autres: 'Autres' },
    status: { active: 'Actif', pending: 'En attente', suspended: 'Suspendu', verified: 'Vérifié', reported: 'Signalé', closed: 'Fermé' },
  },
  auth: {
    onboarding: {
      slide1: { title: 'Bienvenue chez RecapLink', subtitle: "RecapLink s'inscrit dans un projet de coopération entre la Tunisie et le Sénégal visant à promouvoir une économie circulaire durable." },
      slide2: { title: 'Connecter & Recycler', subtitle: 'Mettez en relation collecteurs, recycleurs et vendeurs de plastique pour une chaîne de valeur efficace.' },
      slide3: { title: 'Créer de la valeur durable', subtitle: "Transformez les déchets plastiques en ressources économiques et contribuez à un avenir plus propre." },
      next: 'Suivant',
      start: 'Commencer',
    },
    login: { title: 'Se connecter à RecapLink', email: 'E-mail ou téléphone', password: 'Mot de passe', forgot: 'Mot de passe oublié ?', submit: 'Se connecter', no_account: 'Pas de compte ?', signup: 'Inscrivez-vous' },
    signup: { title: 'Créer un compte', fullName: 'Nom complet', username: "Nom d'utilisateur", email: 'Adresse e-mail', phone: 'Numéro de téléphone', password: 'Mot de passe', confirm: 'Confirmer le mot de passe', submit: "S'inscrire", has_account: 'Déjà un compte ?', login: 'Se connecter' },
    role: { title: 'Choisissez votre rôle', subtitle: 'Sélectionnez le rôle qui correspond le mieux à votre activité', collecteur: { title: 'Collecteur', desc: 'Je collecte du plastique auprès des particuliers et entreprises' }, recycleur: { title: 'Recycleur', desc: 'Je traite et recycle les matières plastiques collectées' }, vendeur: { title: 'Vendeur Plastique', desc: 'Je vends du plastique brut ou transformé' }, submit: 'Continuer' },
  },
}

const ar: typeof fr = {
  common: { ...fr.common, nav: { home: 'الرئيسية', offers: 'العروض', messaging: 'الرسائل', settings: 'الإعدادات', profile: 'حسابي' } },
  auth: fr.auth,
}

const wo: typeof fr = {
  common: { ...fr.common },
  auth: fr.auth,
}

i18n.use(initReactI18next).init({
  lng: 'fr',
  fallbackLng: 'fr',
  supportedLngs: ['fr', 'ar', 'wo'],
  defaultNS: 'common',
  ns: ['common', 'auth'],
  resources: { fr, ar, wo },
  interpolation: { escapeValue: false },
})

export default i18n
