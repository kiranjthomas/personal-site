---
title: "Fargate Under the Hood"
date: 2022-08-23T01:00:00-06:00
draft: false
---

I've used AWS Fargate many times before. It does a great job of abstracting lots of things away.

To better understand these abstractions, I read AWS blog posts and documentation and watched Fargate deep dives from past re:invents.

The post below summarizes my findings.

{{< toc >}}

## Let's First Level Set

### What is AWS Fargate?

> AWS Fargate is a technology that you can use with Amazon ECS to run containers without having to manage servers or clusters of Amazon EC2 instances

[source](https://docs.aws.amazon.com/AmazonECS/latest/userguide/what-is-fargate.html)

Before Fargate, you would have to manage your own EC2 instances with AWS Elastic Container Service (ECS) to run containers.

If you are new to ECS, just think of it like a container orchestrator like Kubernetes.

### Why use AWS Fargate?

> With AWS Fargate, you no longer have to provision, configure, or scale clusters of virtual machines to run containers. This removes the need to choose server types, decide when to scale your clusters, or optimize cluster packing.

[source](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html)

> Since Fargate takes on the undifferentiated heavy lifting of infrastructure setup and maintenance for running containers, it is also responsible for maintaining the lifecycle of these containers. This includes bootstrapping container images, capturing and streaming container logs to appropriate destinations and making available the appropriate interfaces for storage, networking, IAM role credentials and metadata retrieval for these container

[source](https://aws.amazon.com/blogs/containers/under-the-hood-fargate-data-plane/)

To me, that's a long way of saying serverless is easy. Devs get to focus on a product's business logic and let AWS take care of the non-business logic related things.

## So What Actually Happens When I Ask Fargate to Run a Task?

### First, Meet the Control and Data Planes

To answer this question, we need to discuss two new concepts with regards to the Fargate architecture.

* Control plane
services that run the Fargate business to orchestrate the task launches
think brains of the system
* Data plane
huge fleet of servers (running EC2 instances) that run your actual containers
think muscle of the system

### Ok Tell Me What Happens Already

Let's walk through the following diagram

![Control and Data Planes](/images/control-data-planes.png)

1. Invoking RunTask hits the Control Plane
2. Control Plane contacts Data Plane to reserve server capacity (EC2 instance) for your task and persists intent to launch task on that capacity
3. You are notified that a task is in a pending state
4. Control Plane asynchronously
contacts server capacity that was reserved
sends task definition (i.e. launch instructions)
issues instructions to run
5. Bring up the containers
6. Data Plane reports back to the Control Plane saying the containers are running

[source](https://www.youtube.com/watch?v=Hr-zOaBGyEA)

## The Control Plane is Boring (to me)

![Control Plane](/images/control-plane.png)

The Control Plane does important things but I didn't find it all that exciting

* The Frontend Service handles authentication and authorization
* The Cluster Manager Sub-system communicates with the Data Plane and keeps track of task state changes (i.e. Pending to Running)
* The Capacity Manager Sub-system
  * keeps track of unavailable and available EC2 instances
  * picks a specific a instance type based on your task requirements

Did you know that AWS Fargate keeps a pool of pre-warmed EC2 instances ready to go? This cuts down on how long it takes to create and run a task.

[source](https://aws.amazon.com/blogs/containers/under-the-hood-amazon-elastic-container-service-and-aws-fargate-increase-task-launch-rates/)

## Deep Dive into the Data Plane

### How Does Networking Work Between the EC2 Instances and my VPC?

Let's review the following diagram

![Data Plane](/images/data-plane.png)

From a networking perspective, the three big things that jump out to me are

1. the EC2 instances that are used to run tasks are running in a separate Fargate VPC which is separate from your VPC
2. the primary Elastic Network Interface is in the Fargate VPC and handles network traffic for the
   * Container Runtime
   * Fargate Agent
   * Guest kernel & OS
3. the secondary Elastic Network Interface is in your VPC and handles
   * network traffic between your containers and resources in your VPC
   * log pushing
   * image pulling

The Fargate Agent's responsibility is to communicate with the Control Plane.

### Are My Tasks Secure?

#### Hardware Isolation

Let's walk through the diagram below to understand the approach AWS takes from a hardware isolation perspective.

![Hardware Isolation](/images/hardware-isolation.png)

AWS doesn't trust cgroups, namespaces and secomp policies when it comes to multi-tenancy. So they made the decision that only one task can run on a EC2 instance! That's what the red X is supposed to symbolize in the picture.

Additionally, when your task completes or dies, the EC2 instance is terminated. AWS claims that whenever you invoke the RunTask API, your task will be running on a new pre-warmed EC2 instance.

[source](https://www.youtube.com/watch?v=Hr-zOaBGyEA)

#### Task Isolation

How does AWS prevent a task from reaching out of the container boundary and doing harm as a bad actor?

![Task Isolation](/images/task-isolation.png)

AWS claims that the container runtime, Fargate Agent and Guest Kernel only include state/information for the locally running task. Even if the components are compromised, there's no information for a bad actor to use.

Well couldn't a bad actor leverage the Fargate ENI we talked about earlier? Wouldn't they have access to the fleet of EC2 instances and Control Plane?

![Task Isolation](/images/task-isolation-2.png)

To mitigate against the Fargate ENI doing bad things with the EC2 instances, AWS

* uses security groups to block communication between instances
* monitors VPC flow logs in the Fargate VPC for suspicious activity

To mitigate against the Fargate ENI doing bad things with the Control Plane, the Fargate agent only has privileges to discover and mutate about the local task..

Did you know that security groups are associated with network interfaces? I thought they were associated with the actual instance.

[source](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html)

## Other Fun Facts

The following tidbits are true as of platform version 1.4.0

### Fargate no longer uses Docker Engine

Docker Engine has a lot of features that Fargate provides natively. They are instead just using containerd as the execution engine.

[source](https://aws.amazon.com/blogs/containers/aws-fargate-launches-platform-version-1-4/)

### Fargate tasks now have a consolidated 20GB ephemeral volume

Tasks used to have two ephemeral local volumes. One for a staging area for containers running in the same ECS task and one for host container images.

Now there's just one volume so that tasks can use this space however they want.

[source](https://aws.amazon.com/blogs/containers/aws-fargate-launches-platform-version-1-4/)
