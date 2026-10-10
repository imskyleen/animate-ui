import type { ComponentType } from 'react';

import { CopySwap, ThemeSwap } from './swaps';

// Local review page: every motion "family" of Animate UI, its rule and
// values, with the live demos side by side. Not linked from the docs.

type DemoRef = { demo: string; label: string; note?: string };

type Family = {
  id: string;
  name: string;
  /** When this family applies, and what moves. */
  rule: string;
  /** The values, as written in the primitives. */
  values: string[];
  demos: DemoRef[];
  /** Also shows the docs' own icon swaps (copy button, theme toggle). */
  live?: boolean;
};

const GLOBAL_RULES = [
  "Ressorts d'abord : presque tout bouge sur un ressort (stiffness / damping). Les tweens sont réservés aux fondus, aux menus (fréquents), aux hauteurs des disclosures et à certains textes. Toutes les valeurs par rôle sont des tokens de @animate-ui/react/utils/motion (spring, transition, scale, blur, ease).",
  'Easing des tweens selon le rôle : entrée et sortie → ease-out fort, cubic-bezier(0.23, 1, 0.32, 1) (panneaux d’onglets) ; coche d’une checkbox qui se dessine → easeOut de Motion, cubic-bezier(0, 0, 0.58, 1), comme la v1 ; grandes surfaces → ease-out doux, cubic-bezier(0.215, 0.61, 0.355, 1) (accordéons et collapsibles qui se déplient, overlays des modales et des drawers, menus) ; mouvement à l’écran → ease-in-out (tracés, balayages, boucles des icônes) ; couleur → ease ; mouvement continu → linear. Jamais d’ease-in.',
  'La sortie rejoue la même transition que l’entrée, à l’envers (exitTransition = transition par défaut, comme en v1).',
  'Ce qui se presse réagit à la pression seulement : 0,95 sur un ressort 550/30. Rien ne grossit au survol (boutons, radio, toggles, Pinned List). La checkbox ne bouge pas : son fond et sa coche répondent au clic.',
  'Les éléments ancrés grandissent depuis leur déclencheur (origine = le déclencheur) et partent de plus loin quand ils sont petits : tooltips et toasts ancrés depuis 0,7, popovers et hover cards depuis 0,8 (ressort 400/29), menus, selects et navigation menus depuis 0,9 en 0,22s ease-out doux.',
  'Quand deux états se remplacent au même endroit (copier → coché, soleil → lune, panneaux d’onglets), un léger flou masque le chevauchement : 2px pour une icône, 4px pour un panneau. Le contenu d’une disclosure se dévoile depuis un flou de 2px.',
  'Un indicateur de sélection glisse sur 300/30 ; un surlignage qui suit le pointeur glisse sur 500/40, plus vif (tous deux un peu plus vifs que la v1 : 200/25 et 350/35).',
  'Une hauteur qui change suit un ressort 300/30 ; une disclosure (accordéon, collapsible) se déplie en 0,35s sur un ease-out doux : hauteur, fondu et flou de 2px, d’après l’exemple d’accordéon de Motion.',
  'Ce que la v1 n’animait pas reste instantané (couleur du fond d’un switch).',
  'Le clavier anime exactement comme le pointeur. Un élément ouvert par défaut s’anime au montage.',
  'Mouvement réduit : plus de transform ni de glissement, les fondus restent.',
  'AnimateUIProvider tempo : multiplie toutes les durées et recale exactement les ressorts (stiffness / tempo², damping / tempo).',
];

const FAMILIES: Family[] = [
  {
    id: 'press',
    name: 'Pression',
    rule: 'Tout ce qui se presse réagit sous le doigt, et seulement là : rien ne grossit au survol.',
    values: [
      'scale 0,95 à la pression (boutons, radio, toggles, Pinned List) ; pas la checkbox',
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
        note: 'dérivé du thumb du switch',
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
      'Tooltip Animate UI : comme ceux des libs (0,7 depuis le déclencheur), et glisse d’un déclencheur à l’autre',
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
      'onglets : couleur du texte 0,5s ease, panneau depuis un flou de 4px en 0,5s ease-out',
    ],
    demos: [
      { demo: 'radix-ui/tabs', label: 'Tabs (Radix)' },
      { demo: 'react-aria/tabs', label: 'Tabs (React Aria)' },
      { demo: 'animate-ui/tabs', label: 'Tabs (Animate UI)' },
      { demo: 'radix-ui/toggle-group', label: 'Toggle Group' },
    ],
  },
  {
    id: 'swap',
    name: 'Changement d’état (flou)',
    rule: 'Quand deux états se remplacent au même endroit, un léger flou fait lire leur chevauchement comme une seule forme qui change.',
    values: [
      'icônes : scale 0,5 + flou 2px + fondu, 0,2s ease-out (copier → coché, soleil → lune)',
      'panneaux d’onglets : depuis un flou de 4px',
      'Morphing Text : flou 10px',
    ],
    demos: [
      { demo: 'animate-ui/tabs', label: 'Tabs (Animate UI)' },
      { demo: 'animate-ui/morphing-text', label: 'Morphing Text' },
    ],
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
    values: ['ressort 300/30 (AutoHeight, panneaux des onglets)'],
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
      'glissement + fondu, ressort 150/22 (≈ 550ms)',
      'toast ancré : comme un tooltip, depuis 0,7, ressort 400/29',
    ],
    demos: [
      { demo: 'radix-ui/dialog-sheet', label: 'Sheet' },
      { demo: 'radix-ui/drawer', label: 'Drawer (Radix)' },
      { demo: 'base-ui/drawer', label: 'Drawer (Base UI)' },
      { demo: 'base-ui/toast', label: 'Toast' },
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
        note: '+50ms par caractère',
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
      'Progress : la barre et sa valeur sur le même ressort 300/35, comme la progress bar de Motion UI (le nombre bouge avec la barre), posé sans saut final',
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
      'Splitting : x 150 → 0 en 0,7s ease-out, +0,05s par caractère',
      'Morphing : scale 0,8 + flou 10px, ressort 125/25 masse 0,4',
      'Rotating : 0,3s ease-out ; Highlight : 2s ease-in-out',
    ],
    demos: [
      { demo: 'animate-ui/rolling-text', label: 'Rolling Text' },
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
