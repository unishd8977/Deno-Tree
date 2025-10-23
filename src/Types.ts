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
