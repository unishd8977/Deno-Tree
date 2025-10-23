# Deno Tree [![Deno](https://img.shields.io/badge/Deno-2.5.4-blue)](https://deno.land) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A file tree generator for Deno. Generate beautiful directory trees instantly from a single scan.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
  - [Multiple Output Formats](#multiple-output-formats)
- [Configuration](#configuration)
  - [Tree Options](#tree-options)
  - [Performance Settings](#performance-settings)
- [Basic Usage](#basic-usage)
  - [Simple Tree Generation](#simple-tree-generation)
  - [Multiple Tree Generation](#multiple-tree-generation)
  - [Promise Chain Style](#promise-chain-style)
  - [File Management](#file-management)
  - [Project Switching](#project-switching)
- [API Reference](#api-reference)
  - [Main API](#main-api)
  - [Configuration Options](#configuration-options)
  - [Generate Options](#generate-options)
  - [File Metadata](#file-metadata)
  - [Tree Node Structure](#tree-node-structure)
- [Troubleshooting](#troubleshooting)
  - [Common Issues](#common-issues)
  - [Debug Mode](#debug-mode)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
deno add jsr:@neabyte/deno-tree
```

## Quick Start

```ts
import tree from '@neabyte/deno-tree'

// Initialize with a directory
await tree.init('/path/to/directory', {
  ignoreDirs: ['node_modules', '.git', 'dist'],
  maxFiles: 1000,
  showHidden: false,
  maxDepth: 3
})

// Generate tree for the entire directory
const result = await tree.generate('/path/to/directory')
console.log(result)
```

**Example Output:**

```
.
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Modal.tsx
│   ├── utils/
│   │   └── helpers.ts
│   └── index.ts
├── tests/
│   └── components.test.ts
├── deno.json
└── README.md
```

### Multiple Output Formats

```ts
import tree from '@neabyte/deno-tree'

await tree.init('/path/to/directory', {
  ignoreDirs: ['node_modules', '.git', 'dist'],
  maxFiles: 1000,
  showHidden: false,
  maxDepth: 3
})

// Tree format (default)
const treeOutput = await tree.generate('/path/to/directory')
console.log(treeOutput)

// JSON format
const jsonOutput = await tree.generate('/path/to/directory', { format: 'json' })
console.log(jsonOutput)

// Markdown format
const markdownOutput = await tree.generate('/path/to/directory', { format: 'markdown' })
console.log(markdownOutput)
```

**Format Examples:**

**Tree Format:**

```
.
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Modal.tsx
│   └── index.ts
├── deno.json
└── README.md
```

**JSON Format:**

```json
{
  "name": "project",
  "type": "directory",
  "path": "/path/to/project",
  "children": [
    {
      "name": "src",
      "type": "directory",
      "path": "/path/to/project/src",
      "children": [
        {
          "name": "Button.tsx",
          "type": "file",
          "path": "/path/to/project/src/Button.tsx",
          "size": 1024,
          "extension": "tsx"
        }
      ]
    }
  ]
}
```

**Markdown Format:**

```
project/
  - src/
    - Button.tsx
    - Modal.tsx
    - index.ts
  - deno.json
  - README.md
```

## Configuration

### Tree Options

```ts
interface TreeOptions {
  ignoreDirs?: string[] // Directories to ignore (default: [])
  maxFiles?: number // Maximum files to process (default: unlimited)
  showHidden?: boolean // Show hidden files/directories (default: false)
  maxDepth?: number // Maximum directory depth (default: unlimited)
}
```

### Generate Options

```ts
interface GenerateOptions {
  format?: 'tree' | 'json' | 'markdown' // Output format (default: 'tree')
  includeStats?: boolean // Include file statistics (default: false)
}
```

### Performance Settings

```ts
// For large directories - limit files and depth
{
  maxFiles: 5000,
  maxDepth: 4,
  ignoreDirs: ['node_modules', '.git', 'dist', 'build', 'coverage']
}

// For quick overview - shallow scan
{
  maxFiles: 100,
  maxDepth: 2,
  showHidden: false
}

// For complete scan - no limits
{
  showHidden: true
  // No maxFiles or maxDepth limits
}
```

## Basic Usage

### Simple Tree Generation

```ts
import tree from '@neabyte/deno-tree'

// Basic tree generation
await tree.init('/path/to/project')
const result = await tree.generate('/path/to/project')
console.log(result)
```

### Multiple Tree Generation

```ts
import tree from '@neabyte/deno-tree'

// Scan parent directory once
await tree.init('/workspace', {
  ignoreDirs: ['node_modules', '.git', 'dist'],
  maxFiles: 2000,
  showHidden: false,
  maxDepth: 2
})

// Generate trees for multiple projects
const projectA = await tree.generate('/workspace/project-a')
const projectB = await tree.generate('/workspace/project-b')
const projectC = await tree.generate('/workspace/project-c')

// Log the trees
console.log('Project A Tree:', projectA)
console.log('Project B Tree:', projectB)
console.log('Project C Tree:', projectC)
```

### Promise Chain Style

```ts
import tree from '@neabyte/deno-tree'

tree
  .init('/path/to/project', {
    ignoreDirs: ['node_modules', '.git'],
    maxFiles: 500,
    showHidden: false,
    maxDepth: 2
  })
  .then(async () => {
    const result = await tree.generate('/path/to/project')
    console.log(result)
  })
  .catch((error) => {
    console.error(error)
  })
```

### File Management

```ts
import tree from '@neabyte/deno-tree'

// Add individual files to the tree
await tree.set('/path/to/file.txt')
await tree.set('/path/to/another-file.js')

// Remove files when they're deleted
await tree.remove('/path/to/deleted-file.txt')
await tree.remove('/path/to/deleted-directory')

// Clear all files and reset state
tree.clear()

// Generate tree with updated metadata
const result = await tree.generate('/path/to/directory')
console.log(result)
```

### Project Switching

```ts
import tree from '@neabyte/deno-tree'

// Work with multiple projects
await tree.init('/workspace/project-a', { maxFiles: 1000 })
const treeA = await tree.generate('/workspace/project-a')
console.log('Project A:', treeA)

// Clear and switch to different project
tree.clear()
await tree.init('/workspace/project-b', { maxFiles: 2000 })
const treeB = await tree.generate('/workspace/project-b')
console.log('Project B:', treeB)
```

## API Reference

### Main API

| Method       | Description                            | Parameters                                    | Returns           |
| ------------ | -------------------------------------- | --------------------------------------------- | ----------------- |
| `clear()`    | Clear all stored file metadata         | None                                          | `void`            |
| `generate()` | Generate formatted tree string         | `rootPath: string, options?: GenerateOptions` | `Promise<string>` |
| `init()`     | Scan directory and store file metadata | `path: string, options?: TreeOptions`         | `Promise<void>`   |
| `remove()`   | Remove file/directory from tree        | `path: string`                                | `Promise<void>`   |
| `set()`      | Add single file to tree metadata       | `path: string`                                | `Promise<void>`   |

### Configuration Options

| Property     | Type     | Required | Description                   | Example                    |
| ------------ | -------- | -------- | ----------------------------- | -------------------------- |
| `ignoreDirs` | string[] | ❌       | Directories to ignore         | `['node_modules', '.git']` |
| `maxFiles`   | number   | ❌       | Maximum files to process      | `1000`                     |
| `showHidden` | boolean  | ❌       | Show hidden files/directories | `false`                    |
| `maxDepth`   | number   | ❌       | Maximum directory depth       | `3`                        |

### Generate Options

| Property       | Type    | Required | Description             | Example                |
| -------------- | ------- | -------- | ----------------------- | ---------------------- |
| `format`       | string  | ❌       | Output format           | `'json'`, `'markdown'` |
| `includeStats` | boolean | ❌       | Include file statistics | `true`                 |

### File Metadata

```ts
interface FileMetadata {
  name: string // File name
  path: string // Full file path
  type: 'file' | 'directory' // File type
  parent?: string // Parent directory path
  size?: number // File size in bytes
  modified?: Date // Last modified date
  extension?: string // File extension
}
```

### Tree Node Structure

```ts
interface TreeNode {
  name: string // Node name
  type: 'file' | 'directory' // Node type
  path: string // Absolute path
  size?: number // File size in bytes
  modified?: Date // Last modification date
  extension?: string // File extension
  children?: TreeNode[] // Child nodes
}
```

## Troubleshooting

### Common Issues

**Empty Tree Output**

- Verify the path exists and is accessible
- Check if `maxFiles` limit was reached before scanning the target directory
- Ensure `maxDepth` allows reaching the target directory

**Memory Issues**

- Reduce `maxFiles` limit for large directories
- Use `maxDepth` to limit scanning depth
- Add more directories to `ignoreDirs`

**Slow Performance**

- Increase `maxFiles` limit if hitting the cap too early
- Reduce `maxDepth` for shallow scans
- Add common build directories to `ignoreDirs`

### Debug Mode

```ts
import tree from '@neabyte/deno-tree'

// Debug file storage and generation
await tree.init('/path/to/project', { maxFiles: 100 })

// Debug specific path generation
const result = await tree.generate('/path/to/project/src')
console.log('Generated tree length:', result.length)
console.log('Tree output:', result)

// Debug JSON format
const jsonResult = await tree.generate('/path/to/project', { format: 'json' })
console.log('JSON output length:', jsonResult.length)

// Debug markdown format
const markdownResult = await tree.generate('/path/to/project', { format: 'markdown' })
console.log('Markdown output length:', markdownResult.length)
```

## Contributing

Contributions are welcome! Please feel free to submit a [Pull Request](https://github.com/NeaByteLab/Deno-Tree/pulls).

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
