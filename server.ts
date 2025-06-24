import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { DirectServerTransport } from './DirectTransport'

export const server = new McpServer({
  name: 'server',
  version: '0.0.1',
})

server.tool(
  'tool-name',
  'Tool description',
  {
    // TODO parameters, use zod
  },
  async ({}) => {
  const text = ''
    
    return {
      content: [
        {
          type: 'text',
          text,
        },
      ],
    }
  }
)

const transport = new DirectServerTransport()
await server.connect(transport)
