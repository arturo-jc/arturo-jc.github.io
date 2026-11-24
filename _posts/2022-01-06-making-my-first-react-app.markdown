---
layout: post
title:  "Making my first React app"
date:   2022-01-06 16:04:39 -0600
categories: react
excerpt: As I mentioned in my previous post, my plan for teaching myself web development is to build a largeish project after each course I complete. The last course I completed was Brad Traversy’s React Front to Back, and so around three weeks or four ago, I set out to build my first React app. Here are the results...
titleInToc: true
toc:
    - title: "The Big Picture"
      id: "the-big-picture"
    - title: "State"
      id: "state"
    - title: "Context, Reducers, and Actions"
      id: "context-reducers-and-actions"
    - title: "Next Steps"
      id: "next-steps"
---

As I mentioned in my previous post, my plan for teaching myself web development is to build a largeish project after each course I complete. The last course I completed was Brad Traversy’s React Front to Back, and so around three weeks or four ago, I set out to build my first React app. Here are the [results](http://groupreads.herokuapp.com/), and here is the [repo](https://github.com/arturo-jc/groupreads).

So, what did I learn making this project? Obviously, I learned the basics of React: how to create a component, how to import one component into another, etc. Too many things to list, to be honest. But the most valuable thing I learned, I think, is I got a big-picture sense of how React works. This is important because while Brad’s course spent a great deal of time on the nuts and bolts, he didn’t really say much about why use React in the first place, how React works, etc. (This is not meant as a criticism. I think Brad just assumes that if you’ve enrolled in his course, you already know why you want to use React.) Anyway, here’s the sense I got from building my own app. And as a disclaimer, what follows is just that: my current sense or understanding of the framework based on my limited experience with it. I’m sure my understanding will evolve as I get more practice.

## The big picture
One of my first impressions after using React is how long it takes to build an app. I’m sure a lot it can be chalked up to my own inexperience, but I suspect a lot of it has to do with the sheer amount of things that need to get done. For a full stack app like I made, you need to build both a backend and a frontend. It really feels like making two apps. So, why bother with React? Because your content is rendered a lot faster.

With traditional web applications, your server does double duty. It builds a user interface, and it does a bunch of other stuff such as talking to the database. Then it puts everything together, and sends a bunch of files (mainly HTML, CSS and JS) to the browser. And it does this pretty much every time it receives a request. So, every time your server receives a request, it sends a bunch of stuff back: it sends both instructions for how to render the UI, as well as the data the user needs.

The advantage of using React is you don’t need to send the instructions for rendering the UI every time. Your server sends these instructions once, and upon further requests, all it sends is the data the user actually needs to see. Basically, it delegates the rendering of the UI to the browser so it can focus on other tasks like talking to the database, and so it doesn’t have to keep sending instruction for rendering the UI. No need to keep sending a bunch of HTML, CSS and JS files every time! Just the data the user actually needs–things like strings, numbers, and dates depending on the application. That’s a lot less information that’s being sent from your server to your browser, which accounts for why React apps are faster.

## State
So, that’s the basic picture I got of React itself. Now for this application, I had to use something called **state**. Often you want a component to be rendered differently at different times. Simple example: when a user clicks on “Delete account”, you don’t want to delete the account right away (what if they clicked by mistake?). Rather, you want to display a confirmation modal or something like that. This modal component needs to be rendered differently at different times: by default, it should not be displayed at all, but it should be displayed if the user clicks “Delete account”. The way you do this in React is you give the component a state (such as `show`), which is basically just a variable that can take a number of values (in this case, `true` or `false`) and whose value can be updated as needed (in this case, set to `true` if the user click on “Delete account”).

Sometimes, only one component needs to have access to the state, but not always. For instance, I wanted both the navbar and the account page to display the user’s name, which I stored inside a user state. These are different components, so I needed two components to have access to the same user state. How do you do that? One way is to use **props**.

React components have something called props, which (if you are using functional components) are parameters where you can pass in values as arguments. React will then use these values to render the component differently depending on which arguments you passed–for instance, setting the modal’s display to `block` if you set `show` to `true` and `none` if you set it to `false`. Usually, you pass these props in the component’s parent component. So, if your modal is inside your account page, for instance, you might write something like this in `Account.js`:

{% highlight jsx %}
    <Modal show={show} />
{% endhighlight %}

Here, we are passing the value of the `show` state to the `Modal` component as a prop.

So, props are passed from parent to child. If that’s how we pass states, however, we may end up with long chains of passing where one state is passed from one component to its child, and then from the child to its *own* child, and so on until the state reaches the desired component. This is known as **prop drilling**, and it can get quite obnoxious, which is why we use context.

## Context, reducers, and actions
A context–and again, this is just my current, (possibly incomplete!) understanding–is basically a place where we store states that we then can access from anywhere within our app. There are different ways of implementing context, but I used a context manager called Redux.

Whenever we use states, we need a way of updating those states–setting a modal’s `show` state to `true` when the user clicks on “Delete account”, or setting `user` to `null` when they log out. If we’re *using component-level* state–basically, a state that only one component needs access too–this is quite easy to do. React comes with a built-in `useState` function which initializes a *state* variable to a `defaultValue` and simultaneously creates a corresponding `setState` function that we can then use to update the state in question:

{% highlight javascript %}
const [ show, setShow ] = useState(defaultValue)
{% endhighlight %}

This is all done from within the component that needs access to the state, and since we are dealing with component-level state, there is no need to pass it around.

If we are using *app-level state*–state that need to access from anywhere within our application–well, that’s a different story. If you use Redux like I did, you want to use something called **reducers**, whose sole purpose is to update your app’s state. However, you don’t want to call these reducers directly. Instead, you want to create something called actions, which are functions responsible for calling the reducers.

Why the extra step? Because, often, your app’s state is not the only thing that needs updating. If a user deletes a post, for instance, and you have your posts stored in your app’s state, then, of course, you want to update the state, but you also want to update the database. Otherwise, that pesky post will not really be gone–it will show up again on the next session.

So, often, you want to keep your state and your database in synch–and that’s where actions come in. Actions help you update your state and your database in parallel (or roughly in parallel). So, for instance, you might have a `deletePost` action which takes a post ID as an argument and makes a `DELETE` request to your server to tell it to delete the post from the database. Once the database is updated, your `deletePost` action can tell the reducer to delete the post from the state. So, `deletePost` is responsible for talking to both the database and the reducers, and this is how you can keep your database and state in synch.

One of the most important things I learned in this project was probably how to make efficient use of actions. And one point, I was using `deletePost` to update the database only. It would make a `DELETE` request to the server, but it wouldn’t tell the reducer to update the state. Instead, I called another action `getPosts`, which made a `GET` request to the server to fetch all the relevant posts. The server would send those posts back to my frontend, which would then call the reducers to update the state. Only then would my app’s state update. I then realized this was stupid because I was making two separate calls to my server, and because I was requesting a lot of unnecessary data. When a user deletes a post, all other posts remain unchanged and so I don’t need to get all posts–I already have most of them stored in the app, and most of them are up to date. To update the state, all I need is the one post that got deleted–and not even that, just the ID. As soon as I realized this, I switched to the correct approach: use the same action to update both the database and the state. No separate calls.

## Next steps
Well, I think that just about sums up the most important things I learned in making my first React app.

I now have three apps, only two more to go until I have a working portfolio. I have been so busy making apps that I have neglected my personal website, so this feels like a good time to take a breaking from app-making to give my website a little upgrading, putting to use everything I’ve learned so far.
