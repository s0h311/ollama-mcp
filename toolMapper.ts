import { z } from 'zod'
import { ToolSchema, ToolAnnotationsSchema } from './tool.types'

interface GoToolFunction {
  name: string
  description: string
  parameters: {
    type: string
    $defs?: Record<string, unknown>
    items?: Record<string, unknown>
    required: string[]
    properties: {
      [key: string]: {
        type: string | string[]
        items?: Record<string, unknown>
        description: string
        enum?: unknown[]
      }
    }
  }
}

interface GoTool {
  type: string
  items?: Record<string, unknown>
  function: GoToolFunction
  // Add annotations as metadata
  metadata?: {
    title?: string
    readOnly?: boolean
    destructive?: boolean
    idempotent?: boolean
    openWorld?: boolean
  }
}

interface SchemaProperty {
  type: string | string[]
  description?: string
  enum?: unknown[]
  items?: Record<string, unknown>
}

export function mapToGoTool(tsTool: z.infer<typeof ToolSchema>): GoTool {
  const goTool: GoTool = {
    type: 'function',
    function: {
      name: tsTool.name,
      description: tsTool.description || '',
      parameters: {
        type: 'object',
        required: tsTool.inputSchema.required || [],
        properties: {},
      },
    },
  }

  // Map input schema properties
  if (tsTool.inputSchema.properties) {
    for (const [key, value] of Object.entries(tsTool.inputSchema.properties)) {
      const property = value as SchemaProperty
      goTool.function.parameters.properties[key] = {
        type: property.type,
        description: property.description || '',
        ...(property.enum && { enum: property.enum }),
        ...(property.items && { items: property.items }),
      }
    }
  }

  // Map annotations to metadata
  if (tsTool.annotations) {
    goTool.metadata = {
      ...(tsTool.annotations.title && { title: tsTool.annotations.title }),
      ...(tsTool.annotations.readOnlyHint !== undefined && { readOnly: tsTool.annotations.readOnlyHint }),
      ...(tsTool.annotations.destructiveHint !== undefined && { destructive: tsTool.annotations.destructiveHint }),
      ...(tsTool.annotations.idempotentHint !== undefined && { idempotent: tsTool.annotations.idempotentHint }),
      ...(tsTool.annotations.openWorldHint !== undefined && { openWorld: tsTool.annotations.openWorldHint }),
    }
  }

  // Map output schema if present
  if (tsTool.outputSchema) {
    goTool.function.parameters.$defs = {
      output: {
        type: 'object',
        properties: tsTool.outputSchema.properties || {},
        required: tsTool.outputSchema.required || [],
      },
    }
  }

  return goTool
}

export function mapToTsTool(goTool: GoTool): z.infer<typeof ToolSchema> {
  const tsTool: z.infer<typeof ToolSchema> = {
    name: goTool.function.name,
    description: goTool.function.description,
    inputSchema: {
      type: 'object',
      properties: {},
      required: goTool.function.parameters.required,
    },
  }

  // Map parameters to input schema
  for (const [key, value] of Object.entries(goTool.function.parameters.properties)) {
    if (!tsTool.inputSchema.properties) {
      tsTool.inputSchema.properties = {}
    }
    tsTool.inputSchema.properties[key] = {
      type: value.type,
      description: value.description,
      ...(value.enum && { enum: value.enum }),
      ...(value.items && { items: value.items }),
    }
  }

  // Map metadata to annotations
  if (goTool.metadata) {
    tsTool.annotations = {
      ...(goTool.metadata.title && { title: goTool.metadata.title }),
      ...(goTool.metadata.readOnly !== undefined && { readOnlyHint: goTool.metadata.readOnly }),
      ...(goTool.metadata.destructive !== undefined && { destructiveHint: goTool.metadata.destructive }),
      ...(goTool.metadata.idempotent !== undefined && { idempotentHint: goTool.metadata.idempotent }),
      ...(goTool.metadata.openWorld !== undefined && { openWorldHint: goTool.metadata.openWorld }),
    }
  }

  // Map output schema if present
  if (goTool.function.parameters.$defs?.output) {
    const outputDef = goTool.function.parameters.$defs.output as {
      type: string
      properties: Record<string, unknown>
      required: string[]
    }
    tsTool.outputSchema = {
      type: 'object',
      properties: outputDef.properties,
      required: outputDef.required,
    }
  }

  return tsTool
}
