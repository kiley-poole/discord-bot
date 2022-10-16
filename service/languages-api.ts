import axios, { AxiosResponse } from 'axios'
import { Language } from '../types/languages'

export async function getLanguage (attr: string): Promise<Language> {
  const responseAPI: AxiosResponse = await axios.get(`https://www.dnd5eapi.co/api/languages/${attr}`)
  return responseAPI.data
}
