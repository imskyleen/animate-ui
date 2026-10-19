import { MANAGERS } from '@/components/docs/package-managers';
import { PAGE_TRANSITION_EFFECTS } from './page-transition-effects';

const { dlx, add } = MANAGERS.npm;

type Prop = {
  description?: string;
  type?: string;
  default?: string;
  required?: boolean;
};

function decode(text: string) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function dedent(text: string) {
  const lines = text.replace(/^\n+|\s+$/g, '').split('\n');
  const indent = Math.min(
    ...lines
      .filter((line) => line.trim())
      .map((line) => line.match(/^ */)![0].length),
  );
  return lines.map((line) => line.slice(indent)).join('\n');
}

const bash = (...commands: string[]) =>
  `\`\`\`bash\n${commands.join('\n')}\n\`\`\``;

const cell = (text: string) => text.replace(/\|/g, '\\|').replace(/\n/g, ' ');

function table(source: string) {
  let props: Record<string, Prop>;
  try {
    props = new Function(`return (${decode(source)})`)();
  } catch {
    return '';
  }
  const rows = Object.entries(props).map(
    ([name, prop]) =>
      `| \`${name}\`${prop.required ? ' (required)' : ''} | ${prop.type ? `\`${cell(prop.type)}\`` : ''} | ${prop.default ? `\`${cell(prop.default)}\`` : ''} | ${cell(prop.description ?? '')} |`,
  );
  return [
    '| Prop | Type | Default | Description |',
    '| --- | --- | --- | --- |',
    ...rows,
  ].join('\n');
}

export function toLlmMarkdown(text: string) {
  return text
    .replace(
      /^( *)<CodeBlockTabs[^>]*>[\s\S]*?<CodeBlockTab value="npm">([\s\S]*?)<\/CodeBlockTab>[\s\S]*?<\/CodeBlockTabs>/gm,
      (_, indent: string, npm: string) =>
        dedent(npm)
          .split('\n')
          .map((line) => indent + line)
          .join('\n'),
    )
    .replace(/^<Tabs[^>]*>\n([\s\S]*?)\n<\/Tabs>/gm, (_, tabs: string) =>
      [...tabs.matchAll(/<Tab value="([^"]*)">([\s\S]*?)<\/Tab>/g)]
        .map(([, value, content]) => `**${value}**\n\n${dedent(content!)}`)
        .join('\n\n'),
    )
    .replace(/^<Callout[^>]*>([\s\S]*?)<\/Callout>/gm, (_, content: string) =>
      dedent(content)
        .split('\n')
        .map((line) => `> ${line}`.trimEnd())
        .join('\n'),
    )
    .replace(/^<TypeTable\s+type="([\s\S]*?)"\s*\/>/gm, (_, source: string) =>
      table(source),
    )
    .replace(
      /^<RegistryInstallation name="([^"]+)"\s*\/>/gm,
      (_, name: string) => bash(`${dlx} shadcn@latest add @animate-ui/${name}`),
    )
    .replace(/^<Installation\s*\/>/gm, bash(`${add} @animate-ui/react motion`))
    .replace(
      /^<Installation name="([^"]+)"[^>]*\/>/gm,
      (_, name: string) =>
        `${bash(`${add} @animate-ui/react motion`)}\n\nAdd the shadcn/ui component, then animate it:\n\n${bash(
          `${dlx} shadcn@latest add ${name}`,
          `${dlx} @animate-ui/cli@latest animate ${name}`,
        )}`,
    )
    .replace(
      /^<PageTransitionEffects\s*\/>/gm,
      [
        '| Effect | What it does |',
        '| --- | --- |',
        ...PAGE_TRANSITION_EFFECTS.map(
          ([effect, description]) => `| \`${effect}\` | ${description} |`,
        ),
      ].join('\n'),
    )
    .replace(
      /^ *<ChangelogItemDescription>\n([\s\S]*?)\n *<\/ChangelogItemDescription>/gm,
      (_, content: string) => dedent(content),
    )
    .replace(
      /^ *<ChangelogItem(?: major)? date="([^"]+)">\s*<ChangelogItemVersion>\s*(## [^\n]+?)\s*<\/ChangelogItemVersion>/gm,
      (_, date: string, heading: string) => `${heading}\n\n_${date}_`,
    )
    .replace(
      /^ *<ChangelogItemTitle>\s*([^<]+?)\s*<\/ChangelogItemTitle>/gm,
      '### $1',
    )
    .replace(/^ *<\/?Changelog(?:Item)?>\n?/gm, '')
    .replace(
      /^<(ComponentPreview|IconsGallery|PrimitivesGrid|BackgroundsGrid|IconLibrariesGrid)\b[^>]*\/>\n*/gm,
      '',
    );
}
