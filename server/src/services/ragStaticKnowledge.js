function chunk(id, topic, source, text) {
  return { id, topic, source, text: text.trim() };
}

export function buildStaticKnowledgeChunks() {
  return [
    // —— Produit ——
    chunk(
      "product-overview",
      "product",
      "README",
      "RealStage AI est un SaaS de home staging virtuel (virtual staging) pour les professionnels de l'immobilier en France. Uploadez une photo de pièce, choisissez un mode (Meubler, Remplacer ou Vider), un type de pièce et un style, puis générez un rendu photoréaliste en quelques secondes.",
    ),
    chunk(
      "product-tagline",
      "product",
      "LandingPage",
      "RealStage AI transforme vos annonces immobilières : meubler des pièces vides, remplacer le mobilier existant, désencombrer des espaces encombrés. Rendu professionnel en moins de 15 secondes, plus de 30 styles, export HD pour SeLoger, Leboncoin ou site agence.",
    ),
    chunk(
      "product-audience",
      "product",
      "landingData",
      "Public cible : agents immobiliers, mandataires, gestionnaires de biens, photographes immobiliers. Aucune compétence technique requise.",
    ),

    // —— Politique essai & abonnements (critique) ——
    chunk(
      "policy-trial-no-monthly",
      "subscription",
      "policy",
      "IMPORTANT : RealStage AI n'offre PAS d'essai gratuit d'un mois sur les abonnements Starter, Pro ou Agence. Les forfaits payants sont facturés dès le premier mois. Ne jamais mentionner un essai gratuit mensuel ou une période d'essai sur un abonnement.",
    ),
    chunk(
      "policy-trial-generations",
      "subscription",
      "policy",
      "Seul essai gratuit : 3 générations offertes à l'inscription, sans carte bancaire, pour tester les modes Meubler, Remplacer et Vider. Après ces 3 générations, un abonnement payant est requis.",
    ),
    chunk(
      "policy-no-regain-free-gens",
      "subscription",
      "policy",
      `Question : Puis-je réobtenir des générations gratuites ?
Réponse : Non. Les 3 générations gratuites sont réservées à l'inscription (un seul essai par compte) et ne peuvent pas être réinitialisées ni réobtenues. Pour continuer après épuisement de l'essai : souscrire à un abonnement payant Starter (19 €/mois), Pro (39 €/mois) ou Agence (99 €/mois). Ces abonnements sont facturés dès le premier mois — il n'existe PAS d'essai gratuit d'un mois ni de période d'essai sur un forfait payant. Ne jamais suggérer un « essai gratuit du Starter » ou un mois offert.`,
    ),
    chunk(
      "policy-commercial-use",
      "subscription",
      "landingData",
      "Usage commercial des images générées : autorisé avec un abonnement actif (annonces immobilières, supports marketing, réseaux sociaux).",
    ),
    chunk(
      "policy-cancel",
      "subscription",
      "landingData",
      "Annulation d'abonnement : possible à tout moment depuis Paramètres > Abonnement. L'accès reste actif jusqu'à la fin de la période mensuelle en cours. Résiliation libre, sans frais cachés.",
    ),
    chunk(
      "policy-billing",
      "subscription",
      "UserSettingsPage",
      "Gestion de l'abonnement : depuis Paramètres > Abonnement, bouton « Gérer » pour accéder au portail Stripe (factures, moyen de paiement). En mode démo (Stripe non configuré), l'abonnement peut être simulé.",
    ),
    chunk(
      "msg-trial-exhausted",
      "subscription",
      "subscriptionService",
      "Quand les 3 essais gratuits sont épuisés : « Vos 3 essais gratuits sont épuisés. Choisissez un abonnement pour continuer. »",
    ),
    chunk(
      "msg-quota-exceeded",
      "subscription",
      "subscriptionService",
      "Quota mensuel de générations atteint : « Quota mensuel atteint. Passez à un forfait supérieur ou attendez le prochain cycle. »",
    ),
    chunk(
      "msg-no-subscription",
      "subscription",
      "subscriptionService",
      "Sans abonnement actif après l'essai : « Abonnement requis. Choisissez un forfait pour continuer. »",
    ),
    chunk(
      "msg-deep-thinking-none",
      "subscription",
      "subscriptionService",
      "Réflexion approfondie sans abonnement Starter+ : « La réflexion approfondie est disponible avec un abonnement Starter ou supérieur. »",
    ),
    chunk(
      "msg-deep-thinking-quota",
      "subscription",
      "subscriptionService",
      "Quota réflexion approfondie épuisé : « Quota de réflexion approfondie atteint pour ce mois. Passez à un forfait supérieur ou attendez le prochain cycle. »",
    ),
    chunk(
      "paywall-modal",
      "subscription",
      "PaywallModal",
      "Modal fin d'essai : « Vos essais gratuits sont terminés » — vous avez utilisé 3 générations d'essai. Tarifs affichés : Starter 19€/mois, Pro 39€/mois, Agence 99€/mois. Bouton « Voir les tarifs ».",
    ),
    chunk(
      "quota-modal-monthly",
      "subscription",
      "QuotaModal",
      "Modal quota mensuel : le forfait actuel a un nombre limité de générations par mois. Proposer de changer de forfait via la page Tarifs.",
    ),
    chunk(
      "quota-modal-deep",
      "subscription",
      "QuotaModal",
      "Modal quota réflexion approfondie : Starter 10/mois, Pro 50/mois, Agence illimité. Si quota 0, la fonction nécessite un abonnement Starter minimum.",
    ),
    chunk(
      "trial-banner",
      "subscription",
      "TrialBanner",
      "Bandeau essai : affiche le nombre d'essais restants sur 3. Si épuisé : « Essais gratuits épuisés — abonnement requis pour continuer. »",
    ),
    chunk(
      "pricing-page",
      "subscription",
      "PricingPage",
      "Page Tarifs : 3 générations gratuites à l'inscription, puis abonnement mensuel. Paiement annulé au checkout peut être réessayé. Résiliation libre.",
    ),

    // —— Forfaits (résumé comparatif) ——
    chunk(
      "plans-comparison",
      "plan",
      "plans",
      "Comparatif forfaits RealStage AI (tous payants dès souscription, pas d'essai mensuel) :\n- Starter 19€/mois : 30 générations/mois, 10 réflexions approfondies/mois, Meubler/Remplacer/Vider, historique, export HD.\n- Pro 39€/mois : 100 générations/mois, 50 réflexions approfondies/mois, tous styles et pièces, réglages IA avancés, support prioritaire. Inclut tout Starter.\n- Agence 99€/mois : générations illimitées, réflexion approfondie illimitée, multi-projets (biens), branding agence, support dédié. Inclut tout Pro.",
    ),

    // —— Gating fonctionnalités ——
    chunk(
      "feature-gating-summary",
      "feature",
      "features",
      "Fonctionnalités par forfait :\n- Pro et Agence : réglages IA avancés (créativité/fidélité), comparaison variantes A/B/C, workflow annonce guidé.\n- Agence uniquement : multi-projets (dossiers par bien/adresse), paramètres agence (logo, signature, mentions légales sur exports).",
    ),
    chunk(
      "feature-listing-workflow",
      "feature",
      "listingWorkflow",
      "Mode annonce (forfait Pro+) : workflow guidé avec étapes Importer → Classer → Générer → Comparer → Exporter. Checklist des pièces essentielles d'une annonce : salon, chambre, cuisine, salle de bain, entrée. Activable dans Paramètres > Préférences éditeur.",
    ),
    chunk(
      "feature-variants",
      "feature",
      "ControlPanel",
      "Variantes A/B/C (forfait Pro+) : choisir 2 ou 3 styles pour générer et comparer plusieurs rendus de la même photo. Bouton « Générer X variantes ».",
    ),
    chunk(
      "feature-deep-thinking",
      "feature",
      "ControlPanel",
      "Réflexion approfondie : option qui améliore la cohérence du rendu via plusieurs passes IA. Quotas : Starter 10/mois, Pro 50/mois, Agence illimité. Non disponible pendant l'essai gratuit des 3 générations sans abonnement.",
    ),
    chunk(
      "plan-error-agence",
      "feature",
      "requirePlan",
      "Message si fonctionnalité Agence requise : « Cette fonctionnalité est réservée au forfait Agence. »",
    ),
    chunk(
      "plan-error-pro",
      "feature",
      "requirePlan",
      "Message si forfait Pro requis : « Cette fonctionnalité nécessite le forfait Pro ou supérieur. »",
    ),

    // —— Modes ——
    chunk(
      "modes-summary",
      "mode",
      "modes",
      "Trois modes de transformation :\n1. Meubler : ajoute mobilier et décoration dans une pièce vide selon le style et type de pièce choisis.\n2. Remplacer : échange le mobilier visible au même emplacement, sans ajout de décoration ni modification de l'agencement.\n3. Vider (désencombrer) : retire le mobilier en préservant murs, fenêtres, portes et sols.\nMeubler et Remplacer nécessitent un style. Vider n'utilise pas de style.",
    ),
    chunk(
      "mode-after-declutter",
      "mode",
      "PhotoActionBar",
      "Après un mode Vider, un bouton « Puis Meubler » permet d'enchaîner directement vers le meublage de la pièce vidée.",
    ),

    // —— Styles & pièces (règles) ——
    chunk(
      "styles-rules",
      "style",
      "styles",
      "Plus de 30 styles d'intérieur et d'extérieur. Les pièces extérieures (terrasse, balcon, veranda, loggia, serre, pool house, extérieur) utilisent uniquement les styles « outdoor ». Les pièces intérieures utilisent les styles « interior ». Style par défaut intérieur : Moderne. Style par défaut extérieur : Terrasse moderne.",
    ),
    chunk(
      "styles-categories-interior",
      "style",
      "styles",
      "Catégories de styles intérieur : Moderne & épuré, Chaleureux & naturel, Classique & intemporel, Audacieux & décoratif, Luxe & prestige, Inspirations régionales.",
    ),
    chunk(
      "styles-categories-outdoor",
      "style",
      "styles",
      "Catégories de styles extérieur : Moderne & design, Méditerranéen & provençal, Resort & bord de mer, Jardin & nature, Urbain & rooftop, Caractère & ambiance.",
    ),
    chunk(
      "rooms-categories",
      "room",
      "roomTypes",
      "Catégories de types de pièces : Pièces de vie, Chambres, Cuisine & repas, Salles d'eau & bien-être, Loisirs & détente, Travail & utilitaires, Circulation, Extérieurs.",
    ),

    // —— Réglages IA ——
    chunk(
      "tuning-overview",
      "tuning",
      "GenerationTuningPanel",
      "Réglages IA avancés (forfait Pro et Agence) : trois curseurs — Fidélité↔Créativité (plus créatif = s'éloigne de la photo source), Précision du prompt (Souple→Strict, force le respect du style demandé), Niveau de détail (Rapide→Détaillé, plus de passes de calcul).",
    ),
    chunk(
      "tuning-presets-summary",
      "tuning",
      "generationTuning",
      "Presets réglages IA : Fidèle (photo d'origine respectée), Équilibré (compromis staging/réalisme), Créatif (staging audacieux), Magazine (rendu premium détaillé).",
    ),

    // —— Éditeur & workflow ——
    chunk(
      "editor-import",
      "editor",
      "ControlPanel",
      "Import de photos : formats acceptés JPEG, PNG, WEBP. Import unique ou multiple (file d'attente). Résolution conseillée : au moins 1200 px de large pour un résultat optimal.",
    ),
    chunk(
      "editor-surface",
      "editor",
      "ControlPanel",
      "Surface de la pièce (m²) : champ optionnel (ex. 25 m²), valeur entre 5 et 200 m². Aide l'IA à proportionner le mobilier.",
    ),
    chunk(
      "editor-adjustments",
      "editor",
      "ControlPanel",
      "Ajustements photo : luminosité et température de couleur avant génération. Disponibles pour tous les modes.",
    ),
    chunk(
      "editor-shortcuts",
      "editor",
      "ControlPanel",
      "Raccourcis clavier : ⌘+Entrée (ou Ctrl+Entrée) pour générer, ⌘+S pour télécharger l'image résultat.",
    ),
    chunk(
      "editor-workflow-default",
      "editor",
      "listingWorkflow",
      "Workflow standard (éditeur) : Importer → Configurer (mode, pièce, style) → Générer → Enchaîner (photo suivante).",
    ),
    chunk(
      "editor-workflow-listing",
      "editor",
      "listingWorkflow",
      "Workflow annonce (Pro+) : Importer → Classer (type de pièce) → Générer → Comparer (variantes) → Exporter (pack ZIP).",
    ),

    // —— Export ——
    chunk(
      "export-ai-label",
      "export",
      "exportLabel",
      "Mention IA sur les exports : texte par défaut « Image générée par IA ». Activable/désactivable dans Paramètres > Préférences éditeur. Permet la transparence sur les visuels exportés.",
    ),
    chunk(
      "export-pack-zip",
      "export",
      "exportPack",
      "Pack annonce (ZIP) : exporte les fichiers avant/après par pièce dans une archive. Contient un README.txt avec le nom du bien, l'adresse, la date et le nombre de pièces. Disponible depuis le panneau latéral après génération.",
    ),
    chunk(
      "export-hd",
      "export",
      "landingData",
      "Les exports sont en haute définition (HD), utilisables dans les annonces immobilières.",
    ),

    // —— Signalement ——
    chunk(
      "report-howto",
      "support",
      "ReportImageModal",
      "Signaler une image : bouton sur une génération dans l'historique. Motifs : Résultat non conforme, Qualité insuffisante, Architecture/proportions incorrectes, Meubles irréalistes ou mal placés, Style incorrect, Artefacts visuels, Autre (commentaire obligatoire). Confirmation : « Notre équipe examinera ce résultat. »",
    ),

    // —— Authentification ——
    chunk(
      "auth-methods",
      "account",
      "AuthPage",
      "Connexion : e-mail/mot de passe ou Google. Inscription : 3 essais gratuits, sans carte bancaire. Bénéfices annoncés : meubler et désencombrer par IA, 30+ styles, comparaison avant/après instantanée.",
    ),
    chunk(
      "auth-blacklist",
      "account",
      "blacklistService",
      "Si l'inscription est refusée : « Cette adresse e-mail n'est pas autorisée. » (liste de blocage administrative).",
    ),

    // —— Paramètres compte ——
    chunk(
      "settings-profile",
      "account",
      "UserSettingsPage",
      "Paramètres > Profil : modifier le nom affiché dans l'application.",
    ),
    chunk(
      "settings-password",
      "account",
      "UserSettingsPage",
      "Paramètres > Sécurité : changer le mot de passe (minimum 6 caractères). Disponible pour les comptes e-mail/mot de passe.",
    ),
    chunk(
      "settings-appearance",
      "account",
      "UserSettingsPage",
      "Paramètres > Apparence : choisir le thème clair ou sombre de l'interface.",
    ),
    chunk(
      "settings-editor-prefs",
      "account",
      "UserSettingsPage",
      "Paramètres > Préférences éditeur : activer le mode annonce (workflow guidé Pro+), activer la mention « Image générée par IA » sur les exports.",
    ),
    chunk(
      "settings-subscription",
      "account",
      "UserSettingsPage",
      "Paramètres > Abonnement : voir le forfait actuel, l'utilisation du mois (générations restantes), le statut essai ou abonnement, et gérer la facturation.",
    ),

    // —— Agence ——
    chunk(
      "agency-settings",
      "agency",
      "AgencySettingsPage",
      "Paramètres agence (forfait Agence) : style par défaut, logo (PNG/JPEG/WebP) avec opacité et position (bas droite, bas gauche, centre), signature photo, mentions légales (ex. « Photos virtuellement meublées — non contractuel »). Aperçu des exports brandés.",
    ),
    chunk(
      "agency-properties",
      "agency",
      "PropertiesPage",
      "Multi-projets / Mes biens (forfait Agence) : un dossier par adresse avec pièces, historique des générations et export groupé. Création d'un bien avec adresse et libellé court optionnel.",
    ),

    // —— Erreurs génération ——
    chunk(
      "error-maintenance",
      "support",
      "generate",
      "Pendant une maintenance plateforme : génération indisponible, message « Maintenance en cours » (ou message personnalisé admin).",
    ),
    chunk(
      "error-mode-disabled",
      "support",
      "generate",
      "Si un mode est désactivé par l'administration : « Ce mode est temporairement désactivé. »",
    ),
    chunk(
      "error-invalid-style",
      "support",
      "generate",
      "Style incompatible avec le type de pièce : « Invalid style for this room type » — choisir un style adapté (intérieur vs extérieur).",
    ),
    chunk(
      "error-invalid-sqm",
      "support",
      "generate",
      "Surface invalide : la surface en m² doit être un nombre entre 5 et 200.",
    ),

    // —— Chat support ——
    chunk(
      "chat-support",
      "support",
      "ChatWidget",
      "Support in-app : bulle de chat pour les utilisateurs connectés. Assistant IA répond aux questions sur l'app, les forfaits et les modes. Bouton « Parler à un conseiller humain » pour escalade vers un agent (Discord). Historique des conversations clôturées accessible via l'icône horloge.",
    ),
    chunk(
      "chat-welcome",
      "support",
      "chatService",
      "Message d'accueil assistant : « Bonjour ! Je suis l'assistant RealStage AI. Posez-moi une question sur l'application, les forfaits ou les modes Meubler, Remplacer et Vider. Vous pouvez aussi cliquer sur Parler à un agent pour un conseiller humain. »",
    ),
    chunk(
      "chat-close",
      "support",
      "discordBridge",
      "Clôture par un conseiller (Discord) : commande /close ou message « close » dans le fil du ticket. Le client reçoit une nouvelle conversation vierge ; l'ancienne reste dans l'historique du chat.",
    ),

    // —— Navigation & pages ——
    chunk(
      "app-navigation",
      "product",
      "Sidebar",
      "Navigation principale : barre latérale avec les 3 modes (Meubler, Remplacer, Vider). Liens secondaires : Plan (/pricing), Biens (/properties, forfait Agence), Agence (/settings/agency, forfait Agence). Paramètres compte : /settings. Éditeur photo : page d'accueil /.",
    ),
    chunk(
      "app-settings-route",
      "account",
      "UserSettingsPage",
      "Page Paramètres (/settings) : profil, sécurité (mot de passe), apparence (thème clair/sombre), préférences éditeur, abonnement et facturation.",
    ),
    chunk(
      "app-quick-prompts",
      "support",
      "ChatWidget",
      "Suggestions rapides du chat : « Quels sont les forfaits ? », « Comment fonctionne le mode Meubler ? », « Combien d'essais gratuits ? »",
    ),

    // —— File d'attente & actions photo ——
    chunk(
      "editor-photo-queue",
      "editor",
      "ControlPanel",
      "File d'attente photos : import multiple possible. Bouton « Photo suivante » ou « Suivante » pour passer à la photo suivante dans la file. Compteur de photos en attente affiché sur le bouton.",
    ),
    chunk(
      "editor-photo-actions",
      "editor",
      "PhotoActionBar",
      "Après une génération réussie : « Photo suivante » (file d'attente), « Pack annonce » (export ZIP), et en mode Vider « Puis Meubler » pour enchaîner vers le meublage.",
    ),
    chunk(
      "editor-adjustments-detail",
      "editor",
      "ControlPanel",
      "Ajustements photo avant génération : curseur Luminosité (sombre ↔ clair) et Température (froid ↔ chaud), de -100 à +100. Bouton réinitialiser les ajustements disponible.",
    ),

    // —— Forfaits (affichage) ——
    chunk(
      "plans-inheritance",
      "plan",
      "plans",
      "Affichage des forfaits : Pro et Agence listent « Fonctions Starter + » ou « Fonctions Pro + » pour indiquer l'héritage des fonctionnalités du forfait inférieur. Le forfait Pro est marqué « Populaire » sur la page Tarifs.",
    ),
    chunk(
      "plans-checkout",
      "subscription",
      "PricingPage",
      "Souscription : page Tarifs avec bouton « S'abonner » ou « Choisir ce plan ». Si déjà abonné : « Changer pour ce forfait » ou « Forfait actuel ». Paiement via Stripe si configuré ; sinon mode démo possible côté serveur.",
    ),
    chunk(
      "plans-starter-features",
      "plan",
      "plans",
      "Forfait Starter (19€/mois) inclut : 30 générations/mois, 10 réflexions approfondies/mois, modes Meubler/Remplacer/Vider, historique sauvegardé, export HD.",
    ),
    chunk(
      "plans-pro-features",
      "plan",
      "plans",
      "Forfait Pro (39€/mois) inclut : 100 générations/mois, 50 réflexions approfondies/mois, tous styles et pièces, réglages IA avancés (fidélité/créativité), support prioritaire, plus tout Starter.",
    ),
    chunk(
      "plans-agence-features",
      "plan",
      "plans",
      "Forfait Agence (99€/mois) inclut : générations illimitées, réflexion approfondie illimitée, réglages IA avancés, usage multi-projets (dossiers par bien), historique complet, support dédié, plus tout Pro.",
    ),

    // —— Agence (détails branding) ——
    chunk(
      "agency-branding-detail",
      "agency",
      "AgencySettingsPage",
      "Branding agence : style par défaut (ex. scandinave), logo PNG/JPEG/WebP avec opacité réglable (défaut 0,15), position filigrane (bas droite, bas gauche, centre), signature photo personnalisable (taille 10–48 px, gras), mentions légales (taille 8–32 px). Aperçu avant/après avec branding appliqué.",
    ),
    chunk(
      "agency-properties-detail",
      "agency",
      "PropertiesPage",
      "Mes biens : créer un dossier par adresse avec libellé court optionnel. Chaque bien regroupe les pièces, l'historique des générations et permet l'export groupé. Accessible depuis /properties (forfait Agence uniquement).",
    ),

    // —— Workflow annonce (détail) ——
    chunk(
      "listing-mode-pref",
      "workflow",
      "UserSettingsPage",
      "Activer le mode annonce : Paramètres > Préférences éditeur > basculer « Mode annonce ». Nécessite forfait Pro ou Agence. Affiche un workflow guidé avec checklist des pièces essentielles.",
    ),
    chunk(
      "listing-essential-ids",
      "workflow",
      "listingWorkflow",
      "Checklist pièces essentielles (identifiants internes) : salon, chambre, cuisine, sdb, entree. Le workflow propose la prochaine pièce manquante jusqu'à complétion, puis oriente vers l'export.",
    ),

    // —— Génération (comportement) ——
    chunk(
      "generation-loading",
      "editor",
      "modes",
      "Messages de chargement pendant génération : « Aménagement IA en cours… » (Meubler), « Remplacement IA en cours… » (Remplacer), « Vider IA en cours… » (Vider).",
    ),
    chunk(
      "generation-deep-thinking-trial",
      "subscription",
      "subscriptionService",
      "Réflexion approfondie pendant l'essai gratuit (3 générations sans abonnement) : non disponible — il faut un abonnement Starter minimum pour l'utiliser.",
    ),
    chunk(
      "generation-tuning-defaults",
      "tuning",
      "generationTuning",
      "Valeurs par défaut des réglages IA : créativité 50, précision prompt 50, niveau de détail 50. Chaque curseur accepte des valeurs de 0 à 100.",
    ),

    // —— Signalement (confirmation) ——
    chunk(
      "report-confirmation",
      "support",
      "ReportImageModal",
      "Après signalement d'une image : message « Notre équipe examinera ce résultat. » Accessible depuis l'historique des générations.",
    ),

    // —— Landing (confiance) ——
    chunk(
      "landing-trust",
      "product",
      "landingData",
      "RealStage AI est utilisé par des professionnels du secteur (réseaux et marques cités sur le site : Orpi, IAD, Century 21, Safti, Efficity, Nestenn, Coldwell Banker, Bien'ici).",
    ),
    chunk(
      "landing-stats",
      "product",
      "landingData",
      "Chiffres clés affichés : 30+ styles pro, moins de 15 secondes par génération, 3 essais gratuits à l'inscription, export qualité HD.",
    ),
  ];
}
