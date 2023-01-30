---
title: "What is the Difference Between a Process and a Thread?"
date: 2023-01-12T10:56:57-06:00
draft: false
---

[ByteByteGo] is an incredible resource for understanding system design and architecture. They recently published a [video](https://www.youtube.com/watch?v=4rLW7zg21gI) discussing the difference between a Process and a Thread. Here are my notes from that video!

{{< toc >}}

## What is a Process?

A process is created when a program is loaded into memory and executed by the processor.

![What is a Process](/images/process.png)

An active process includes the resources the program needs to run. The resources are managed by the operating system.

![process resources](/images/process_resources.png)

Each process has it's own memory address space.

![process memory address](/images/process_memory_address.png)

Chrome is famous for taking advantage of process isolation by running each Chrome Tab in it's own process. When one tab misbehaves, other tabs are unaffected.

## What is a thread?

A thread is a unit of execution within a process.

A process has at least one thread which is often called the main thread. A process can have many threads.

Each thread has it's own stack. Threads within a process share a memory address space. It's possible to communicate between threads using that shared memory space. One misbehaving thread could bring down other threads.

![thread stack](/images/thread_stack.png)

## How does the OS run a Thread or Process on CPU?

Context switching will switch a process out of the CPU so that another process can run.

![context switching](/images/context_switching.png)

The operating system will store the state of the current running process so that the process can be restored and resumed execution at a later point.

Context switching is expensive because it involves

* saving saving and loading registers
* switching out memory pages
* updating kernel structures

It's generally faster to switch contexts between threads than between processes. There are fewer states to track. Additionally, since threads share memory, there is no need to switch out virtual memory pages.

[ByteByteGo]:https://bytebytego.com/
