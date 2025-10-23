/**
 * File metadata information.
 */
export interface FileMetadata {
  /** File or directory name */
  name: string
  /** Absolute file path */
  path: string
  /** Type of the item */
  type: 'file' | 'directory'
  /** Parent directory path */
  parent?: string
  /** File size in bytes */
  size?: number
  /** Last modification date */
  modified?: Date
  /** File extension */
  extension?: string
}

/**
 * Output format options for tree generation.
 */
export type GenerateFormat = 'tree' | 'json' | 'markdown'

/**
 * Options for tree generation output.
 */
export interface GenerateOptions {
  /** Output format for the tree */
  format?: GenerateFormat
  /** Whether to include file statistics */
  includeStats?: boolean
}

/**
 * Tree generation options.
 */
export interface TreeOptions {
  /** Directories to ignore during scanning */
  ignoreDirs?: string[]
  /** Maximum number of files to process */
  maxFiles?: number
  /** Whether to show hidden files and directories */
  showHidden?: boolean
  /** Maximum directory depth to scan */
  maxDepth?: number
}

/**
 * Tree node structure for structured output formats.
 */
export interface TreeNode {
  /** Node name */
  name: string
  /** Node type */
  type: 'file' | 'directory'
  /** Absolute path */
  path: string
  /** File size in bytes */
  size?: number
  /** Last modification date */
  modified?: Date
  /** File extension */
  extension?: string
  /** Child nodes */
  children?: TreeNode[]
}
