import { CodeTabs } from '@/registry/components/animate/code-tabs';

const CODES = {
  Cursor: `// Copy and paste the code into .cursor/mcp.json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["-y", "shadcn@canary", "registry:mcp"],
      "env": {
        "REGISTRY_URL": "@animate-ui/registry.json"
      }
    }
  }
}`,
  Windsurf: `// Copy and paste the code into .codeium/windsurf/mcp_config.json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["-y", "shadcn@canary", "registry:mcp"],
      "env": {
        "REGISTRY_URL": "@animate-ui/registry.json"
      }
    }
  }
}`,
};

export const CodeTabsDemo = () => {
  return <CodeTabs lang="json" codes={CODES} />;
};
