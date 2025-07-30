---
title: "Get to Know MCP"
date: 2025-07-10T10:05:57-06:00
draft: false
---

Anthropic originally created the Model Context Protocol (MCP) to add context to Claude Desktop. MCP's problem statement was to solve copying pasting between your MCP Host (e.g. Claude Desktop) and a disparate data sources and tools. MCP was open sourced on November 2024.

{{< toc >}}

## Architecture

At its core, MCP follows a client-server architecture where a host application can connect to multiple servers:

![MCP Client-Server Architecture](/images/mcp-client-server-architecture.png)

## Concepts

MCP follows a client-server architecture where:

- **Hosts** are LLM applications (like Claude Desktop or IDEs) that initiate connections
- **Clients** maintain 1:1 connections with servers, inside the host application
- **Servers** provide context, tools, and prompts to clients

*Source: [Core architecture - Model Context Protocol](https://modelcontextprotocol.io/docs/concepts/architecture)*

MCP Hosts seems to be a loaded term. Here's some additional info from Gemini about what it is:

> From Gemini: In the context of MCP, the host is the AI-powered application that users interact with directly. Examples include AI assistants like Claude Desktop, IDEs like Cursor, or other AI-powered tools. It's the central point where the user interacts with the AI and where the MCP clients are managed.

## Connection Lifecycle

### Initialization

![MCP Initialization](/images/mcp-initialization.png)

1. Client sends initialize request with protocol version and capabilities
2. Server responds with its protocol version and capabilities
3. Client sends initialized notification as acknowledgment
4. Normal message exchange begins

### Message Exchange

- **Request-Response**: Client or server sends requests, the other responds
- **Notifications**: Either party sends one-way messages

### Termination

Either party can terminate the connection:

- Clean shutdown via `close()`
- Transport disconnection
- Error conditions

## Servers

## Tools

Tools are a powerful primitive in the Model Context Protocol (MCP) that enable servers to expose executable functionality to clients. Through tools, LLMs can interact with external systems, perform computations, and take actions in the real world.

*Source: [Tools - Model Context Protocol](https://modelcontextprotocol.io/docs/concepts/tools)*

Here's an example of a tool for a database focused MCP server:

```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { executeSqlToolHandler, executeSqlSchema } from "./execute-sql.js";

/**
 * Register all tool handlers with the MCP server
 */
export function registerTools(server: McpServer): void {
  // Tool to run a SQL query (read-only for safety)
  server.tool(
    "execute_sql",
    "Execute a SQL query on the current database",
    executeSqlSchema,
    executeSqlToolHandler
  );
}
```

### Under the hood

- `executeSqlToolHandler` creates a database connection via a database manager like (node-postgres) to the relevant database
- executes the query (example)

## Resources

Resources are a core primitive in the Model Context Protocol (MCP) that allow servers to expose data and content that can be read by clients and used as context for LLM interactions.

*Source: [Resources - Model Context Protocol](https://modelcontextprotocol.io/docs/concepts/resources)*

Resources can include files, data or whatever context you want to give the model. Resource URIs look like:

```text
[protocol]://[host]/[path]
```

For a database focused MCP server, a table resource could look like:

*[Database table resource example would be shown here]*

## Prompts

Prompts enable servers to define reusable prompt templates and workflows that clients can easily surface to users and LLMs. They provide a powerful way to standardize and share common LLM interactions.

*Source: [Prompts - Model Context Protocol](https://modelcontextprotocol.io/docs/concepts/prompts)*

Think of prompts as templates for what a user would want to put in the context window. Prompts are typically implemented as a slash commands.

![MCP Prompts](/images/mcp-prompts.png)

## What's Next for MCP?

- Anthropic is starting to see MCP hosted servers (remote MCP) in cloud vs MCP servers running on your local machine
- MCP conferences
- Implementing authentication (who) and authorization (what)

## Documentation

- [The Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Introduction - Model Context Protocol](https://modelcontextprotocol.io/docs/introduction)
- [spring-ai-examples/model-context-protocol/weather/starter-stdio-server](https://github.com/spring-projects/spring-ai-examples/tree/main/model-context-protocol/weather/starter-stdio-server)
- [Introducing the Model Context Protocol](https://www.anthropic.com/news/model-context-protocol)
- [The lethal trifecta for AI agents: private data, untrusted content, and external communication](https://simonwillison.net/2024/Oct/22/clumsy-computer/)
