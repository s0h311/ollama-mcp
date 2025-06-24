import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js'
import { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js'

let clientTransport: DirectClientTransport | null = null
let serverTransport: DirectServerTransport | null = null

export class DirectClientTransport implements Transport {
  public onclose?: () => void
  public onerror?: (error: Error) => void
  public onmessage?: (message: JSONRPCMessage) => void

  public async start(): Promise<void> {
    clientTransport = this
  }

  public async send(message: JSONRPCMessage): Promise<void> {
    serverTransport?.onmessage?.(message)
  }

  public async close(): Promise<void> {
    clientTransport = null
  }
}

export class DirectServerTransport implements Transport {
  public onclose?: () => void
  public onerror?: (error: Error) => void
  public onmessage?: (message: JSONRPCMessage) => void

  public async start(): Promise<void> {
    serverTransport = this
  }

  public async send(message: JSONRPCMessage): Promise<void> {
    clientTransport?.onmessage?.(message)
  }

  public async close(): Promise<void> {
    serverTransport = null
  }
}
