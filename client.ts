import { DirectClientTransport } from './DirectTransport'
import { Client as McpClient } from '@modelcontextprotocol/sdk/client/index.js'
import { Message, Writer, ToolCall } from './types'
import { mapToGoTool } from './toolMapper'
import { Maybe } from './utils/maybe'
import { justLog } from './utils/log'

const transport = new DirectClientTransport()

const client = new McpClient({
  name: 'client',
  version: '0.0.1',
})

await client.connect(transport)

const { tools } = await client.listTools()
const mappedTools = tools.map(mapToGoTool)

const OLLAMA_CHAT_URI = process.env.OLLAMA_CHAT_URI!

const messages: Message[] = [
  {
    role: 'system',
    content: `TODO system propmt`,
  },
]

export async function chat(userPrompt: string, writer: Writer): Promise<void> {
  messages.push({
    role: 'user',
    content: userPrompt,
  })

  const options = {
    // model: 'qwen3:8b',
    model: 'llama3.2',
    // model: 'gemma3',
    // model: 'mistral-small3.1',
    messages,
    tools: mappedTools,
    think: false,
    stream: false,
  }

  let isDone = false

  while (!isDone) {
    const rawResponse = await fetch(OLLAMA_CHAT_URI, {
      method: 'POST',
      body: JSON.stringify(options),
    })

    const response = await rawResponse.json()

    justLog('response', response)

    isDone = response.done

    const responseMessageContent: string = response.message?.content

    const contentWithoutThinkBlock = clearThinkingBlock(responseMessageContent)

    writer(contentWithoutThinkBlock)

    /**
    messages.push({
      role: 'assistant',
      content: responseMessageContent,
    })
    */

    let toolCallRequests: ToolCall[] = []

    if (!('tool_calls' in response.message)) {
      continue
    }

    toolCallRequests = response.message.tool_calls

    const { data, error } = await processToolCalls(toolCallRequests)

    if (error) {
      continue
    }

    isDone = false
    messages.push(data)
  }

  justLog('DONE', 'DONE')
}

function clearThinkingBlock(content: string): string {
  const thinkBlockRegex = /<think>(.*|\n|\r)*<\/think>/

  return content.replace(thinkBlockRegex, '')
}

async function processToolCalls(toolCallRequests: ToolCall[]): Promise<Maybe<Message>> {
  const toolCallReponses = []

  try {
    for (const toolCallRequest of toolCallRequests) {
      const toolCallResponse = await client.callTool(
        // TODO type this correctly
        toolCallRequest.function as Parameters<typeof client.callTool>[0]
      )

      toolCallReponses.push(toolCallResponse)
    }
  } catch (toolCallError) {
    messages.push({
      role: 'tool',
      content: `The following error has occurred: ${JSON.stringify(toolCallError)}`,
    })

    return {
      data: null,
      // TODO type this correctly
      error: toolCallError as Error,
    }
  }

  return {
    data: {
      role: 'tool',
      content: JSON.stringify(toolCallReponses),
    },
    error: null,
  }
}
