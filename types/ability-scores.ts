import { APIReference } from './api-reference'

export interface AbilityScore extends APIReference {
  full_name: string
  desc: string[]
  skills: APIReference[]
}
