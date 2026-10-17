import type { ComponentType } from 'react';

import { CopySwap, ThemeSwap } from './swaps';

type DemoRef = { demo: string; label: string; note?: string };

type Family = {
  id: string;
  name: string;
  rule: string;
  values: string[];
  demos: DemoRef[];
  live?: boolean;
};

const GLOBAL_RULES = [
  "Ressorts d'abord : presque tout bouge sur un ressort (stiffness / damping). Les tweens sont réservés aux fondus, aux menus (fréquents), aux hauteurs des disclosures et à certains textes. Toutes les valeurs par rôle sont des tokens de @animate-ui/react/utils/motion (spring, transition, scale, blur, ease).",
  'Easing des tweens selon le rôle : entrée et sortie → ease-out fort, cubic-bezier(0.23, 1, 0.32, 1) ; panneaux d’onglets → les courbes de l’exemple de Motion (sortie sur l’easeOut de Motion, cubic-bezier(0, 0, 0.58, 1) ; entrée sur cubic-bezier(0.25, 0.1, 0.35, 1) ; hauteur sur sa courbe de layout, cubic-bezier(0.4, 0, 0.1, 1)) ; coche d’une checkbox qui se dessine → easeOut de Motion, cubic-bezier(0, 0, 0.58, 1), comme la v1 ; grandes surfaces → ease-out doux, cubic-bezier(0.215, 0.61, 0.355, 1) (accordéons et collapsibles qui se déplient, overlays des modales et des drawers, menus) ; mouvement à l’écran → ease-in-out (tracés, balayages, boucles des icônes) ; couleur → ease ; mouvement continu → linear. Jamais d’ease-in.',
  'La sortie rejoue la même transition que l’entrée, à l’envers (exitTransition = transition par défaut, comme en v1).',
  'Ce qui se presse réagit à la pression seulement : 0,97 sur un ressort 550/30. Rien ne grossit au survol (boutons, radio, toggles, Pinned List). La checkbox ne bouge pas : son fond et sa coche répondent au clic.',
  'Les éléments ancrés grandissent depuis leur déclencheur (origine = le déclencheur) et partent de plus loin quand ils sont petits : tooltips et toasts ancrés depuis 0,7, popovers et hover cards depuis 0,8 (ressort 400/29), menus, selects et navigation menus depuis 0,9 en 0,22s ease-out doux.',
  'Quand deux états se remplacent au même endroit (copier → coché, soleil → lune), un léger flou masque le chevauchement : 2px pour une icône, 4px pour une surface (modale). Les panneaux d’onglets ne se chevauchent pas, ils se succèdent : l’ancien part dans un flou de 5px, puis le nouveau en sort (exemple d’onglets de Motion). Le contenu d’une disclosure se dévoile depuis un flou de 2px.',
  'Un indicateur de sélection glisse sur 300/30 ; un surlignage qui suit le pointeur glisse sur 500/40, plus vif (tous deux un peu plus vifs que la v1 : 200/25 et 350/35).',
  'Une hauteur qui change suit un ressort 300/30 (celle des panneaux d’onglets glisse en 0,45s sur la courbe de layout de Motion, sans dépassement) ; une disclosure (accordéon, collapsible) se déplie en 0,35s sur un ease-out doux : hauteur, fondu et flou de 2px, d’après l’exemple d’accordéon de Motion.',
  'Ce que la v1 n’animait pas reste instantané (couleur du fond d’un switch).',
  'Le clavier anime exactement comme le pointeur. Un élément ouvert par défaut s’anime au montage (sauf les onglets : rien ne bouge au chargement, comme dans l’exemple de Motion).',
  'Mouvement réduit : plus de transform ni de glissement, les fondus restent.',
  'AnimateUIProvider tempo : multiplie toutes les durées et recale exactement les ressorts (stiffness / tempo², damping / tempo).',
];

const FAMILIES: Family[] = [
  {
    id: 'press',
    name: 'Pression',
    rule: 'Tout ce qui se presse réagit sous le doigt, et seulement là : rien ne grossit au survol.',
    values: [
      'scale 0,97 à la pression (boutons, radio, toggles, Pinned List) ; pas la checkbox',
      'ressort 550/30',
      'boutons : hoverScale reste disponible, 1 par défaut',
    ],
    demos: [
      { demo: 'animate-ui/button', label: 'Button' },
      {
        demo: 'radix-ui/checkbox',
        label: 'Checkbox',
        note: 'pas de scale à la pression ; coche tracée en 0,3s après 0,2s sur l’easeOut de Motion (délai et courbe de la v1) ; fond : un calque qui grandit de 70 % à 100 % en apparaissant, en 0,3s (comme HeroUI)',
      },
      { demo: 'radix-ui/toggle', label: 'Toggle' },
      {
        demo: 'animate-ui/ripple-button',
        label: 'Ripple Button',
        note: 'onde 0,6s ease-out',
      },
    ],
  },
  {
    id: 'switch',
    name: 'Switch et slider',
    rule: 'Le thumb s’étire sous le doigt puis glisse vers son côté ; le fond change instantanément.',
    values: [
      'étirement ×19/16 vers le centre de la piste',
      'glissement et retour de largeur : ressort 300/25',
      'couleur du fond : instantanée',
    ],
    demos: [
      { demo: 'radix-ui/switch', label: 'Switch (Radix)' },
      { demo: 'react-aria/switch', label: 'Switch (React Aria)' },
      {
        demo: 'radix-ui/slider',
        label: 'Slider',
        note: 'dérivé du thumb du switch, ressort plus calme 400/32 (~1,5 % de dépassement au lieu de ~4 %)',
      },
    ],
  },
  {
    id: 'pop',
    name: 'Éléments ancrés',
    rule: 'Un élément ancré grandit depuis son déclencheur, avec un léger dépassement ; plus il est petit, plus il part de loin.',
    values: [
      'tooltips : scale 0,7 → 1 + fondu',
      'popovers, hover cards : scale 0,8 → 1 + fondu',
      'ressort 400/29, à l’aller comme au retour, origine = le déclencheur',
      'Tooltip Animate UI : comme ceux des libs (0,7 depuis le déclencheur), et glisse d’un déclencheur à l’autre ; pendant ce temps son contenu change dans le sens du déplacement, comme un panneau d’onglets : l’ancien libellé part à l’opposé dans un flou de 6px en glissant de 40px (0,13s), le suivant arrive de 40px du côté où va la bulle, sort du flou et se voit dès le début de son glissement (0,34s, plus long que la bulle, qui va dans l’autre sens à l’écran) ; vers la droite, l’ancien part à gauche et le nouveau arrive par la droite ; vers le haut, l’ancien descend et le nouveau arrive par le haut, jamais étiré par le redimensionnement, coupé par le popup, la flèche ne fait que glisser',
      'tooltips Radix, Base UI, React Aria : une fois l’un ouvert, le suivant apparaît d’un coup et le précédent disparaît d’un coup (300ms de répit après le dernier)',
    ],
    demos: [
      { demo: 'radix-ui/popover', label: 'Popover' },
      { demo: 'radix-ui/tooltip', label: 'Tooltip' },
      { demo: 'radix-ui/hover-card', label: 'Hover Card' },
      { demo: 'animate-ui/tooltip', label: 'Tooltip (Animate UI)' },
      {
        demo: 'animate-ui/avatar-group',
        label: 'Avatar Group',
        note: 'montée au survol : ressort 300/17',
      },
    ],
  },
  {
    id: 'menus',
    name: 'Menus',
    rule: 'Les menus, fréquents, apparaissent vite et sobrement ; un surlignage glisse derrière l’élément survolé.',
    values: [
      'contenu : scale 0,9 → 1 + fondu en 0,22s, ease-out doux',
      'menubar et navigation menu, d’un menu à l’autre : le popover se déplace et se redimensionne sur un ressort 660/52 sans dépassement ; le contenu qui part glisse de 6px (24px pour un navigation menu) en 0,22s, le suivant arrive sur 450/43 et apparaît en 0,26s',
      'surlignage : ressort 500/40, un seul surlignage passé d’élément en élément avec sa vitesse',
      'coches : pop ; coche d’un select ou d’une combobox : glisse sur 500/40 (le ressort du surlignage), la liste attend avant de se fermer quand on choisit un autre item (250ms quand la coche se trace, 150ms quand elle glisse ou apparaît) ; indicateur radio des menus : glisse en 0,45s',
    ],
    demos: [
      { demo: 'radix-ui/dropdown-menu', label: 'Dropdown Menu' },
      { demo: 'radix-ui/context-menu', label: 'Context Menu' },
      { demo: 'radix-ui/menubar', label: 'Menubar' },
      { demo: 'radix-ui/select', label: 'Select' },
      { demo: 'base-ui/combobox', label: 'Combobox' },
      { demo: 'react-aria/combobox', label: 'Combobox (React Aria)' },
      {
        demo: 'radix-ui/navigation-menu',
        label: 'Navigation Menu',
        note: 'indicateur 500/40',
      },
    ],
  },
  {
    id: 'selection',
    name: 'Indicateur de sélection',
    rule: 'Ce qui marque la sélection glisse d’un élément à l’autre et l’ancien s’efface.',
    values: [
      'glissement : ressort 300/30',
      'onglets, toggle group (sélection simple) et pagination : une seule surface (pas de fondu entre deux), reprise en route avec sa vitesse ; voir « Onglets »',
      'remplissage (toggle group, sélection multiple) : de 70 % à 100 % en apparaissant, 0,3s cubic-bezier(0.4, 0, 0.2, 1) ; voisins réunis en une surface',
    ],
    demos: [
      {
        demo: 'radix-ui/toggle-group',
        label: 'Toggle Group',
        note: 'sélection multiple : la surface d’un élément sélectionné grandit de 70 % à 100 % depuis son centre en apparaissant, en 0,3s sur cubic-bezier(0.4, 0, 0.2, 1) (comme le fond du radio), et rétrécit en s’effaçant ; deux voisins sélectionnés se rejoignent en une seule surface (chacun s’étire jusqu’au milieu de l’écart, ses coins intérieurs deviennent droits, même durée), et se séparent quand on désélectionne celui du milieu ; ils se rejoignent s’ils se touchent (spacing 0) ou par-dessus un écart d’au plus la moitié de leur hauteur quand ils n’ont pas de bordure (variante outline espacée : chacun garde la sienne) ; lignes, colonnes, RTL. Sélection simple : une seule surface glisse sur 300/30 et garde sa vitesse si on en choisit un autre en route ; la première sélection la fait grandir, la vider la fait rétrécir. Survol : un surlignage glisse d’un élément à l’autre sur 500/40, apparaît et disparaît en 0,2s ease, au-dessus des surfaces sélectionnées, pas sur un élément déjà sélectionné ; cliqué, il reste le temps que la surface arrive dessous (pas de creux). Démo : survol plus clair que la sélection (bg-muted/50 contre bg-muted) ; contrôles spacing et orientation. Rien au montage ; mouvement réduit : fondus seulement (la sélection simple passe d’un élément à l’autre en fondu, le surlignage saute)',
      },
      {
        demo: 'base-ui/pagination',
        label: 'Pagination',
        note: 'une seule surface, celle du lien courant (aria-current="page") : un span derrière les liens copie ses classes et ses attributs data (variante outline : bordure, fond, coins, ombre, mode sombre), et une feuille de style masque la bordure, le fond et l’ombre du lien lui-même ; elle glisse d’un lien à l’autre sur 300/30 (translate, et sa taille seulement quand les liens diffèrent), reprise en route avec sa vitesse ; elle part de là où elle était dessinée (des numéros de page qui se décalent dans le même rendu ne la font pas sauter) et ne bouge pas si le lien courant reste en place ; mesurée sans l’enfoncement du bouton (active:translate-y-px). Survolé, le lien courant garde son propre fond de survol ; au clavier, son anneau de focus. Démo : la pagination-demo de shadcn avec sa page en state (1 à 3, Previous et Next s’arrêtent aux bouts). Rien au montage (une navigation qui la remonte montre la nouvelle page d’un coup) ; mouvement réduit : fondu enchaîné en 0,2s ease-out, cubic-bezier(0.23, 1, 0.32, 1) (une copie s’efface sur l’ancien lien pendant que la surface apparaît sur le nouveau)',
      },
    ],
  },
  {
    id: 'tabs',
    name: 'Onglets',
    rule: 'Onglets de Radix, Base UI et React Aria (les Tabs d’Animate UI gardent l’animation de la v1) : comme l’exemple d’onglets Radix de Motion : un seul indicateur glisse, et les panneaux se succèdent (AnimatePresence mode="wait") : l’ancien s’efface dans un flou en restant dans la page, puis le nouveau en sort pendant que la hauteur glisse.',
    values: [
      'indicateur : une seule surface, ressort 300/30, sur le compositeur (Web Animation de translate, et de sa taille quand les onglets diffèrent) ; repris en route là où il est, avec sa vitesse ; aucun à-coup quand les panneaux changent',
      'couleur du texte des onglets : 0,2s ease',
      'panneau qui part : opacité 1 → 0 et flou 0 → 5px en 0,15s sur l’easeOut de Motion, cubic-bezier(0, 0, 0.58, 1), en restant dans la page (inert)',
      'panneau qui arrive, une fois l’ancien parti : opacité 0 → 1 et flou 5px → 0 en 0,3s, cubic-bezier(0.25, 0.1, 0.35, 1)',
      'hauteur : de celle de l’ancien panneau à celle du nouveau, quand il arrive, en 0,45s sur la courbe de layout de Motion, cubic-bezier(0.4, 0, 0.1, 1), sans dépassement',
      'glissement du contenu selon l’ordre des onglets, comme le menubar et le navigation menu : vers un onglet suivant, le contenu qui part glisse de 12px vers le début en s’effaçant et le suivant arrive de 12px vers la fin (mêmes durées et courbes que les fondus, 0,15s puis 0,3s) ; l’inverse en revenant ; à la verticale pour des onglets verticaux, inversé en RTL ; dans un cadre (la Card), le cadre ne bouge pas, seul son contenu glisse, coupé par lui ; sans cadre, tout le panneau glisse ; un contenu qui arrivait et qu’on quitte repart d’où il en est, vers le côté opposé à la nouvelle direction ; mouvement réduit : pas de glissement',
      'panneau qui tient un cadre (la Card de shadcn : le panneau s’il dessine une bordure, un fond ou une ombre, sinon le premier élément qui le fait en descendant ses enfants uniques) : le cadre reste à l’écran, entier et net, seul son contenu s’efface puis revient ; le cadre suivant prend le relais à la même hauteur dans la même image, puis glisse à sa hauteur (son contenu coupé, jamais sa bordure ni ses coins) : la bordure ne clignote plus ; cadres différents (bordure, rayon, fond, ombre) ou texte posé directement dedans → panneaux entiers ; contenu placé contre un élément extérieur (pastille d’une étape sur son rail) → fondu sans flou',
      'changements rapides : un panneau sauté n’apparaît jamais, un panneau qui arrivait repart d’où il en est, la hauteur repart d’où elle en est ; jamais deux panneaux à la fois',
      'rien ne bouge au chargement ; mouvement réduit : l’indicateur et la hauteur sautent, les panneaux ne font que des fondus (sans flou), le nouveau en 0,2s',
    ],
    demos: [
      { demo: 'radix-ui/tabs', label: 'Tabs (Radix)' },
      { demo: 'base-ui/tabs', label: 'Tabs (Base UI)' },
      { demo: 'react-aria/tabs', label: 'Tabs (React Aria)' },
      {
        demo: 'animate-ui/tabs',
        label: 'Tabs (Animate UI)',
        note: 'animation de la v1, inchangée',
      },
    ],
  },
  {
    id: 'steps',
    name: 'Étapes',
    rule: 'Questionnaire de shadcn/ui (sur @shadcn/react, même composant sur les trois bases) : les questions se succèdent comme les panneaux d’onglets, en glissant selon leur ordre, pendant que la hauteur glisse de l’une à l’autre ; les boutons, l’erreur et les coches s’animent sur place. Rien n’est re-rendu : la Root observe les attributs de ses parties (MutationObserver) et anime les éléments (Web Animations).',
    values: [
      'question qui part : remontrée hors du flux par-dessus la suivante (toujours inert), glisse de 24px vers le début en s’effaçant dans un flou de 5px, en 0,15s sur l’easeOut de Motion, cubic-bezier(0, 0, 0.58, 1)',
      'question qui arrive, une fois l’autre partie : de 24px vers la fin, opacité 0 → 1 et flou 5px → 0 en 0,3s, cubic-bezier(0.25, 0.1, 0.35, 1) ; jamais cachée (le focus que lui donne la bibliothèque reste sur elle)',
      'en revenant (Previous, flèche gauche, reset) : l’inverse ; inversé en RTL ; un saut de plusieurs questions va droit au but',
      'hauteur : de celle de la question qui part à celle qui arrive, une fois la question partie (tenue jusque-là), en 0,45s sur la courbe de layout de Motion, cubic-bezier(0.4, 0, 0.1, 1), sans dépassement ; les boutons dessous suivent',
      'changements rapides : chacune repart d’où elle en est (une question qui repart s’efface en 0,15s × son opacité, une question reprise revient tout de suite), la hauteur aussi',
      'progression : les chiffres de « Question 2 of 3 » roulent (deux pseudo-éléments sur le nombre, ressort 300/35, 0,6em, flou 2px ; le texte reste le nombre) ; dans une question, ils ne roulent pas',
      'choix : pressé, il descend à 0,985 (ressort 550/30), comme les boutons en plus léger',
      'choix : le point grandit depuis 0 sur un ressort 200/16 et repart de même ; la coche se trace en 0,3s après 0,2s et s’efface en 0,3s (pop : depuis 0,5 et un flou de 2px, ressort 500/24) ; couleurs de l’indicateur en 0,2s ease',
      'erreur : se déplie (hauteur depuis 0, marge du haut depuis moins l’écart de la question), fondu et flou 2px → 0, en 0,35s ease-out doux, cubic-bezier(0.215, 0.61, 0.355, 1) ; se replie de même',
      'Previous, Skip, Next, Submit : sur place, depuis 0,9 et un flou de 2px en apparaissant, 0,15s ease-out, cubic-bezier(0.23, 1, 0.32, 1) ; Next et Submit partagent une case et se croisent',
      'rien au montage ni avant la première image ; mouvement réduit : les questions se succèdent en fondu seulement (0,2s puis 0,2s), la hauteur change une fois la question partie, le reste en fondu, rien ne rétrécit',
    ],
    demos: [
      {
        demo: 'base-ui/questionnaire',
        label: 'Questionnaire (Base UI)',
        note: 'la questionnaire-demo de shadcn : trois questions (une obligatoire avec trois choix décrits et une réponse libre, une facultative à choix multiples où Skip apparaît, une dernière obligatoire où Submit affiche « Save plan »), raccourcis par lettres, réponses dans un toast',
      },
      { demo: 'radix-ui/questionnaire', label: 'Questionnaire (Radix UI)' },
      {
        demo: 'react-aria/questionnaire',
        label: 'Questionnaire (React Aria)',
      },
    ],
  },
  {
    id: 'swap',
    name: 'Changement d’état (flou)',
    rule: 'Quand deux états se remplacent au même endroit, un léger flou fait lire leur chevauchement comme une seule forme qui change.',
    values: [
      'icônes : scale 0,5 + flou 2px + fondu, 0,15s ease-out (copier → coché, soleil → lune)',
      'Morphing Text : flou 10px',
    ],
    demos: [{ demo: 'animate-ui/morphing-text', label: 'Morphing Text' }],
    live: true,
  },
  {
    id: 'hover-highlight',
    name: 'Surlignage au survol',
    rule: 'Une surface qui suit le pointeur doit être vive pour ne pas traîner derrière lui.',
    values: [
      'ressort 500/40 (Highlight, menus, indicateur du Navigation Menu)',
    ],
    demos: [{ demo: 'animate-ui/highlight', label: 'Highlight' }],
  },
  {
    id: 'height',
    name: 'Hauteur',
    rule: 'Quand le contenu change de taille, la hauteur suit sans rebond.',
    values: [
      'ressort 300/30 (AutoHeight)',
      'panneaux des onglets : 0,45s sur la courbe de layout de Motion, sans dépassement (voir « Onglets »)',
    ],
    demos: [{ demo: 'animate-ui/auto-height', label: 'Auto Height' }],
  },
  {
    id: 'disclosure',
    name: 'Disclosure',
    rule: 'Un panneau se déplie de haut en bas ; ouvert par défaut, il se déplie au chargement.',
    values: [
      'hauteur 0 → auto + fondu + flou 2px → net (d’après l’exemple d’accordéon de Motion)',
      'bord bas estompé sur 16px pendant le mouvement (ou sur ce qui reste caché) : le contenu n’est jamais coupé net contre la bordure',
      '0,35s ease-out doux, cubic-bezier(0.215, 0.61, 0.355, 1), dans les deux sens',
      'chevron : rotation de 180° avec le panneau (0,35s, même courbe)',
    ],
    demos: [
      { demo: 'radix-ui/accordion', label: 'Accordion (Radix)' },
      { demo: 'react-aria/accordion', label: 'Disclosure (React Aria)' },
      { demo: 'radix-ui/collapsible', label: 'Collapsible' },
    ],
  },
  {
    id: 'modal',
    name: 'Modales',
    rule: 'Une modale se redresse vers l’écran ; le fond s’assombrit et se floute.',
    values: [
      'contenu : perspective rotateX(-20°) scale 0,8 flou 4px → droit, ressort 150/25',
      'fond : sa couleur et son flou d’arrière-plan (backdrop-filter) montent depuis 0 en 0,4s ease-out doux, un peu en avance sur le contenu, à l’ouverture comme à la fermeture (jamais une page déjà floue en fondu)',
    ],
    demos: [
      { demo: 'radix-ui/dialog', label: 'Dialog' },
      { demo: 'radix-ui/alert-dialog', label: 'Alert Dialog' },
      { demo: 'react-aria/dialog', label: 'Dialog (React Aria)' },
    ],
  },
  {
    id: 'sheet',
    name: 'Sheets, drawers, toasts',
    rule: 'Ce qui arrive par un bord glisse de sa propre taille en apparaissant, un peu plus vif qu’une modale (il parcourt plus de distance).',
    values: [
      'toast : monte de son bord depuis 0,96 et un flou de 4px, en fondu, sur un ressort 280/24 qui dépasse un peu (≈ 4 %) et se pose (90 % en ≈ 165ms, posé en ≈ 525ms) ; fermé, repart pareil mais plus vite : 0,2s sur la courbe de fermeture des dialogs (cubic-bezier(0.33, 0.17, 0.67, 0.5))',
      'toast, icône selon le type, une fois posé (après 0,2s) : succès → la coche se trace (0,3s, comme la checkbox) ; erreur → la croix se trace puis secoue « non » (3px, 0,4s) ; info, warning, spinner → pop depuis 0,5 et un flou de 2px (ressort 500/24)',
      'toast mis à jour (toast.promise / toast.update) : l’ancienne icône (le spinner qui tourne encore) rétrécit dans un flou de 2px pendant que la nouvelle se trace, le texte changé passe par le même flou (0,15s), la hauteur glisse vers la nouvelle sur le ressort du toast',
      'pile : se déplie au survol de l’avant vers l’arrière, 30ms entre chaque toast, et se replie pareil',
      'swipe : suit le doigt en s’effaçant (invisible à sa propre taille) ; dans le mauvais sens, élastique (moitié du geste puis butée à 48px) ; lâché, lancé à la vitesse du doigt (linéaire, entre 80 et 360ms)',
      'barre de temps restant (progressBar, désactivée par défaut, activée dans la démo) : rétrécit linéairement en temps réel, en pause quand Base UI met les minuteurs en pause (survol, focus, fenêtre en arrière-plan)',
      'toast ancré : comme un tooltip, depuis 0,7, ressort 400/29',
      'mouvement réduit : fondus seulement (pas de flou, de dépassement, de tracé, de secousse ni de cascade) ; la barre continue de rétrécir',
    ],
    demos: [
      { demo: 'radix-ui/sheet', label: 'Sheet' },
      { demo: 'radix-ui/drawer', label: 'Drawer (Radix)' },
      { demo: 'base-ui/drawer', label: 'Drawer (Base UI)' },
      { demo: 'base-ui/toast', label: 'Toast' },
      { demo: 'base-ui/toast-types', label: 'Toast (types)' },
      { demo: 'base-ui/toast-promise', label: 'Toast (promise)' },
    ],
  },
  {
    id: 'bouncy',
    name: 'Pop rebondi',
    rule: 'Les petits éléments qui apparaissent dans un contrôle rebondissent un peu.',
    values: ['scale et opacité depuis 0, ressort 200/16'],
    demos: [
      {
        demo: 'radix-ui/radio-group',
        label: 'Radio Group',
        note: 'fond : un calque qui grandit de 70 % à 100 % en apparaissant, en 0,3s (comme la checkbox)',
      },
      {
        demo: 'animate-ui/input-otp',
        label: 'Input OTP',
        note: 'chiffre : grandit depuis 0 sur 500/45, sans dépasser (+50ms par caractère collé) ; l’anneau glisse de case en case (500/40) ; un chiffre effacé rétrécit (0,15s) ; code complet : vague de case en case',
      },
      { demo: 'animate-ui/spring', label: 'Spring' },
    ],
  },
  {
    id: 'effects',
    name: "Effets d'entrée",
    rule: 'Les effets d’apparition ont un ressort plus joueur.',
    values: [
      'ressort 200/20',
      'slide : décalage 100px ; zoom : depuis 0,5 ; blur : 10px',
    ],
    demos: [
      { demo: 'animate-ui/fade', label: 'Fade' },
      { demo: 'animate-ui/slide', label: 'Slide' },
      { demo: 'animate-ui/zoom', label: 'Zoom' },
      { demo: 'animate-ui/blur', label: 'Blur' },
    ],
  },
  {
    id: 'numbers',
    name: 'Nombres',
    rule: 'Un nombre roule vers sa valeur sans dépasser.',
    values: [
      'ressort 90/50 (Counting Number, Sliding Number)',
      'Scrolling Number : 90/30 ; chiffres du Sliding Number : 200/20 masse 0,4',
      'Progress : la barre et sa valeur sur le même ressort 300/35 (le nombre bouge avec la barre), posé sans saut final',
    ],
    demos: [
      { demo: 'animate-ui/counting-number', label: 'Counting Number' },
      { demo: 'animate-ui/sliding-number', label: 'Sliding Number' },
      { demo: 'animate-ui/scrolling-number', label: 'Scrolling Number' },
      { demo: 'radix-ui/progress', label: 'Progress' },
    ],
  },
  {
    id: 'texts',
    name: 'Textes',
    rule: 'Chaque texte animé a son propre rythme, souvent en tween.',
    values: [
      'Rolling : rotateX 0,5s ease-out, +0,1s par lettre',
      'Sliding : y d’une hauteur en 0,25s [0,4, 0, 0,2, 1], retour au départ du survol',
      'Swapping : lettre par lettre, y ±0,5em + flou 2px en 0,2s, +0,04s par lettre',
      'Splitting : x 150 → 0 en 0,7s ease-out, +0,05s par caractère',
      'Morphing : scale 0,8 + flou 10px, ressort 125/25 masse 0,4',
      'Rotating : 0,3s ease-out ; Highlight : 2s ease-in-out',
    ],
    demos: [
      { demo: 'animate-ui/rolling-text', label: 'Rolling Text' },
      { demo: 'animate-ui/sliding-text', label: 'Sliding Text' },
      { demo: 'animate-ui/swapping-text', label: 'Swapping Text' },
      { demo: 'animate-ui/splitting-text', label: 'Splitting Text' },
      { demo: 'animate-ui/morphing-text', label: 'Morphing Text' },
      { demo: 'animate-ui/rotating-text', label: 'Rotating Text' },
      { demo: 'animate-ui/highlight-text', label: 'Highlight Text' },
      { demo: 'animate-ui/typing-text', label: 'Typing Text' },
    ],
  },
  {
    id: 'delight',
    name: 'Effets interactifs (valeurs propres)',
    rule: 'Les effets de « délice » gardent chacun leur ressort, choisi pour leur sensation.',
    values: [
      'Magnetic 100/10 masse 0,5 · Tilt 300/25 masse 0,5 · Flip 280/20',
      'Pinned List 320/25 masse 0,8 · Cursor 500/50 · Image Zoom 200/28',
      'Liquid Button : se remplit au survol, sans grossir',
    ],
    demos: [
      { demo: 'animate-ui/magnetic', label: 'Magnetic' },
      { demo: 'animate-ui/tilt', label: 'Tilt' },
      { demo: 'animate-ui/flip-button', label: 'Flip Button' },
      { demo: 'animate-ui/pinned-list', label: 'Pinned List' },
      { demo: 'animate-ui/cursor', label: 'Cursor' },
      { demo: 'animate-ui/liquid-button', label: 'Liquid Button' },
    ],
  },
];

async function loadDemo(demo: string) {
  const mod = (await import(`@/demos/${demo}`)) as {
    default: ComponentType;
  };
  return mod.default;
}

export default async function MotionReviewPage() {
  const families = await Promise.all(
    FAMILIES.map(async (family) => ({
      ...family,
      loaded: await Promise.all(
        family.demos.map(async (ref) => ({
          ...ref,
          Demo: await loadDemo(ref.demo),
        })),
      ),
    })),
  );

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-medium">Animations d’Animate UI</h1>
        <p className="text-muted-foreground">
          Toutes les familles de mouvement, leurs règles et leurs valeurs, avec
          les démos en direct. Page de revue locale (non liée depuis la doc).
        </p>
        <nav className="flex flex-wrap gap-2 text-sm">
          {FAMILIES.map((family) => (
            <a
              key={family.id}
              href={`#${family.id}`}
              className="rounded-md bg-accent px-2.5 py-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              {family.name}
            </a>
          ))}
        </nav>
      </header>

      <section className="rounded-xl bg-accent p-1">
        <div className="rounded-lg bg-background p-6">
          <h2 className="mb-4 text-xl font-medium">Règles actuelles</h2>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed">
            {GLOBAL_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </div>
      </section>

      {families.map((family) => (
        <section
          key={family.id}
          id={family.id}
          className="flex scroll-mt-6 flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-medium">{family.name}</h2>
            <p className="text-muted-foreground">{family.rule}</p>
            <ul className="flex flex-wrap gap-2">
              {family.values.map((value) => (
                <li
                  key={value}
                  className="rounded-md bg-accent px-2 py-1 font-mono text-xs"
                >
                  {value}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {family.loaded.map(({ demo, label, note, Demo }) => (
              <figure
                key={demo}
                className="flex flex-col gap-1 rounded-xl bg-accent p-1"
              >
                <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-lg bg-background p-6">
                  <Demo />
                </div>
                <figcaption className="flex flex-col px-2 py-1 text-xs">
                  <span className="font-medium">{label}</span>
                  {note && (
                    <span className="text-muted-foreground">{note}</span>
                  )}
                  <span className="text-muted-foreground/70 font-mono">
                    {demo}
                  </span>
                </figcaption>
              </figure>
            ))}
            {family.live && (
              <figure className="flex flex-col gap-1 rounded-xl bg-accent p-1">
                <div className="relative flex min-h-64 items-center justify-center gap-4 overflow-hidden rounded-lg bg-background p-6">
                  <CopySwap />
                  <ThemeSwap />
                </div>
                <figcaption className="flex flex-col px-2 py-1 text-xs">
                  <span className="font-medium">Copier, thème</span>
                  <span className="text-muted-foreground">
                    boutons de la doc (blocs de code, Copy page, header)
                  </span>
                </figcaption>
              </figure>
            )}
          </div>
        </section>
      ))}
    </main>
  );
}
