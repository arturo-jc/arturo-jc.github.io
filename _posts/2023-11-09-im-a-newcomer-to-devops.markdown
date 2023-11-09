---
layout: post
title:  "I'm a newcomer to DevOps. Here's how ChatGPT helped me deploy my full stack application to Google Kubernetes Engine over the weekend"
date:   2023-11-08 16:04:39 -0600
categories: devops
excerpt: Last week, I deployed an application to Google Kubernetes Engine with the help of ChatGPT-you can find it here. I was very impressed with the quality of ChatGPT's assistance, so I decided to write a short post describing my experience in some detail.
titleInToc: false
toc:
    - title: "Prior DevOps Experience"
      id: "prior-devops-experience"
    - title: "Overview"
      id: "overview"
    - title: "Writing Build Scripts"
      id: "writing-build-scripts"
    - title: "Containerizing My Applications"
      id: "containerizing-my-applications"
    - title: "Creating, testing out and debugging deployments and services in Minikube"
      id: "creating-testing-out-and-debugging-deployments-and-services-in-minikube"
    - title: "Setting Up Google Cloud SDK"
      id: "setting-up-google-cloud-sdk"
    - title: "Seeding My Database"
      id: "seeding-my-database"
    - title: "Securing My Application with HTTPS"
      id: "securing-my-application-with-https"
---

Last week, I deployed an application to Google Kubernetes Engine with the help of ChatGPT--you can find it [here](https://stepbystepstrength.com/dashboard). I was very impressed with the quality of ChatGPT's assistance, so I decided to write a short post describing my experience in some detail.

## Prior DevOps experience

I said I was a newcomer to DevOps. But how much of a newcomer, exactly? Prior to this, I had deployed three applications to Heroku, and one to Netlify. I was familiar with environment variables. I knew some basic Docker commands, and I had a basic understanding of the core Kubernetes concepts: clusters, nodes, pods, deployments and services. I completed the [Hello Minikube tutorial](https://kubernetes.io/docs/tutorials/hello-minikube/). I have played around the Google Cloud Console. So, while I was not an *absolute* newcomer, this was well beyond my comfort zone.

## Overview

I would divide the process of deploying my application into the following stages:

- Writing build scripts
- Containerizing my applications
- Creating, testing out and debugging deployments and services in Minikube
- Setting up Google Cloud SDK
- Seeding my database
- Securing my application with HTTPS

When I talk about "deploying" my application, I am using the word in an overly wide sense--I suppose some of these are not really part of deployment.

## Writing build scripts

My backend is a Node.js server written in TypeScript. Since Node.js cannot execute TypeScript, TypeScript applications generally require a "build step" where all your code is compiled into JavaScript before it can be executed. Usually, this involves running the `tsc` command to tell the TypeScript compiler to compile your TypeScript code. This needs to be done any time the source code changes.

As you can imagine, this gets old pretty fast when you are actively developing an application, which is why I use [`ts-node`](https://typestrong.org/ts-node/) for development. Since I cannot use `ts-node` in production, that means I needed separate `npm` scripts for development and production.

So, my first task before I could deploy my application was to write a `build` script.

This is where I encountered my first two problems.

When you compile TypeScript into JavaScript, the resulting JavaScript is placed in a different directory of your choosing. Since the structure of your output directory (typically `/dist`) perfectly mirrors the structure of your input directory (typically `/src`), this usually causes no issues, *except when your code uses relative paths for file imports*. Once your code is compiled and placed into the `/dist` directory, these paths may still be pointing to the `/src` directory. Learned that the hard way!

The second problem happens when your codebase contains files that are not written in TypeScript. Since my backend has a GraphQL API, my codebase contains a number of `.graphql` files. The problem is that when you run `tsc`, *the TypeScript compiler does not copy non-TypeScript files to the output directory*. Therefore you need to add another command to your `build` script--in my case, `cp src/**/*.graphql dist/`

While I could have solved both problems on my own, this was nevertheless a place where ChatGPT really shined, successfully diagnosing both problems in one or two prompts, accelerating a process that would have otherwise taken me at least twice as long.

## Containerizing my applications

The functioning of your application should not depend on the peculiarities of the environment where it's deployed. When deploying your application to production, therefore, you want to run your application as a **container**. This involves creating a *container image*, which is a standalone, executable package that contains everything you need to run your application. You need a container image for every part of your application--in my case, my frontend and backend.

To create a container image, you want to write something called a "Dockerfile", which is a set of instruction that tells the Docker Engine how to build a container image for your application. 

This is where I ran into one of the hardest problems I dealt with. I used Angular to build my frontend. Once Angular compiled my application into a bunch of static files, I needed something else to serve those static files. ChatGPT recommended Nginx. However, getting Nginx to work with my frontend as a container was way harder than I was expected.

The difficulty was compounded by two decisions I made: (1) Nginx had to proxy requests to `/api` to my backend, (2) when building my Angular application, I used the `--base-href /app` flag because I was originally wanted to serve my application from the `/app` subpath in order to reserve the root for a static landing page for SEO purposes. The latter ended up being so difficult that I decided to scrap that idea.

This being my first time working with Nginx, ChatGPT's help proved invaluable. It actually felt like teamwork. It was surreal. We created a configuration file for Nginx, and when that wasn't working, we simplified our configuration with the goal of expanding on that once we had a working baseline, each of us suggesting various changes.

I say this felt like teamwork partly because I didn't just blindly follow ChatGPT's advice. When I first raised the issue that Nginx was not serving my Angular app, ChatGPT suggested that I `exec` into the Docker container and make changes to the configuration from there. I thought this was a bad idea, so I pushed back:

> ChatGPT: [...] Once you've made these changes to your Nginx configuration inside the Docker container, you should be able to access any Angular route directly and have your API requests proxied correctly to your backend server.
> 
> Arturo: Excellent. However, you said to make these changes to my Nginx configuration inside the Docker container. I do not currently have an Nginx configuration file in my frontend. I understand I can go into the container in interactive mode, but that seems inconvenient. Is there a way I can just add an Ngnix configuration file to my application prior to containerizing?
> 
> ChatGPT: Yes, you can provide a custom Nginx configuration from outside the Docker container, which is a common and recommended practice. This approach ensures that your Nginx configuration is version controlled and can be easily replicated across different environments.
> 
> Here's a step-by-step guide to doing this: [...]

## Creating, testing out and debugging deployments and services in Minikube

Once I had container images for all parts of my application, the next step was to create Kubernetes Deployments and Services, which is normally done by writing a Kubernetes manifest for each Service or Deployment.

Each Deployment manifest references an image of some part of your application-for instance the frontend or the backend. When you use the manifest to create the desired Deployment, the container runtime pulls the image from a given registry and creates a container.

ChatGPT pretty much wrote all my manifests for me. It also taught me how to use Minikube to test out the resulting Services and Deployments. While the container runtime normally pulls the specific image from a remote registry, Minikube has a local image registry. You can create and store an image to this registry. When you create a Kubernetes Deployment in Minikube that references that image, Minikube's container runtime will then fetch the image *directly from the local registry*.

This makes it super convenient to test out Deployments, as you do not need to push your images to a remote registry before you can use them in your pods.  You can just build them directly on Minikube. To do this, all you have to do is run `eval $(minikube docker-env)`. This executes a number of `export` commands that point your Docker client to the Docker daemon inside the Minikube virtual machine. Since the docker client is not pointed to Minkube's Docker daemon, when you later run `docker build -t some-image .`, *the image will be stored to Minikube's local registry*. Pretty neat!

This was definitely one of the hardest parts of the process of me, and I spent a ton of time `exec`-ing into various pods to debug various issues. Again, I was very glad to have ChatGPT by my side for this.

## Setting up Google Cloud SDK

This was a breeze with ChatGPT's intructions. No difficulties.
## Seeding my database

For development purposes, I wrote a `seed` script that seeds the database with the initial data that the application needs to function. However, I assumed this approach would not work in production. Since my backend uses TypeORM to query the database, which has support for [migrations](https://typeorm.io/migrations), I asked ChatGPT to help me re-write my seed script into a migration. However, ChatGPT talked me out of this by pointing out that migrations are not intended for seeding, but for schema changes. Instead, it taught me to use Kubernetes Jobs to execute my original `seed` scripts (with some modifications suggested by ChatGPT, such as making my script idempotent).

## Securing my application with HTTPS

This was *by far* the most difficult part of the process. Just about everything went wrong the first time around. Not coincidentally, it was also the part of the process ChatGPT was the *least* useful at. 

To secure my application, ChatGPT suggested I install `cert-manager`, which is a Kubernetes add-on that manages TLS certificates from various sources. My problems started the moment I tried to install `cert-manager`. The first problem was that I deployed my application to a GKE Autopilot cluster. As the "autopilot" name suggests, Google completely manages the cluster, and therefore will not let you create any resources in the `kube-system` namespace. If you use `helm` to install `cert-manager`, however, `helm` will, as part of the installation process, try to create a number of resources in the `kube-system` namespace. Instead of giving you an error message like--I don't know, "failed to create resource"--the installation will simply fail a 5-minute startup check with the very helpful message:  "failed post-install: timed out waiting for the condition".

As detailed in [this issue](https://github.com/cert-manager/cert-manager/issues/3713), the solution is to use the flag `--set global.leaderElection.namespace=cert-manager`,  which tells `helm` to use the `cert-manager` namespace instead of the `kube-system` namespace.

The other problem was a boostrapping, or "chicken and egg"-kind of problem where my Ingress controller was not setting my IP correctly because it was missing a valid certificate, but because the IP wasn't set correctly, requests to the challenge URL that generates a valid certificate never reached the intended service, and the certificate was never generated! As suggested [here](https://github.com/kubernetes/ingress-gce/issues/733), the solution was simply to update to a more recent version of `cert-manager`.

This goes to show that as amazing as ChatGPT is, it is still not a full substitute for plain old Google, as otherwise I would not have found the solution to either of these issues.

