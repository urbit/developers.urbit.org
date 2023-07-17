+++
title = "Self-hosting S3 Storage with MinIO"
description = "How to set up and self-host MinIO S3 storage"
template = "doc.html"
weight = 2
[extra]
hidetitle = "true"
+++

Adding [S3](https://aws.amazon.com/s3/) storage to Urbit unlocks some great new features, such as the ability to upload & post your own media to chats straight from your own machine, and upload custom avatars. This is a guide to self-hosting [MinIO](https://min.io), an S3 compatible block storage solution.

You can read more about S3 in [Configuring S3 Storage](/manual/os/s3).

Cloud providers offer off-the-shelf S3 solutions that you can get started with almost immediately. However, if you do not wish to trust them with your uploaded files, you can self-host an S3 solution.

This process requires a working knowledge of the Linux command line and web technologies such as DNS and TLS.

The self-hosting process is almost exactly the same whether you are hosting on your own hardware, or if you are renting a VPS from a cloud provider like DigitalOcean or AWS. Either way, all that you need is a machine running Linux and a domain - for the sake of this guide, `example.com` will be used in place of your custom domain. You should substitute your own domain everywhere the example domain is used in this guide; for example:

- `example.com` should become `yourdomain.tld`,
- `s3.example.com` should become `s3.yourdomain.tld`,

and so on.

Ideally, MinIO would be installed on the same machine that your Urbit planet is hosted on, and run alongside at no extra cost - although it can just as easily be hosted on a separate machine.

## Steps

### (optional) Install Docker

Hosting MinIO via Docker is the simplest option. To install Docker server, follow the relevant guide [here](https://docs.docker.com/engine/install/#server).

If you don't want to install Docker, MinIO does offer independent binaries. The process for running these should be similar, but the next step assumes you are using Docker.

### Install MinIO

Once Docker is installed, we can install and run MinIO by following the steps [here](https://docs.min.io/docs/minio-docker-quickstart-guide.html).

You should only need to run a single command, along the lines of:

```
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio-urbit \
  -v /mnt/data:/data \
  -e "MINIO_ROOT_USER=<username>" \
  -e "MINIO_ROOT_PASSWORD=<password>" \
  -e "MINIO_DOMAIN=s3.example.com" \
  -e "MINIO_SERVER_URL=https://s3.example.com" \
  minio/minio server /data --console-address ":9001"
```

Ports 9000 and 9001 are exposed to give access to the MinIO S3 interface and MinIO web admin respectively. `/mnt/data` is the path where your uploaded data will be stored on your host machine — you can change this as necessary.

Be sure to add the `MINIO_DOMAIN` environment variable; this tells MinIO to accept virtual host style URLs (`BUCKET.s3.example.com` rather than `s3.example.com/BUCKET`), which are required for compatibility with Urbit.

Your username and password can be anything of your choosing — make sure they're secure! Your username must be at least 4 characters long and your password at least 8 characters long.

### Create DNS records

Now, you'll need to point your own domain at your MinIO installation. Via your domain's DNS settings (usually configured on the registrar you bought your domain through), create three `A` records:

- `s3.example.com`,
- `console.s3.example.com`, and
- `BUCKET.s3.example.com` where BUCKET is a bucket name of your choosing — 'media' or 'uploads' are good examples

All 3 should point at the IP address of your host machine. If you are hosting on your own hardware, this could require port-forwarding via your router so that your host machine is reachable from outside of your home network, and possibly using a dynamic DNS service to update your DNS records if your home IP is not static.

DNS records can take a little while to propagate, so don't worry if you type your new URL into your browser and don't see anything yet.

_Note: if you plan to create multiple buckets, you will need a DNS record for each. Alternatively you can use a wildcard domain record, but for use with Urbit only one bucket is needed._

### Set up the reverse proxy

Setting up a reverse proxy in front of MinIO allows us to configure domain names and TLS. In this guide we use caddy, an incredibly simple web server. If you have experience with other web servers, you are also able to use those in place of caddy.

To install caddy, follow the instructions [here](https://caddyserver.com/docs/install).

Caddy handles TLS automatically, so we don't need to worry about setting that up. All we need to do is create a Caddyfile that looks something like this:

```
console.s3.example.com {
  reverse_proxy localhost:9001
}
s3.example.com BUCKET.s3.example.com {
  reverse_proxy localhost:9000
}
```

Remember to replace BUCKET with your chosen bucket name, and then run `caddy start` in the same directory as the Caddyfile.

### Create an S3 bucket

Navigate to your MinIO admin endpoint (`https://console.s3.example.com`) in a browser and sign in using the username and password you entered in step 1.

Choose 'buckets' from the left-hand menu, and then 'create bucket' at the top of the page. Enter your bucket name (this MUST match the name in your DNS record, e.g. 'media').

Then, you need to ensure your bucket is readable to the public, so that others can see your uploaded media. To do this, click 'manage' on your newly created bucket, and then navigate to 'access rules'. Click 'add access rule', enter `*` as the prefix and set access to `readonly`.

### Configure your ship

Head over to Landscape and navigate to the S3 storage setup page at System preferences > Remote Storage, and enter your domain (with protocol) under endpoint, e.g. `https://s3.example.com`. Enter your username and password from step 1 under access key and secret, and then enter the name of the bucket. When the bucket name is combined with the endpoint, you get your bucket URL e.g. `https://media.s3.example.com`.

You can also configure these settings through dojo as shown [here](/manual/os/s3).

### That's it!

You should now be able to upload content using your self-hosted MinIO installation.

Once your S3 config is added, you should see a paperclip icon next to the message input in your chats. Media can be uploaded and posted by clicking here.

## Troubleshooting

Landscape chat will fail silently if it cannot connect to your S3 endpoint to upload media. To get an idea of what's going wrong, open the network tab of your browser dev tools, and observe the request when you try and upload media. You should see a failed request, hopefully with an error code or reason for failure.

- If you see a `mixed-content` error, this means that not every part of the set up is using TLS. Most browsers will refuse to load non-HTTPS content from a secure page.
- If you see a `502 Bad Gateway` error, caddy is unable to reach your MinIO installation. Check MinIO is running and your `reverse_proxy` URLs are correct.
- If you get a `Permission denied` error, it's likely that your bucket endpoint is incorrect. Ensure that you passed the `MINIO_DOMAIN` variable when running MinIO - otherwise it will default to using the path URL format, which Urbit does not support.

A good way to test your setup is to `curl` your S3 bucket endpoint (not your root S3 endpoint) and see what response you get. For example, if we have a bucket named 'media':

```
curl https://media.s3.example.com
```

You should get an XML response listing the contents of your bucket.

## Running MinIO and Urbit on the same machine

You may wonder how it's possible to run Urbit alongside our MinIO set up if they both need ports 80/443. The answer is to proxy Urbit through caddy, exactly the same way as MinIO. You can create as many directives in your Caddyfile as needed, each pointing to a different port.

For example, you could have 3 domains:

- `ship-name.example.com` - proxy to port 8080 where Urbit is running,
- `console.s3.example.com` - proxy to port 9001 where your MinIO admin is running, and
- `media.s3.example.com` - proxy to port 9000 where your MinIO bucket is accessible

Currently, there is no way to specify the HTTP port Landscape runs on (unless you are running the `urbit-king` binary), but if 80 is not available at start-up it will try 8080 next. So start caddy first, and when you boot your ship it should detect that port 80 is in use and use 8080 instead.

If you are running the `urbit-king` binary, then you can specify the HTTP port with the `--http-port` option.
