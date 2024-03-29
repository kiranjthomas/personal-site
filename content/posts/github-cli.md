---
title: "Use the Github CLI for a Productivity Bump!"
date: 2023-05-31T16:31:54-05:00
draft: false
---

Github offers a binary that allows you to interact with Github.com!

{{< toc >}}

## How to Install

There are plenty of ways to get the CLI. <https://github.com/cli/cli#installation>

I installed the Github CLI via homebrew.

Once installed, you can use the CLI by entering `gh` in your shell.

## Helpful Commands

I use aliases in my `.zshrc` file to quickly run specific `gh` commands.

Some commands open the relevant information that I want in a browser. If you want to see this information in your terminal, remove the --web CLI param.

### View Repo

`gh repo view --web`

### Create Pull Request

`gh pr create --web`

### View Pull Request

`gh pr view --web`

### View Pull Request Status

`gh pr status`

### View Pull Request Checks

`gh pr checks`

## Full List of Commands

See <https://cli.github.com/manual/gh>
