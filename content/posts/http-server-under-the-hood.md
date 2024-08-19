---
title: "Understanding How a HTTP Web Server Works Under the Hood"
date: 2024-08-19T14:43:02-05:00
draft: false
---

I wanted to explore how a TCP socket server and an HTTP web server work under the hood by dissecting a simple Rust program. This program listens for incoming TCP connections on a specified address and port, processes HTTP requests, and sends HTTP responses back to the client.

{{< toc >}}

## The Code

```rust
use std::io::{BufRead, Write};
use std::net::TcpListener;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:9999").unwrap();

    for mut stream in listener.incoming().flatten() {
        let mut rdr = std::io::BufReader::new(&mut stream);

        loop {
            let mut l = String::new();
            rdr.read_line(&mut l).unwrap();

            if l.trim().is_empty() {
                break;
            }

            print!("{l}");
        }

        stream.write_all(b"HTTP/1.1 200 OK\r\n\r\nHello!").unwrap();
    }
}
```

## Let's Break Down the Program

### Setting Up the TCP Listener

```rust
let listener = TcpListener::bind("127.0.0.1:9999").unwrap();
```

The first step is to create a `TcpListener` bound to the address 127.0.0.1 on port 9999. The `TcpListener::bind` function is used to bind to the specified address and port, and it returns a Result that is either a `TcpListener` or an `io::Error`.

### Handling Incoming Connections

```rust
for mut stream in listener.incoming().flatten() {
```

The listener.incoming() method creates an iterator over incoming TCP connections. Each item yielded by this iterator is a `Result<TcpStream, io::Error>`, where `TcpStream` represents a connection and `io::Error` represents a potential error.

### Reading HTTP Requests

```rust
let mut rdr = std::io::BufReader::new(&mut stream);

loop {
    let mut l = String::new();
    rdr.read_line(&mut l).unwrap();

    if l.trim().is_empty() {
        break;
    }

    print!("{l}");
}
```

For each incoming connection, I create a `BufReader` around the `TcpStream` to facilitate reading from the stream efficiently. The loop reads lines from the buffered reader into a mutable string l. The `BufReader` provides buffering, which can significantly improve the performance of read operations by reducing the number of system calls. Instead of reading directly from the TcpStream, which can be slow due to frequent I/O operations, `BufReader` reads larger chunks of data at once and stores them in an internal buffer. Subsequent reads can then be performed on this buffer, which is much faster.

HTTP messages contain [a blank line](https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages#http_requests) indicating that all meta-information for the request has been sent. I check for this condition using if l.trim().is_empty(), and if it is true, I break out of the loop. Each line read from the request is printed to the standard output.

### Sending HTTP Responses

After reading the HTTP request, I send a simple HTTP response back to the client. The `write_all` method writes the byte string `b"HTTP/1.1 200 OK\r\n\r\nHello!"` to the `TcpStream`. This byte string represents a basic HTTP response with the status 200 OK and the body "Hello!".

### How It All Works Together

1. The program starts by setting up a `TcpListener` bound to a specific IP address and port. This listener will accept incoming TCP connections.
1. The incoming method creates an iterator that yields `Result<TcpStream, io::Error>` for each incoming connection.
1. For each successful connection, a `BufReader` is created around the TcpStream to read the incoming HTTP request line by line. The loop reads lines until a blank line is encountered, indicating the end of the request headers.
1. After processing the request, the server sends a simple HTTP response with the status 200 OK and the body "Hello!" back to the client.

## Testing the Code

Run the HTTP server by cloning <https://github.com/kiranjthomas/simple-http-server-rust> and following the instructions in the README.

Then send a HTTP request to the server. I used `curl` as seen below

```sh
$ curl http://localhost:9999
Hello!%
```

## Conclusion

This Rust program demonstrates the basic functionality of a TCP socket server and an HTTP web server. It sets up a TCP listener, handles incoming connections, reads HTTP requests, and sends HTTP responses. While this example is simple, it provides a foundational understanding of how TCP and HTTP servers operate under the hood. By building on this foundation, you can create more complex and feature-rich servers for various applications.
