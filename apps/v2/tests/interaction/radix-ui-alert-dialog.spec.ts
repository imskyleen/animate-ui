import { describeAlertDialogDemo } from './alert-dialog-demo';

describeAlertDialogDemo('radix-ui', (page) =>
  page.goto('/tests/demos/radix-ui/alert-dialog', { waitUntil: 'networkidle' }),
);
