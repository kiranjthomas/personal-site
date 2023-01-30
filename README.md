# personal-site

## Hugo

This site is built using [Hugo].

### Theme

The Hugo theme that is used for the site is [anatole].

### Development

#### Run Locally

`hugo server --buildDrafts`

For more information, visit the Hugo [commands] documentation

#### Add New Post

`hugo new posts/<new-post>.md`

When you are ready to publish the post, remember to update the draft status

```md
---
title: "What is the Difference Between a Process and a Thread"
date: 2023-01-12T10:56:57-06:00
draft: false <----update this to true
---
```

#### Follow Markdown Syntax

## Deployment

Commits to main trigger a [Github Actions] workflow that

* `hugo --minify`
* [lint markdown]
* SCP static assets to workload in the cloud

[hugo]: https://gohugo.io/
[anatole]: https://github.com/lxndrblz/anatole/wiki/1%EF%B8%8F%E2%83%A3-Essential-Steps
[github actions]: https://docs.github.com/en/actions
[commands]: https://gohugo.io/commands/hugo/
[lint markdown]: https://github.com/DavidAnson/markdownlint/
