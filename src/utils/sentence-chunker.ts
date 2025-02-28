/**
 * Utility to split text into chunks that fit within Discord's message size limits
 */

// Discord's message character limit with some safety margin
const MAX_MESSAGE_LENGTH = 1750

/**
 * Split text into chunks by sentence boundaries to avoid cutting messages in the middle of sentences
 * @param text - The text to split into chunks
 * @param maxLength - Maximum length of each chunk (defaults to Discord message limit)
 * @returns Array of text chunks
 */
export function splitBySentence(text: string, maxLength = MAX_MESSAGE_LENGTH): string[] {
  if (!text) {
    return []
  }

  const chunks: string[] = []
  let startIndex = 0

  while (startIndex < text.length) {
    // Calculate potential end index based on max length
    let endIndex = Math.min(startIndex + maxLength, text.length)
    
    // If we're at the end of the text, just add the remainder
    if (endIndex >= text.length) {
      chunks.push(text.slice(startIndex))
      break
    }
    
    // Look for sentence-ending punctuation
    const sentenceEndPunctuation = ['.', '!', '?']
    
    // Search backward from the max length to find a sentence ending
    while (endIndex > startIndex && !sentenceEndPunctuation.includes(text[endIndex])) {
      endIndex--
    }
    
    // If we couldn't find a sentence end, try finding a space or other delimiter
    if (endIndex === startIndex) {
      endIndex = Math.min(startIndex + maxLength, text.length)
      
      // Look for space or other delimiters if we can't find sentence endings
      while (endIndex > startIndex && text[endIndex] !== ' ' && text[endIndex] !== '\n') {
        endIndex--
      }
      
      // If we still can't find a good break point, just use the max length
      if (endIndex === startIndex) {
        endIndex = Math.min(startIndex + maxLength, text.length)
      }
    }
    
    // Add the current chunk to our result
    chunks.push(text.slice(startIndex, endIndex + 1).trim())
    
    // Move to next chunk
    startIndex = endIndex + 1
  }

  // Filter out any empty chunks
  return chunks.filter(chunk => chunk.length > 0)
}