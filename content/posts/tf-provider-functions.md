---
title: "How to use the Terraform AWS Provider's Defined Functions"
date: 2024-04-12T15:20:23-05:00
draft: false
---

Terraform announced the general availability of provider-defined functions for AWS in Terraform v1.8.0.

This post will provide examples of Terraform's existing built-in functions and why Terraform started to allow provider specific functions.

The post borrows heavily from <https://www.hashicorp.com/blog/terraform-1-8-adds-provider-functions-for-aws-google-cloud-and-kubernetes>

{{< toc >}}

## Dependencies

* [Terraform v1.8.0](https://github.com/hashicorp/terraform/releases/tag/v1.8.0)
* [Teraform AWS Provider v5.40.0](https://github.com/hashicorp/terraform-provider-aws/releases/tag/v5.40.0)

## What is a Terraform Built-In Function?

The Terraform configuration language originally had limited [built-in functions](https://developer.hashicorp.com/terraform/language/functions) for tasks like calculations and validations.

Examples of existing built-in functions provided by Terraform include

* numeric calculations like [ceil](https://developer.hashicorp.com/terraform/language/functions/ceil), [floor](https://developer.hashicorp.com/terraform/language/functions/floor) or [max](https://developer.hashicorp.com/terraform/language/functions/max).

    Here's what the max  function could do for you

    ```terraform
    > max(12, 54, 3)
    54
    ```

* string functions like [lower](https://developer.hashicorp.com/terraform/language/functions/lower), [split](https://developer.hashicorp.com/terraform/language/functions/split) and [startswith](https://developer.hashicorp.com/terraform/language/functions/startswith)
* collection functions like [concat](https://developer.hashicorp.com/terraform/language/functions/concat), [keys](https://developer.hashicorp.com/terraform/language/functions/keys) and [one](https://developer.hashicorp.com/terraform/language/functions/one)

## Why Allow Provider Defined Functions?

To address the need for more capabilities, Terraform 1.8 introduced the ability for providers to create custom functions.

These functions can be called from within the Terraform configuration and are defined using the Terraform provider plugin framework.

Providers are declared in the terraform block. I typically use the [AWS provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs). See below for an example

```terraform
terraform {
  required_version = ">= 1.8"

  required_providers {
    aws = {
        source  = "hashicorp/aws"
        version = ">= 5.40.0"
    }
  }
}
```

## Where Can I find Documentation for the the Current AWS Provider Functions?

They are listed under Functions  in the left-rail of the [Terraform AWS Provider documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs).

As of 4/11/2024, the AWS provider has three functions.

* [arn_build](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/functions/arn_build)
* [arn_parse](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/functions/arn_parse)
* [trim_iam_role_path](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/functions/trim_iam_role_path)

## Next Steps

Be on the lookout for more AWS provider functions.

If you are interested in the existing functions, consider upgrading your terraform modules to use Terraform v1.8 and Terraform AWS Provider v5.40.0.
