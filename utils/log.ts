import { inspect } from 'util'

export function justLog(description: string, content: any): void {
  console.dir(description, { colors: true })
  console.dir(content, { depth: Infinity, colors: true })
  console.log('\n\n')
}
