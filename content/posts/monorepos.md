---
title: "What is a Monorepo?"
date: 2022-12-04T16:18:59-06:00
draft: false
---

A single monolithic repository to house all the software that a squad or department or organization (e.g. Google) owns.

{{< toc >}}

## Why use a Monorepo?

### Visibility

* See the company’s entire codebase
* Prevent having to clone multiple projects

### Consistency

Share modules like eslint config, documentation, UI library etc.

### Dependency Management

* Affected applications will know if a breaking change is made to a shared library.
* Monorepo tools can help you visualize the entire dependency graph of your software.
* 3rd party dependencies can be deduped by monorepo tools.

### CI/CD

CI/CD should theoretically be easier to build and test since your code is unified by default

## What are some Monorepo Cons?

* As the monorepo becomes bigger there will be more things to test and more artifacts to store.
* Compiling, building and testing everything may be slow.

To operate at scale, you will need to invest in the proper tooling.

## Tools

### Basic tools

#### npm/yarn

* Create a root level package.json which then has nested workspaces like apps and packages.
* They are linked back to the root level project.
* Dedupes packages

#### Lerna

* Works with npm

#### PNpm

* Improve install speed of packages
* Installs dependencies globally and symlinks them
* Works with npm

### Advanced

Smart build systems like NX and Turborepo do cool things like

* Builds a dependency graph between all packages to allow tooling to understand what needs to be tested and what needs to be rebuilt whenever there is a change to the code base
* Cache artifacts that have already been built and download them from the cloud;
  * Turborepo only allows you to store caches in Vercel or a custom implementation that uses the Vercel API (source)
* Run jobs in parallel for speed

#### Nx

* Created by two ex-Googleers
* Written in Typescript
* CLI that generates boilerplate code
* Plugin ecosystem
* VSCode extension
* Distributed task execution - distribute work across multiple CI servers
* Highly configurable
* Quickstart guide - <https://www.youtube.com/watch?v=VUyBY72mwrQ>

#### Turborepo

* Recently acquired by Vercel
* Written in Go
* Opensource
* Quickstart guide - <https://www.youtube.com/watch?v=9iU_IE6vnJ8&t=370s>

#### Bazel

Built by Google for their monorepo

## Source

<https://www.youtube.com/watch?v=9iU_IE6vnJ8>
