import type { Primitive } from '../../lib/primitives';

// shadcn/ui's Questionnaire, built on @shadcn/react (`import { Questionnaire
// as QuestionnairePrimitive } from "@shadcn/react/questionnaire"`, mapped
// here by transform.ts) in every base. Animate UI's questionnaire has the
// same API and animates the parts shadcn renders (the steps, the choices'
// indicator, the error, the actions). shadcn's file carries no CSS animation
// to remove.
export default {
  library: 'animate-ui',
  name: 'questionnaire',
} satisfies Primitive;
