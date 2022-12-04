# personal-site

## Hugo
This site is built using [Hugo].

### Theme
The Hugo [theme] that is used for the site is anatole.

## Deployment
Pushes to main trigger a [Github Actions] workflow that
* `hugo --minify`
* scp static assets to workload in the cloud

[hugo]: https://gohugo.io/
[theme]: https://github.com/lxndrblz/anatole/wiki/1%EF%B8%8F%E2%83%A3-Essential-Steps
[github actions]: https://docs.github.com/en/actions
