---
title: "How to use AWS CloudTrail to Audit Infrastructure Changes"
date: 2023-09-29T10:00:09-05:00
draft: false
---

You can use AWS CloudTrail to track and search for changes that happen in AWS.

This can be useful in situations when  service `foo` depends on some infrastructure `bar` . If `foo` starts behaving in strange ways, you might want to know if something changed about `bar.` CloudTrail can be one of many tools to help find out what happened.

{{< toc >}}

## What is CloudTrail?

> AWS CloudTrail is an AWS service that helps you enable operational and risk auditing, governance, and compliance of your AWS account. Actions taken by a user, role, or an AWS service are recorded as events in CloudTrail. Events include actions taken in the AWS Management Console, AWS Command Line Interface, and AWS SDKs and APIs.

[source](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html)

The first step in understanding CloudTrail is what it considers an event. An event in CloudTrail is

> ...is the record of an activity in an AWS account.
>  
> CloudTrail events provide a history of both API and non-API account activity made through the AWS Management Console, AWS SDKs, command line tools, and other AWS services.

Events can be categorized into three buckets.

* Management Events
* Data Events
* Insights Events

The big gotcha with CloudTrail is that it does not log data or insights events automatically. The only type of events you get by default are management events.

### Management Events

Think of these as control plane events. That is, updates that are performed on a resource (e.g. CloudFront UpdateDistribution).

For more information, see <https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-concepts.html#cloudtrail-concepts-management-events>

### Data Events

Think of these as data plane events. That is, updates that are performed in a resource (e.g. DynamoDB PutItem).

The following link has a table of all the types of data events that are supported in CloudTrail: <https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-concepts.html#cloudtrail-concepts-data-events>

You can log data events by [creating a CloudTrail trail](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-create-and-update-a-trail.html).

### Insights Events

I'm not as familiar with these so I'll provide a direct quote from the documentation.

> CloudTrail Insights events capture unusual API call rate or error rate activity in your AWS account by analyzing CloudTrail management activity. If you have Insights events enabled, and CloudTrail detects unusual activity, Insights events are logged to a different folder or prefix in the destination S3 bucket for your trail.

[source](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-concepts.html#cloudtrail-concepts-insights-events)

## How Do I use CloudTrail?

Great question! CloudTrail is a service that is easiest to understand via the AWS Console.

You can access it like any other AWS service by searching for it once you have logged into the relevant AWS account.

![CloudTrail Console](/images/cloudtrail-console.png)

Once you've accessed the CloudTrail console, the fastest way to get started with CloudTrail is to click `Event History`.

![CloudTrail Event History](/images/cloudtrail-event-history.png)

The `Event History` feature allows you to access a

> viewable, searchable, downloadable, and immutable record of the past 90 days of CloudTrail management events in an AWS Region

The `Event History`  let's you query by several different lookup attributes. My favorite one to use is the `Event Name`.

![CloudTrail Event Name](/images/cloudtrail-event-name.png)

When you see `Event Name` , think of the AWS action (i.e. API call) that would get called when performing some action on an AWS resource. Every AWS API action is available here: <https://docs.aws.amazon.com/service-authorization/latest/reference/reference\_policies\_actions-resources-contextkeys.html>

Let's use the `Event History`  feature to walk through an example use case.

### An API request I made in my Lambda is now returning a 403. I haven't changed anything. What happened?

In this hypothetical example, let's say that

* my Lambda started returning 403s around 2am CDT on August 10th
* the API request made in your Lambda goes through a CloudFront distribution
* a [Web Application Firewall (WAF)](https://aws.amazon.com/waf/) is associated with the CloudFront distribution

The logical thing to do is to send a message to

* your teammates
* to a public channel
* direct messages to any service owners that you know

What if, while you wait, you walk through the request chain and investigate points of failure.

I know that the AWS action associated with making changes to a CloudFront distribution is `UpdateDistribution` . So I enter `UpdateDistribution`  as the Event name and query for the results.

![CloudTrail Update Distribution](/images/cloudtrail-update-distribution.png)

Hmm those dates don't align with when I started seeing 403s. I'm going to adjust my Event Name to be something associated with updates to a WAF.

I'm not super familiar with API actions associated with the WAF so I'm going to check out <https://docs.aws.amazon.com/service-authorization/latest/reference/list\_awswafv2.html#awswafv2-actions-as-permissions>. AWS will usually call any PUT time commands `updates` . I'm going to search for [UpdateWebACL](https://docs.aws.amazon.com/waf/latest/APIReference/API_UpdateWebACL.html).

Oh wow, somebody was updating the WAF right around when I started seeing 403s.

![CloudTrail Update WebACL](/images/cloudtrail-update-webacl.png)

Now I'm going to reach out to them to find out more.

![CloudTrail Webex](/images/cloudtrail-webex.png)

BOOM! I still don't know exactly what changed but at least I have a point of contact to discuss what happened!

## Summary

CloudTrail can be an amazing tool to self serve when you want to know when something changed.

Happy CloudTrailing!
