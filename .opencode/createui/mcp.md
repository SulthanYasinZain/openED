# Create UI MCP Server

The Create UI MCP server lets AI assistants browse, search, and install components from the `@createui` registry through the Model Context Protocol.

## Contents

- [Setup](#setup)
- [Recommended workflow for writing UI](#recommended-workflow-for-writing-ui)
- [Available Tools](#available-tools)
- [Usage Examples](#usage-examples)

## Setup

Start the MCP stdio server with:

```bash
npx @create-ui/cli mcp
```

To write the configuration file for your MCP client, run:

```bash
npx @create-ui/cli mcp init --client claude
```

Supported clients and the config path each one writes:

| Client | Config path |
| --- | --- |
| `claude` | `.mcp.json` |
| `cursor` | `.cursor/mcp.json` |
| `vscode` | `.vscode/mcp.json` |
| `codex` | `.codex/config.toml` |
| `opencode` | `opencode.json` |

The generated config always runs `npx @create-ui/cli mcp` (the package is `@create-ui/cli`; there is no bare `createui` npm package). For example, the `claude` client writes:

```json
{
  "mcpServers": {
    "createui": {
      "command": "npx",
      "args": ["@create-ui/cli", "mcp"]
    }
  }
}
```

## Recommended workflow for writing UI

1. **`get_component_reference` BEFORE writing code for any component whose Create UI API you haven't already confirmed this session** - pass a name or keyword (`"tab-menu"`, `"tabs"`, `"removable tag"`). Call it with an **empty query** first to get the catalog of every component and whether the current user can use each one (free / pro / locked). Create UI APIs differ from shadcn; do not guess. Offline fallback when the MCP is unavailable: `npx @create-ui/cli view <name>`.
2. `get_item_examples_from_registries` for full working demos of an item you haven't used - query `"<name>-demo"` (canonical usage), `"<name>-example"` (full gallery), or facet names like `"switch-thumb-icon"`, `"segmented-control-appearance"`. The reference is the concise API + gotchas; examples are the full galleries - they complement.
3. `view_items_in_registries` when you need the raw component source.
4. `search_items_in_registries` for a broader or cross-registry search.
5. Install with `npx @create-ui/cli add <items>` - never import a component that hasn't been added.
6. `get_audit_checklist` after generating code and fix anything it flags.

## Available Tools

The MCP server exposes five tools. **`@createui` is the only registry** - it is built in and needs no configuration, and there are no other registries to add. Wherever a tool takes a `registries` array, pass `["@createui"]`.

### get_component_reference

Fetches the auth-aware usage reference for a component: props/variants, 1-2 canonical snippets, when-to-use, and gotchas. Call it before writing code with any component whose API you have not confirmed this session. Accepts a name **or** a keyword; an **empty query returns the catalog** of every component with its tier and whether the current user can use it (free / pro / locked). This is the concise API; `get_item_examples_from_registries` is the full gallery. Auth-aware: a logged-in seat holder gets the richer pro reference, everyone else gets the free tier (or a locked upsell for pro-only components).

**Inputs:**
- `query` (string, optional) - component name or keyword; empty string returns the catalog

### search_items_in_registries

Searches for items across registries by query string (fuzzy match over names and descriptions). Use for a broad or cross-registry search; for a single component's usage prefer `get_component_reference`.

**Inputs:**
- `registries` (string[])
- `query` (string)
- `limit` (number, optional)
- `offset` (number, optional)

### view_items_in_registries

Returns detailed information about specific items, including file contents (the raw source). For *usage* (props, composition, icon props) use `get_component_reference` instead - source alone does not show canonical usage.

**Inputs:**
- `items` (string[]) - bare item names, e.g. `button` (the MCP server also accepts a `@createui/` prefix and strips it)

### get_item_examples_from_registries

Finds example and demo code for items with full source. Call it before the first use of any component. Useful query patterns: `{item}-demo`, `{item}-example`, and facet names like `switch-io-trigger` or `badge-with-icon`.

**Inputs:**
- `registries` (string[])
- `query` (string)

### get_audit_checklist

Returns a checklist to verify after adding components.

**Inputs:** none

> **Tip:** The MCP server has no equivalent for inspecting project configuration. To print the resolved aliases, framework, and Tailwind setup, run the `info` command directly: `npx @create-ui/cli info`.

## Usage Examples

Browse the Create UI registry:

```
Show me all available components in @createui
```

Search for a component:

```
Search for a date picker in @createui
```

Install a component:

```
Add the button and select components from @createui
```
