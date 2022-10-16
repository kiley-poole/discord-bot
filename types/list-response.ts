import { APIReference } from './api-reference'

export interface ResourceList {
  count: number
  results: APIReference[]
}

export function isResourceList (list: any): list is ResourceList {
  return (list as ResourceList).results !== undefined
}
