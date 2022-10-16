import { APIReference } from './api-reference'

export interface Language extends APIReference {
  type: string
  typical_speakers: string[]
}
