---
title: "How does AWS Authenticate Trillions of API Requests a Day?"
date: 2023-11-29T20:44:34-06:00
draft: false
---

I watched an AWS re:invent 400 level Identity and Access Management (IAM) presentation from 2022 by [Eric Brandwine](https://www.linkedin.com/in/ericbrandwine). Eric is a VP and Distinguished Engineer with the Amazon security team.

The presentation covered the constraints that existed in 2006 and the design decisions that now allow AWS to authenticate clients at scale. He then walked through how their authentication requirements have changed over the years.

You can watch the video on YouTube here: [https://www.youtube.com/watch?v=tPr1AgGkvc4](https://www.youtube.com/watch?v=tPr1AgGkvc4)

{{< toc >}}

## Overview

This presentation focused on the design requirements that lead to the cryptographic protocol designed for authentication via AWS IAM.

Authentication means the principal making the request actually is who they say they are. Authorization focuses on what the principal or user is allowed to do.

I've divided my notes into two general areas

* [cryptographic protocol](#cryptographic-protocol)
* [request validation](#request-validation)

## Cryptographic Protocol

Eric described a cryptographic protocol as a

> complete specification of every operation that you need to perform in order to complete whatever task you are trying to complete ideally in a way that protects you against all of the threats you specified.

Using two parties helps create an easy mental model when discussing cryptographic protocols. For example, you could have a user named "Alice" and then a cloud provider.

![iam-auth-two-parties](/images/iam-auth-two-parties.png)

The rest of these notes will refer back to these two parties.

### Design Considerations

* Requests should be signed and validated
* Requests should not not be vulnerable to replay attacks
* Cryptography must be computationally cheap
  * Eric reminded the audience that Transport Layer Security was expensive in 2006
* Cryptography should be fast
* Avoid using symmetric keys between the user (e.g. Alice) and the service (e.g. DynamoDB)

These design considerations led to AWS using a cryptographic hash algorithm.

### Meet the Hash

![iam-auth-meet-the-hash](/images/iam-auth-meet-the-hash.png)

### Meet the Hash-Based Message Authentication Code

To turn the hash or digest into a signature, AWS used the cryptographic construction hash-based message authentication codes (HMAC).

A simplified definition is

> HMAC(key, message) = H(key || H(key || message))

H(key || message) is computationally expensive because you are taking a string of arbitrary length and converting it to a fixed length.

H(key || ...) is quick because you are hashing to fixed length inputs.

If you just did the first hash you are vulnerable to extensions attacks.

![iam-auth-hmac-examples.png](/images/iam-auth-hmac-examples.png)

### Avoiding Symmetric Keys when Authenticating with an AWS Service

As mentioned above, AWS did not want a situation where a service had access to the user's secret access key. For example, they did not want a service like Simple Storage Service (S3) to be in a situation where it could use Alice's secret access key to do things outside of it's scope.

To solve this problem, AWS created a separate service that AWS services like S3 could call to validate requests. AWS would know a request was valid if a service could generate the same signature provided by a request sent from the user (i.e Alice). In addition to solving the symmetric key problem, they also believed that the IAM service should not spend its time doing request verification.

The new service they created was the Auth Runtime Service (ARS).

## Request Validation

### Auth Runtime Service (ARS)

ARS is

* an internal service that is not used directly by customers
* one of the most heavily used services in AWS
* used to authenticate and authorize inbound API calls

Every change made in IAM is denormalized and propagated to ARS. This means that ARS will have Alice's secret access key.

According to Eric, ARS is the most locked down system at AWS since it contains customer secret keys and policies.

Here's how ARS works with an AWS service at a high level

![iam-auth-how-ars-works](/images/iam-auth-how-ars-works.png)

1. Alice creates and signs an API call for S3 to create a bucket
    1. [signing](#signed-aws-api-request) is automatically done by AWS SDKs
2. Alice sends request to S3
3. S3 calls ARS to verify API request
4. ARS validates the request signature and tells S3 the request is ok  
    1. ARS will have all the information it needs including the secret access key
5. S3 returns 200 back to Alice

All IAM changes go through AWS region us-east-1 and are then propagated globally.

![iam-auth-iam-propagation](/images/iam-auth-iam-propagation.png)

### AWS Signature Version 4 Allowed AWS to Cached Keys

AWS Signature Version 4 allowed AWS to create signed requests for specific regions and services with an expiration.

![/images/iam-auth-multiple-hmacs.png](/images/iam-auth-multiple-hmacs.png)

This key that was generated by multiple HMACs was now acceptable for caching in individual AWS services.

![iam-auth-ars-caching-key](/images/iam-auth-ars-caching-key.png)

AWS accepted caching because the key could only be used

* for a set amount of time
* by a specific AWS service (e.g. S3 since the service was one of the inputs for HMAC)

They refused to cache the API secret key as this would give S3 privileges beyond S3.

### Short-Term Keys for Expanded Authentication Use Cases

AWS wanted to provide the ability to generate short term keys that have an automatic expiration.  This was helpful for

* meeting the security best practice of rotating keys often
* role assumption
* identity federation - authenticate with corporate credentials and use that identity to authenticate with AWS

AWS wanted to be able to generate short term keys

* local to a region
* at scale
* with low latency
* that automatically expired

To do this, AWS created the [Secure Token Service](https://docs.aws.amazon.com/STS/latest/APIReference/welcome.html).

#### Secure Token Service (STS)

This was the building block that allowed AWS to issue short term tokens (sessions) at scale. It's deployed in every region.

A secure token looks like

![iam-auth-token-breakdown](/images/iam-auth-token-breakdown.png)

Let's walk through an example of Alice needing to get a short lived token from STS.

![iam-auth-creating-token](/images/iam-auth-creating-token.png)

1. Alice performs key derivation for STS using long lived key
2. Alice sends request to STS
3. STS validates request with ARS
4. ARS sends specialized key back to STS which is then cached for future API calls
5. STS sends encrypted session token back to Alice

Now let's see how this works with ARS when Alice wants to create a S3 bucket

![iam-auth-service-using-token](/images/iam-auth-service-using-token.png)

1. Alice sends a short term token to S3
2. S3 calls ARS
3. ARS validates the token via two key pairs it has with STS to
    1. decrypt the token
    2. validate the signature
4. S3 returns a 200 back to Alice after creating the bucket

Eric did not go into great detail about step 3 and I still find it a bit confusing. I found this YouTube comment where he added some detail

![iam-auth-eric-brandwine-youtube-comment](/images/iam-auth-eric-brandwine-youtube-comment.png)

## Key Terms

### IAM API Keys

After creating an IAM user, you can get API keys. They could look like

![iam-auth-access-key-example](/images/iam-auth-access-key-example.png)

### Access Key

This is a primary key used to fetch the secret access key in the IAM database,

### Secret Access Key

This is the key that is used to sign the HMAC key.

It is a long term key that is valid until explicitly revoked.

### Asymmetric Encryption

> As the name implies, asymmetric encryption is different on each side; the sender and the recipient use two differen keys.  
>
> Asymmetric encryption, also known as public key encryption, uses a public key-private key pairing: data encrypted with the public key can only be decrypted with the private key.

source - [Cloudflare - What is asymmetric encryption?](https://www.cloudflare.com/learning/ssl/what-is-asymmetric-encryption)

### Symmetric Encryption

> ...the same key both encrypts and decrypt data.  
>
> For symmetric encryption to work, the two or more communicating parties must know what the key is; for it to remain secure, no third party should be able to guess or steal the key.

source - [Cloudflare - What is asymmetric encryption?](https://www.cloudflare.com/learning/ssl/what-is-asymmetric-encryption/)

### Signed AWS API Request

> To calculate a signature, you first need a string to sign. You then calculate a HMAC-SHA256 hash of the string to sign by using a signing key. The following diagram illustrates the process, including the various components of the string that you create for signing.

source - [AWS - create signed request](https://docs.aws.amazon.com/IAM/latest/UserGuide/create-signed-request.html)

![iam-auth-generate-signature](/images/iam-auth-generate-signature.png)
