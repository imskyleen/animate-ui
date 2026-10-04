import type { ComponentType } from 'react';

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
};

const GLOBAL_RULES = [
  "Ressorts d'abord : presque tout bouge sur un ressort (stiffness / damping). Les tweens sont réservés aux fondus, aux menus (fréquents), aux hauteurs des disclosures et à certains textes.",
  'La sortie rejoue la même transition que l’entrée, à l’envers (exitTransition = transition par défaut, comme en v1).',
  'Pression 0,95 et survol 1,05 sur un ressort 550/30 (le ressort de scale par défaut de Motion) pour tout ce qui se presse.',
  'Les cartes ancrées (popover, tooltip, hover card) partent de 0,5 depuis leur déclencheur ; les menus, plus fréquents, partent de 0,95 en 0,2s.',
  'Un indicateur de sélection glisse sur 200/25 ; un surlignage qui suit le pointeur glisse sur 350/35, plus vif.',
  'Une hauteur qui change suit un ressort 300/30 ; une disclosure (accordéon, collapsible) s’ouvre en 0,35s ease-in-out, avec montée de 20px et masque.',
  'Ce que la v1 n’animait pas reste instantané (couleur du fond d’un switch).',
  'Le clavier anime exactement comme le pointeur. Un élément ouvert par défaut s’anime au montage.',
  'Mouvement réduit : plus de transform ni de glissement, les fondus restent.',
  'AnimateUIProvider tempo : multiplie toutes les durées et recale exactement les ressorts (stiffness / tempo², damping / tempo).',
];

const FAMILIES: Family[] = [
  {
    id: 'press',
    name: 'Pression / survol',
    rule: 'Tout ce qui se presse réagit sous le doigt. Les contrôles de choix grandissent aussi au survol.',
    values: [
      'scale 0,95 à la pression, 1,05 au survol (checkbox, radio, boutons)',
      'ressort 550/30',
    ],
    demos: [
      { demo: 'animate-ui/button', label: 'Button' },
      {
        demo: 'radix-ui/checkbox',
        label: 'Checkbox',
        note: 'coche tracée en 0,2s après 0,2s',
      },
      {
        demo: 'radix-ui/toggle',
        label: 'Toggle',
        note: 'pression seule, pas de survol',
      },
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
    name: 'Pop (cartes ancrées)',
    rule: 'Une carte ancrée apparaît depuis son déclencheur, avec un léger dépassement.',
    values: [
      'scale 0,5 → 1 + fondu, origine = le déclencheur',
      'ressort 300/25, à l’aller comme au retour',
      'Tooltip Animate UI : scale 0 → 1, montée de 15px, même ressort',
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
      'contenu : scale 0,95 → 1 + fondu en 0,2s (tween)',
      'surlignage : ressort 350/35, l’ancienne copie s’efface après 200ms',
      'coches : pop ; indicateur radio : glisse en 0,45s',
    ],
    demos: [
      { demo: 'radix-ui/dropdown-menu', label: 'Dropdown Menu' },
      { demo: 'radix-ui/context-menu', label: 'Context Menu' },
      { demo: 'radix-ui/menubar', label: 'Menubar' },
      { demo: 'radix-ui/select', label: 'Select' },
      { demo: 'base-ui/combobox', label: 'Combobox' },
      {
        demo: 'radix-ui/navigation-menu',
        label: 'Navigation Menu',
        note: 'indicateur 350/35',
      },
    ],
  },
  {
    id: 'selection',
    name: 'Indicateur de sélection',
    rule: 'Ce qui marque la sélection glisse d’un élément à l’autre et l’ancien s’efface.',
    values: [
      'glissement : ressort 200/25',
      'onglets : couleur du texte 0,5s ease-in-out, panneau depuis un flou de 4px en 0,5s',
    ],
    demos: [
      { demo: 'radix-ui/tabs', label: 'Tabs (Radix)' },
      { demo: 'react-aria/tabs', label: 'Tabs (React Aria)' },
      { demo: 'animate-ui/tabs', label: 'Tabs (Animate UI)' },
      { demo: 'radix-ui/toggle-group', label: 'Toggle Group' },
    ],
  },
  {
    id: 'hover-highlight',
    name: 'Surlignage au survol',
    rule: 'Une surface qui suit le pointeur doit être vive pour ne pas traîner derrière lui.',
    values: [
      'ressort 350/35 (Highlight, menus, indicateur du Navigation Menu)',
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
      'hauteur 0 → auto + fondu + montée de 20px + masque (sauf collapsible Radix)',
      '0,35s ease-in-out, dans les deux sens',
      'chevron : rotation de 180° en 0,2s',
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
      'fond : fondu + flou 4px en 0,2s ease-in-out',
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
      'toast ancré : pop 0,5 → 1, ressort 300/25',
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
      { demo: 'radix-ui/radio-group', label: 'Radio Group' },
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
      'Progress : la barre et sa valeur sur le même ressort 100/30 (le nombre bouge avec la barre)',
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
      'Liquid Button : 0,3s ease-out au survol',
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
          </div>
        </section>
      ))}
    </main>
  );
}
