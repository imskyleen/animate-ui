export const toProjectPath = (target: string) =>
  target.replace(/^@ui\//, 'components/ui/').replace(/^@/, '');
