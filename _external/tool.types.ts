import { z } from 'zod'

export const ToolAnnotationsSchema = z
  .object({
    /**
     * A human-readable title for the tool.
     */
    title: z.optional(z.string()),

    /**
     * If true, the tool does not modify its environment.
     *
     * Default: false
     */
    readOnlyHint: z.optional(z.boolean()),

    /**
     * If true, the tool may perform destructive updates to its environment.
     * If false, the tool performs only additive updates.
     *
     * (This property is meaningful only when `readOnlyHint == false`)
     *
     * Default: true
     */
    destructiveHint: z.optional(z.boolean()),

    /**
     * If true, calling the tool repeatedly with the same arguments
     * will have no additional effect on the its environment.
     *
     * (This property is meaningful only when `readOnlyHint == false`)
     *
     * Default: false
     */
    idempotentHint: z.optional(z.boolean()),

    /**
     * If true, this tool may interact with an "open world" of external
     * entities. If false, the tool's domain of interaction is closed.
     * For example, the world of a web search tool is open, whereas that
     * of a memory tool is not.
     *
     * Default: true
     */
    openWorldHint: z.optional(z.boolean()),
  })
  .passthrough()

export const ToolSchema = z
  .object({
    /**
     * The name of the tool.
     */
    name: z.string(),
    /**
     * A human-readable description of the tool.
     */
    description: z.optional(z.string()),
    /**
     * A JSON Schema object defining the expected parameters for the tool.
     */
    inputSchema: z
      .object({
        type: z.literal('object'),
        properties: z.optional(z.object({}).passthrough()),
        required: z.optional(z.array(z.string())),
      })
      .passthrough(),
    /**
     * An optional JSON Schema object defining the structure of the tool's output returned in
     * the structuredContent field of a CallToolResult.
     */
    outputSchema: z.optional(
      z
        .object({
          type: z.literal('object'),
          properties: z.optional(z.object({}).passthrough()),
          required: z.optional(z.array(z.string())),
        })
        .passthrough()
    ),
    /**
     * Optional additional tool information.
     */
    annotations: z.optional(ToolAnnotationsSchema),
  })
  .passthrough()
