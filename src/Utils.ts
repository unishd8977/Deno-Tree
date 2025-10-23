import type { FileMetadata } from '@app/Types.ts'

/**
 * Formats a directory structure into a tree representation.
 * @param name - Directory name
 * @param path - Directory path
 * @param depth - Current depth level
 * @param allFiles - All file metadata
 * @param showHidden - Whether to show hidden files
 * @returns Formatted tree string
 */
export function formatDirectory(
  name: string,
  path: string,
  depth: number,
  allFiles: FileMetadata[],
  showHidden = false
): string {
  const filesInThisDir = allFiles.filter((f) => f.path.startsWith(`${path}/`))
  const visibleFiles = filesInThisDir.filter((file) => {
    const relativePath = file.path.substring(path.length + 1)
    const pathParts = relativePath.split('/')
    return !pathParts.some((part) => part.startsWith('.')) || showHidden
  })
  const subdirs = new Map<string, FileMetadata[]>()
  const directFiles: FileMetadata[] = []
  for (const file of visibleFiles) {
    const relativePath = file.path.substring(path.length + 1)
    const pathParts = relativePath.split('/')
    if (pathParts.length === 1) {
      directFiles.push(file)
    } else {
      const subdirName = pathParts[0]
      if (subdirName) {
        if (!subdirs.has(subdirName)) {
          subdirs.set(subdirName, [])
        }
        const files = subdirs.get(subdirName)
        if (files) {
          files.push(file)
        }
      }
    }
  }
  const sortedDirectFiles = directFiles.sort((a, b) => a.name.localeCompare(b.name))
  const sortedSubdirs = Array.from(subdirs.entries()).sort(([a], [b]) => a.localeCompare(b))
  const allItems = [
    ...sortedSubdirs.map(([name, files]) => ({ type: 'dir' as const, name, data: files })),
    ...sortedDirectFiles.map((f) => ({ type: 'file' as const, name: f.name, data: f }))
  ]
  const isRoot = depth === 0
  const indent = isRoot ? '' : '│   '.repeat(depth - 1)
  const prefix = isRoot ? '.' : `${indent}├── ${name}`
  let result = prefix
  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i]
    if (!item) {
      continue
    }
    const isLast = i === allItems.length - 1
    if (item.type === 'file') {
      result += `\n${formatNode(item.data as FileMetadata, depth + 1, isLast)}`
    } else {
      result += `\n${
        formatDirectory(
          item.name,
          `${path}/${item.name}`,
          depth + 1,
          allFiles,
          showHidden
        )
      }`
    }
  }
  return result
}

/**
 * Formats a single file node in the tree structure.
 * @param node - File metadata
 * @param depth - Current depth level
 * @param isLast - Whether this is the last item in the directory
 * @returns Formatted node string
 */
export function formatNode(node: FileMetadata, depth: number, isLast = false): string {
  const indent = '│   '.repeat(depth - 1)
  const connector = isLast ? '└── ' : '├── '
  return `${indent}${connector}${node.name}`
}
