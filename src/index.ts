import type { FileMetadata, GenerateOptions, TreeOptions } from '@app/Types.ts'
import { Generator } from '@app/Generator.ts'

/**
 * File tree generator and manager.
 * @description Handles file system scanning, metadata collection, and tree generation.
 */
class Tree {
  /** Generator instance for output formatting */
  private generator = new Generator()
  /** Internal file metadata storage */
  private files = new Map<string, FileMetadata>()
  /** Tree generation options */
  private options: TreeOptions = {}
  /** Current file count */
  private fileCount = 0

  /**
   * Clears all stored file metadata and resets counters.
   */
  clear(): void {
    this.files.clear()
    this.fileCount = 0
    this.options = {}
  }

  /**
   * Generates a formatted tree string from scanned files.
   * @param rootPath - Root directory path
   * @param options - Generation options including output format
   * @returns Formatted tree string in specified format
   */
  async generate(rootPath: string, options: GenerateOptions = {}): Promise<string> {
    const format = options.format || 'tree'
    switch (format) {
      case 'tree':
        return await this.generator.generateTreeFormat(
          rootPath,
          this.files,
          this.options.showHidden || false
        )
      case 'json':
        return await this.generator.generateJsonFormat(rootPath, this.files)
      case 'markdown':
        return await this.generator.generateMarkdownFormat(rootPath, this.files)
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  /**
   * Initializes the tree by scanning the specified path.
   * @param path - Path to scan
   * @param options - Tree generation options
   */
  async init(path: string, options: TreeOptions = {}): Promise<void> {
    this.options = options
    this.fileCount = 0
    if (this.options.maxFiles === 0) {
      return
    }
    try {
      const stat = await Deno.stat(path)
      if (stat.isDirectory) {
        await this.scanDirectory(path, 0)
      } else if (stat.isFile) {
        if (!this.options.maxFiles || this.fileCount < this.options.maxFiles) {
          await this.set(path)
        }
      }
    } catch {
      // Path might not exist or be inaccessible
    }
  }

  /**
   * Removes a file or directory from the tree.
   * @param path - Path to remove
   */
  async remove(path: string): Promise<void> {
    try {
      const absolutePath = await Deno.realPath(path)
      this.files.delete(absolutePath)
      for (const [filePath] of this.files) {
        if (filePath.startsWith(`${absolutePath}/`)) {
          this.files.delete(filePath)
        }
      }
    } catch {
      this.files.delete(path)
      for (const [filePath] of this.files) {
        if (filePath.startsWith(`${path}/`)) {
          this.files.delete(filePath)
        }
      }
    }
  }

  /**
   * Adds a file to the tree metadata.
   * @param path - File path to add
   */
  async set(path: string): Promise<void> {
    try {
      const stat = await Deno.stat(path)
      if (stat.isFile) {
        const absolutePath = await Deno.realPath(path)
        const metadata: FileMetadata = {
          name: absolutePath.split('/').pop() || '',
          path: absolutePath,
          type: 'file',
          parent: absolutePath.split('/').slice(0, -1).join('/') || undefined,
          size: stat.size,
          modified: stat.mtime || undefined,
          extension: absolutePath.split('.').pop() || undefined
        } as FileMetadata
        this.files.set(absolutePath, metadata)
        this.fileCount++
      }
    } catch {
      // File might be deleted
    }
  }

  /**
   * Recursively scans a directory for files and subdirectories.
   * @param dirPath - Directory path to scan
   * @param depth - Current scanning depth
   */
  private async scanDirectory(dirPath: string, depth: number): Promise<void> {
    if (this.options.maxDepth && depth >= this.options.maxDepth) {
      return
    }
    const dirName = dirPath.split('/').pop() || ''
    if (this.options.ignoreDirs?.includes(dirName)) {
      return
    }
    if (this.options.maxFiles && this.fileCount >= this.options.maxFiles) {
      return
    }
    try {
      for await (const entry of Deno.readDir(dirPath)) {
        if (this.options.maxFiles && this.fileCount >= this.options.maxFiles) {
          return
        }
        const fullPath = `${dirPath}/${entry.name}`
        if (!this.options.showHidden && entry.name.startsWith('.')) {
          continue
        }
        if (entry.isDirectory) {
          await this.scanDirectory(fullPath, depth + 1)
        } else if (entry.isFile) {
          await this.set(fullPath)
        }
      }
    } catch {
      // Directory might be inaccessible
    }
  }
}

/**
 * Default tree instance.
 * @description Singleton instance of the Tree class for global use.
 */
const tree: Tree = new Tree()
export default tree

/**
 * Exports all types and interfaces.
 * @description Re-exports all types from the Types module.
 */
export * from '@app/Types.ts'
