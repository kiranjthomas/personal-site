---
title: "How Do Private DNS Names Get Resolved Within an AWS VPC?"
date: 2022-08-31T01:00:00-06:00
draft: false
---

If I have an EC2 instance `foo` on a public subnet and another EC2 instance `bar` on a private subnet with a private DNS name, how would foo be able to find bar ?

{{< toc >}}

## Please Meet the Route 53 DNS Resolver

The Route 53 DNS Resolver resolves DNS requests from private and public Route53 Hosted Zones and forwards other requests to public DNS. It is only accessible from within the VPC.

In a AWS VPC, there will always be a Route 53 DNS Resolver server which runs at the VPC address + 2. For example, the DNS Server on a `10.0.0.0/16`  network is located at `10.0.0.2`.

For more info, check out the [Route 53 Developer Guide](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver.html).

## How Can I Find the Address of the Resolver?

One way would be to [exec](https://aws.amazon.com/blogs/containers/new-using-amazon-ecs-exec-access-your-containers-fargate-ec2/) into a Fargate container and run cat /etc/resolv.conf. See below

![dns resolver](/images/dns-resolver-ecs-exec.png)

## How Does a Compute Resource Know to Send DNS Queries to the DNS Server?

This gets set via Dynamic Host Configuration Protocol (DHCP). The DHCP Option sets are assigned at the VPC level.

When you create a new VPC, a default DHCP option set is created for you. This DHCP options set provides dynamic host configurations to instances on launch.

Here's an example of a DHCP Options Set

```dns
Domain-name=ap.south-1.compute.internal;
name-servers=AmazonProvidedDNS
```

`Domain-name` specifies the "domain name that a client should use when resolving hostnames via the Domain Name System."

`name-servers` determines the "DNS servers that your network interfaces will use for domain name resolution."

`AmazonProvidedDNS` resolves to the +2 address mentioned above.

See the AWS VPC [documentation](https://docs.aws.amazon.com/vpc/latest/userguide/DHCPOptionSetConcepts.html#ArchitectureDiagram) for more on DHCP options.

## How about that Foo and Bar Example

So I believe when `foo` wants to connect with `bar`, `foo` will

1. interact with the DHCP server to get the address of the DNS server
1. get the IP address of `bar` from the DNS server
1. connect to `bar` through the VPC's route tables

## What Tools are Available For Debugging DNS Issues?

* cat /etc/resolv.conf  - show your resolver
* ifconfig -a - display information of all active or inactive network interfaces on the server
* dig - Utility for interrogating DNS name servers
  * `dig <hostname>`
  * `dig -x <ip address>` - simplified reverse lookup
* hostname  - use this to confirm that the hostname that was created matches what's in the DHCP options set
