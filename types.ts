export type Message = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
}

export type ToolCall = {
  function: {
    name: string
    arguments: object
  }
}

export type Writer = (content: string) => void
