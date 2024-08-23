---
title: "Building A Personal Website"
date: 2023-12-04T16:00:00-06:00
draft: false
---

## Project Abstract

* Build and deploy a website using domain name `kiranjthomas.com`
* Save money!

## Project Requirements

* Deploy content changes via a deployment pipeline
* Leverage an existing static site generator framework
* Investigate hosting options with a focus on price

## Noteworthy Tools/Services Used

* [Github Actions](https://docs.github.com/en/actions)
* [Github Pages](https://docs.github.com/en/pages)
* [Hugo](https://gohugo.io/)

## Project Summary

I have used `kiranjthomas.com` to share more info about myself since May 2019. In that time, I have used several different frameworks to build and serve my website. They have included

* Flask
  * Copied a free portfolio templates html and CSS
  * Served static website via Flask web server
* Create React App
  * Leveraged external html and CSS again
  * Served static website via Node
* Digital Ocean Droplets
  * Managed DNS records
  * Hosted website
  * Monitored traffic via AWS CloudWatch Agent / CloudWatch Logs

I learned a lot from having my own server via Digital Ocean Droplets! After a couple years, I killed most of the projects (e.g. Elasticsearch / Kibana) that were being served by the droplet and dropped down to their most basic instance. At that point, the only thing hosted on the server was my website.

I was paying about $6.50 a month for the droplet. Then I learned about Github Pages and realized I could save some money!

### Transition to Hugo

My requirements for my own website and my tolerance for maintaining it changed over time. Basically, I just wanted to quickly create blog posts using a template. I didn't need a single page application because I wasn't focusing on a fun user interface. This led me to Hugo!

### Transition to Github Pages / Actions

This transition was fairly straightforward because Hugo provides an example of how to deploy your website. See this [documentation on how to host on Github](https://gohugo.io/hosting-and-deployment/hosting-on-github/).

## Conclusion

My personal website has evolved over time in terms of functionality and developer experience. I've realized that the way I have maintained this project is a reflection of what I personally love doing. That is, I enjoy finding optimizations to increase developer efficiency and decrease costs.
