import type { FileMetadata, TreeNode } from '@app/Types.ts'
import { formatDirectory } from '@app/Utils.ts'

/**
 * Tree output generator for different formats.
 * @description Handles generation of trees in various output formats.
 */
export class Generator {
  /**
   * Generates JSON format output.
   * @param rootPath - Root directory path
   * @param files - Map of scanned files
   * @returns JSON string
   */
  async generateJsonFormat(rootPath: string, files: Map<string, FileMetadata>): Promise<string> {
    try {
      const treeNode = await this.buildTreeNode(rootPath, files)
      return JSON.stringify(treeNode, null, 2)
    } catch {
      return '{}'
    }
  }

  /**
   * Generates Markdown format output.
   * @param rootPath - Root directory path
   * @param files - Map of scanned files
   * @returns Markdown string
   */
  async generateMarkdownFormat(
    rootPath: string,
    files: Map<string, FileMetadata>
  ): Promise<string> {
    try {
      const treeNode = await this.buildTreeNode(rootPath, files)
      return this.treeToMarkdown(treeNode)
    } catch {
      return ''
    }
  }

  /**
   * Generates tree format output (original ASCII tree).
   * @param rootPath - Root directory path
   * @param files - Map of scanned files
   * @param showHidden - Whether to show hidden files
   * @returns ASCII tree string
   */
  async generateTreeFormat(
    rootPath: string,
    files: Map<string, FileMetadata>,
    showHidden: boolean
  ): Promise<string> {
    try {
      const allFiles = Array.from(files.values())
      const absoluteRootPath = await Deno.realPath(rootPath)
      const rootFiles = allFiles.filter(f => f.path.startsWith(`${absoluteRootPath}/`))
      if (rootFiles.length === 0) {
        return ''
      }
      const rootName = rootPath.split('/').pop() || rootPath
      return formatDirectory(rootName, absoluteRootPath, 0, allFiles, showHidden)
    } catch {
      return ''
    }
  }

  /**
   * Builds node structure recursively.
   * @param name - Node name
   * @param path - Node path
   * @param files - All files in the tree
   * @returns TreeNode structure
   */
  private buildNodeStructure(name: string, path: string, files: FileMetadata[]): TreeNode {
    const node: TreeNode = {
      name,
      type: 'directory',
      path,
      children: []
    }
    const children = files.filter(f => f.parent === path)
    const subdirs = new Set<string>()
    for (const file of children) {
      if (file.type === 'file') {
        const fileNode: TreeNode = {
          name: file.name,
          type: 'file',
          path: file.path
        }
        if (file.size !== undefined) {
          fileNode.size = file.size
        }
        if (file.modified !== undefined) {
          fileNode.modified = file.modified
        }
        if (file.extension !== undefined) {
          fileNode.extension = file.extension
        }
        if (node.children) {
          node.children.push(fileNode)
        }
      } else if (file.type === 'directory') {
        subdirs.add(file.path)
      }
    }
    for (const subdirPath of subdirs) {
      const subdirName = subdirPath.split('/').pop() || ''
      const subdirFiles = files.filter(f => f.path.startsWith(`${subdirPath}/`))
      const subdirNode = this.buildNodeStructure(subdirName, subdirPath, subdirFiles)
      if (node.children) {
        node.children.push(subdirNode)
      }
    }
    return node
  }

  /**
   * Builds a TreeNode structure from scanned files.
   * @param rootPath - Root directory path
   * @param files - Map of scanned files
   * @returns TreeNode structure
   */
  private async buildTreeNode(
    rootPath: string,
    files: Map<string, FileMetadata>
  ): Promise<TreeNode> {
    const allFiles = Array.from(files.values())
    const absoluteRootPath = await Deno.realPath(rootPath)
    const rootFiles = allFiles.filter(f => f.path.startsWith(`${absoluteRootPath}/`))
    const rootName = rootPath.split('/').pop() || rootPath
    return this.buildNodeStructure(rootName, absoluteRootPath, rootFiles)
  }

  /**
   * Converts TreeNode to Markdown format.
   * @param node - TreeNode to convert
   * @param depth - Current depth level
   * @returns Markdown string
   */
  private treeToMarkdown(node: TreeNode, depth = 0): string {
    const indent = '  '.repeat(depth)
    const prefix = depth === 0 ? '' : '- '
    let result = `${indent}${prefix}${node.name}/\n`
    if (node.children) {
      for (const child of node.children) {
        if (child.type === 'directory') {
          result += this.treeToMarkdown(child, depth + 1)
        } else {
          const childIndent = '  '.repeat(depth + 1)
          result += `${childIndent}- ${child.name}\n`
        }
      }
    }
    return result
  }
}
