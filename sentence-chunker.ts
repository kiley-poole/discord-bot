const MAX_MESSAGE_LENGTH = 2000 // Discord's message character limit

export function splitBySentence (text: any, maxLength = MAX_MESSAGE_LENGTH): any {
  const chunks = []
  let startIndex = 0

  while (startIndex < text.length) {
    let endIndex = startIndex + maxLength
    if (endIndex >= text.length) {
      // If we're at the end of the text, just add the remainder to the chunks
      chunks.push(text.slice(startIndex))
      break
    }

    // Look for the last sentence-ending punctuation before the maxLength
    while (endIndex > startIndex && !['.', '!', '?'].includes(text[endIndex])) {
      endIndex--
    }

    // If we couldn't find a sentence end, this chunk just goes up to the last sentence before maxLength
    if (endIndex === startIndex) {
      endIndex = startIndex + maxLength
      while (endIndex > startIndex && !['.', '!', '?'].includes(text[endIndex])) {
        endIndex--
      }
    }

    chunks.push(text.slice(startIndex, endIndex + 1)) // +1 to include the punctuation
    startIndex = endIndex + 1 // Move past the punctuation for the next chunk
  }

  return chunks
}
