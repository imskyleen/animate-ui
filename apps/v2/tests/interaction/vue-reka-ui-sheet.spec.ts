import { gotoVueMounted } from './disclosure-timeline';
import { sheetCases } from './sheet-cases';

sheetCases(
  'vue-reka-ui',
  [
    "-} from 'reka-ui'",
    "+} from '@animate-ui/vue/primitives/reka-ui'",
    "-} from 'reka-ui'",
    "+} from '@animate-ui/vue/primitives/reka-ui'",
  ],
  {
    goto: (page, name) =>
      gotoVueMounted(
        page,
        name === 'sheet'
          ? '/tests/vue-demos/reka-ui/sheet'
          : `/tests/vue-demos/fixtures/${name}`,
      ),
    sides: 'reka-ui-sheet-side',
    rest: { bg: 0.8, blur: 0 },
    docs: '/docs/vue/primitives/reka-ui/sheet',
    noCloseButton: false,
  },
);
