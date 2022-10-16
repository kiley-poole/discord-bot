import { AbilityScore } from '../types/ability-scores'
import axios, { AxiosResponse } from 'axios'

export async function getAbilityScore (attr: string): Promise<AbilityScore> {
  const responseAPI: AxiosResponse = await axios.get(`https://www.dnd5eapi.co/api/ability-scores/${attr}`)
  return responseAPI.data
}
