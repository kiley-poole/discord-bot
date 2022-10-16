import axios, { AxiosResponse } from 'axios'
import { Alignment } from '../types/alignments'

export async function getAlignment (attr: string): Promise<Alignment> {
  const responseAPI: AxiosResponse = await axios.get(`https://www.dnd5eapi.co/api/alignments/${attr}`)
  return responseAPI.data
}
