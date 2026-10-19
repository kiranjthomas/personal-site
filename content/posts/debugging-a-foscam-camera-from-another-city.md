---
title: "Debugging a Foscam Camera That Wouldn't Join My Network (From Another City)"
date: 2026-10-19T14:00:00-05:00
draft: false
---

I plugged a Foscam FI9821W camera into my home router, but the router never gave it an IP address. I had to hit the road before I could figure out why, so I figured I'd debug it remotely. That meant no walking over to press the reset button.

I worked through it with my Pi admin assistant, an AI assistant that can SSH into the Raspberry Pi on that network and run commands for me. The Pi isn't exposed to the internet directly. It connects out over a reverse tunnel, and I gave my assistant a service key for that tunnel. I can revoke the key whenever I want, which cuts off its access.

{{< toc >}}

## What Was the Symptom?

The router's app showed the camera as plugged in, but with no IP address.

My assistant's first guesses were:

1. the camera still had a static IP saved from an older network setup
1. the camera was still booting

The quick fix for the first one is a factory reset, which puts the camera back on DHCP. That needs someone at the house, so it was out.

## Is the Camera Even on the Network?

First, my assistant swept the Pi's subnet so the Pi's ARP table would fill up, then looked for the camera's MAC address.

```bash
for i in $(seq 1 254); do ping -c1 -W1 <lan-prefix>.$i >/dev/null 2>&1 & done; wait
ip neigh show dev wlan0
```

Nothing answered with the camera's MAC address. So the camera wasn't on the Pi's subnet, and it had never asked the router for an address.

## How Do You Find a Device With an Unknown IP?

You listen for it. My assistant installed `tcpdump` on the Pi and filtered on the first bytes of the camera's MAC address (Foscam's vendor prefix), plus DHCP traffic.

```bash
sudo apt-get install tcpdump
sudo timeout 120 tcpdump -i wlan0 -nn -e -c 30 \
  "(ether[6:4] & 0xffffff00 = <foscam-mac-prefix>) or udp port 67 or udp port 68"
```

The camera was chatty. It kept sending ARP requests looking for a gateway that didn't exist.

```text
<camera-mac> > <broadcast>, ethertype ARP (0x0806), length 60: Request who-has <old-gateway> tell <camera-old-ip>, length 46
```

## What Was the Root Cause?

The camera had a **static IP from my old Wi-Fi system** saved on it. That old system used a different subnet than my current router. The camera kept asking for its old gateway, and since it never asked for DHCP, the router never gave it an address.

## How Do You Talk to a Device on the Wrong Subnet?

Give the Pi a second, temporary IP on the camera's old subnet.

```bash
sudo ip addr add <temp-ip>/24 dev wlan0
ping -c2 <camera-old-ip>
```

The camera answered pings right away, and its web interface came up. The Pi's normal address and default route didn't change, so the reverse tunnel to the Pi stayed up the whole time. A secondary address added this way also goes away if the Pi reboots.

## How Did We Switch the Camera to DHCP?

Foscam cameras have a CGI API. My assistant tried the usual default logins first. None of them worked, so I gave it my credentials.

Then it told the camera to use DHCP and rebooted it.

```bash
curl "http://<camera-old-ip>:<web-port>/cgi-bin/CGIProxy.fcgi?cmd=setIpInfo&isDHCP=1&usr=<user>&pwd=<password>"
curl "http://<camera-old-ip>:<web-port>/cgi-bin/CGIProxy.fcgi?cmd=rebootSystem&usr=<user>&pwd=<password>"
```

The camera came back on the right subnet with an address from my router. My assistant confirmed it with `ping` and by loading the camera's web page, then removed the temporary IP.

```bash
sudo ip addr del <temp-ip>/24 dev wlan0
```

Later on, I double-checked that the temporary address was really gone. It was. The Pi only had its normal address (plus Docker's internal ones).

## How Do I Keep the IP From Moving?

I wanted a DHCP reservation, but my router doesn't offer a way to make one from the Pi. So we set a static IP on the camera itself instead, using the camera's current address, the right gateway, and the right subnet mask. That's done with the same `setIpInfo` command with `isDHCP=0`. The camera came back at the same address after its reboot.

## How Could the Pi Reach the Camera Without a Router?

I asked my assistant this afterwards, since the Pi isn't a router.

* The camera's Ethernet port and the Pi's Wi-Fi both connect to the same router, which bridges them into one local network (a layer 2 network)
* every device has a routing table that decides whether a destination is "local" (deliver it directly) or "not local" (send it to the gateway)
* before the fix, the camera's address wasn't in the Pi's subnet, so the Pi sent that traffic to the router, which didn't know what to do with it
* adding the temporary `/24` address added a route saying the camera's old subnet is local too
* the Pi then sent an ARP request for the camera's IP, got the camera's MAC address back, and sent frames straight to it

So the IP addresses being on different subnets doesn't matter. What matters is that both devices share the same physical network, and each one thinks the other's address is local.

## Is a Subnet Mask the Same as CIDR?

Yes. `255.255.255.0` means the first 24 bits are the network part, which is `/24` in CIDR notation. That's why the temporary address was added as `<temp-ip>/24`.

## What Tools Helped?

* `ip neigh` - show the ARP/neighbor table
* `tcpdump -e` - capture traffic with MAC addresses, which is handy for finding a device with an unknown IP
* `ip addr add` / `ip addr del` - add or remove a secondary IP on an interface
* the Foscam CGI API (`CGIProxy.fcgi`) - change camera settings without the web UI
