# Create UI CLI Reference

Configuration is read from `components.json`.

The CLI is published as **`@create-ui/cli`** and exposes the **`createui`** bin. Run it with `npx @create-ui/cli <command>` - or install it globally with `pnpm add -g @create-ui/cli` and then run `createui <command>`.

> **IMPORTANT:** Only use the flags documented below. Do not invent or guess flags - if a flag isn't listed here, it doesn't exist.

## Contents

- Commands: init, create, add, diff, view, search, migrate, info, mcp, skill
- Templates: next, vite, start, next-monorepo
- Registry & namespaces: the built-in `@createui` (the only registry)

(The CLI also has `build` / `registry:build` commands for registry authors publishing their own items - not needed for using Create UI in an app.)

---

## Commands

Program name `createui`. Description: "add items from registries to your project". Print the version with `-v, --version`.

### `init` - Initialize your project and install dependencies

```bash
npx @create-ui/cli init [components...] [options]
```

Initializes Create UI in an existing project: writes `components.json`, installs dependencies, and applies the base style and theme. Optionally installs the listed components (names, URLs, or local paths) in the same step.

| Flag                     | Short | Description                                                       | Default |
| ------------------------ | ----- | --------------------------------------------------------------- | ------- |
| `--template <template>`  | `-t`  | Template: `next`, `start`, `vite`, `next-monorepo`              | -       |
| `--theme <theme>`        |       | Primary color theme: `indigo`, `blue`, `lime`, `green`, `red`, `orange`, `yellow`, `cyan` | -       |
| `--neutral <neutral>`    |       | Neutral color theme: `zinc`, `gray`, `slate`, `base`, `stone`   | -       |
| `--font-variant <v>`     |       | Font variant: `v1`, `v2`, `v3`, `v4`, `v5`                       | -       |
| `--base-color <color>`   | `-b`  | DEPRECATED - use `--theme` instead                             | -       |
| `--yes`                  | `-y`  | Skip confirmation prompt                                        | `true`  |
| `--defaults`             | `-d`  | Use default configuration                                       | `false` |
| `--force`                | `-f`  | Force overwrite of existing config                             | `false` |
| `--cwd <cwd>`            | `-c`  | Working directory                                              | current |
| `--silent`               | `-s`  | Mute output                                                    | `false` |
| `--src-dir`              |       | Use the `src` directory                                       | -       |
| `--no-src-dir`           |       | Do not use the `src` directory                               | -       |
| `--css-variables`        |       | Use CSS variables for theming                                | `true`  |
| `--no-css-variables`     |       | Do not use CSS variables for theming                        | -       |
| `--no-base-style`        |       | Do not install the base Create UI style                      | -       |

Pick a theme with `--theme` and `--neutral`; these are swappable token sets layered on the one Create UI system (there is no style/base split to choose).

### `create` - Create a new project with Create UI

```bash
npx @create-ui/cli create [name] [options]
```

Scaffolds a brand-new project. Anything not passed as a flag is prompted interactively: project name, template, then the theme choices (primary / neutral / font). `--preset` skips the theme prompts - bare `--preset` shows an interactive preset list, or pass a preset name/URL directly.

| Flag                    | Short | Description                                   | Default |
| ----------------------- | ----- | --------------------------------------------- | ------- |
| `--template <template>` | `-t`  | Template: `next`, `start`, `vite`             | -       |
| `--preset [name]`       | `-p`  | Use a preset configuration (interactive list if no name) | -       |
| `--cwd <cwd>`           | `-c`  | Working directory                             | current |
| `--src-dir`             |       | Use the `src` directory                       | -       |
| `--no-src-dir`          |       | Do not use the `src` directory                | -       |
| `--yes`                 | `-y`  | Skip confirmation prompt                      | `true`  |

`create` scaffolds a **project**; it is not an alias for `init`. To set up Create UI inside an existing project, use `init`.

### `add` - Add a component to your project

```bash
npx @create-ui/cli add [components...] [options]
```

Accepts bare names (`button`), full URLs, and local paths. There is no namespaced item form - `add @createui/button` does not resolve; always use the bare name.

| Flag                  | Short | Description                            | Default |
| --------------------- | ----- | -------------------------------------- | ------- |
| `--yes`               | `-y`  | Skip confirmation prompt               | `false` |
| `--overwrite`         | `-o`  | Overwrite existing files               | `false` |
| `--cwd <cwd>`         | `-c`  | Working directory                      | current |
| `--all`               | `-a`  | Add all available components           | `false` |
| `--path <path>`       | `-p`  | The path to add the component to       | -       |
| `--silent`            | `-s`  | Mute output                            | `false` |
| `--src-dir`           |       | Use the `src` directory                | -       |
| `--no-src-dir`        |       | Do not use the `src` directory         | -       |
| `--css-variables`     |       | Use CSS variables for theming          | `true`  |
| `--no-css-variables`  |       | Do not use CSS variables for theming   | -       |

```bash
# Add by name.
npx @create-ui/cli add button

# Add from a URL or a local path.
npx @create-ui/cli add https://createui.co/r/button.json
```

To check whether installed components are out of date, use the `diff` command (below).

### `diff` - Check for updates against the registry

```bash
npx @create-ui/cli diff [component] [options]
```

With no argument, lists the components that have updates available. With a component name, shows what changed upstream.

| Flag          | Short | Description              | Default |
| ------------- | ----- | ------------------------ | ------- |
| `--yes`       | `-y`  | Skip confirmation prompt | `false` |
| `--cwd <cwd>` | `-c`  | Working directory        | current |

### `view` - View items from the registry

```bash
npx @create-ui/cli view <items...> [options]
```

Prints item metadata plus file contents (as JSON). Items are bare names or URLs, e.g. `button`. Examples are registry items too - `view badge-demo` prints a component's canonical usage; check it (or MCP `get_component_reference('<name>')`) before the first use of a component.

| Flag          | Short | Description       | Default |
| ------------- | ----- | ----------------- | ------- |
| `--cwd <cwd>` | `-c`  | Working directory | current |

### `search` (alias: `list`) - Search items from registries

```bash
npx @create-ui/cli search <registries...> [options]
npx @create-ui/cli list <registries...> [options]
```

Searches one or more registries. Registry names must start with `@` (e.g. `@createui`). Without `-q`, lists items.

| Flag                | Short | Description            | Default |
| ------------------- | ----- | ---------------------- | ------- |
| `--query <query>`   | `-q`  | Search query           | -       |
| `--limit <number>`  | `-l`  | Max items per registry | `100`   |
| `--offset <number>` | `-o`  | Items to skip          | `0`     |
| `--cwd <cwd>`       | `-c`  | Working directory      | current |

```bash
# List everything in the built-in registry.
npx @create-ui/cli search @createui

# Fuzzy search.
npx @create-ui/cli search @createui -q select
```

### `migrate` - Run a migration

```bash
npx @create-ui/cli migrate [migration] [options]
```

Available migrations:

- `icons` - migrate a project from a legacy icon library (lucide / radix) to Create UI's `@create-ui/assets/icons` (Remix `Ri*`).
- `radix` - migrate to `radix-ui`, consolidating `@radix-ui/react-*` imports into the unified `radix-ui` package.

| Flag          | Short | Description              | Default |
| ------------- | ----- | ------------------------ | ------- |
| `--list`      | `-l`  | List available migrations | -       |
| `--yes`       | `-y`  | Skip confirmation prompt | -       |
| `--cwd <cwd>` | `-c`  | Working directory        | current |

### `info` - Get information about your project

```bash
npx @create-ui/cli info [options]
```

Prints project information plus the contents of `components.json`. Run this first to discover the project's framework, aliases, resolved paths, and the global CSS file (the `tailwind.css` path is where custom tokens go).

| Flag          | Short | Description       | Default |
| ------------- | ----- | ----------------- | ------- |
| `--cwd <cwd>` | `-c`  | Working directory | current |

### `mcp` - MCP server and configuration commands

```bash
# Start the stdio MCP server.
npx @create-ui/cli mcp

# Initialize MCP configuration for a client.
npx @create-ui/cli mcp init --client <client>
```

Running `createui mcp` starts the stdio MCP server. The `mcp init` subcommand writes the MCP config for a client.

| Subcommand / Flag       | Description                                                        | Default |
| ----------------------- | ----------------------------------------------------------------- | ------- |
| `mcp` `--cwd <cwd>`     | Working directory                                                 | current |
| `mcp init --client <c>` | Client to configure: `claude`, `cursor`, `vscode`, `codex`, `opencode` | -       |

See [mcp.md](./mcp.md) for the MCP server details, the available tools, and per-client config paths.

### `skill` - Install the Create UI agent skill

```bash
npx @create-ui/cli skill
npx @create-ui/cli skill --client claude --project
```

Installs this skill into the agent's skills directory (personal home directory by default; `--project` installs into the project).

| Flag                | Short | Description                                                          | Default  |
| ------------------- | ----- | -------------------------------------------------------------------- | -------- |
| `--client <client>` |       | Agent to install for: `claude`, `gemini`, `codex`, `agents`          | `claude` |
| `--project`         |       | Install into the project instead of the home directory               | `false`  |
| `--path <path>`     | `-p`  | Install into an explicit skills directory (for other agents)         | -        |
| `--cwd <cwd>`       | `-c`  | Working directory                                                    | current  |
| `--force`           | `-f`  | Overwrite an existing skill installation                             | `false`  |
| `--yes`             | `-y`  | Skip the overwrite confirmation prompt                               | `false`  |

---

## Templates

The `init` `--template` option accepts:

| Value           | Framework             |
| --------------- | --------------------- |
| `next`          | Next.js               |
| `vite`          | Vite                  |
| `start`         | TanStack Start        |
| `next-monorepo` | Next.js (monorepo)    |

---

## Registry & namespaces

**`@createui` is the only registry.** It is built in - nothing to configure - and resolves item names to:

```
https://createui.co/r/{name}.json
```

So `add button` fetches `https://createui.co/r/button.json`. Items are always referenced by **bare name**; the `@createui` name itself is only used as the registry argument to `search` / `list`. Never prefix item names with it - `view @createui/button` resolves to the literal path `…/r/@createui/button.json` and 404s.

Never configure additional registries, add a `registries` field to `components.json`, or point the CLI at another registry host.
