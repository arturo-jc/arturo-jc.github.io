---
layout: post
title:  "Making my first Express app"
date:   2021-12-06 16:04:39 -0600
categories: express
excerpt: Two weeks ago, I completed Colt Steele’s web dev bootcamp and set out to build my own app applying what I learned. Here are the results...
toc:
    - title: "Express"
      id: "express"
    - title: "EJS"
      id: "ejs"
    - title: "Mongoose"
      id: "mongoose"
---

Two weeks ago, I completed Colt Steele’s web dev bootcamp and set out to build my own app applying what I learned. Here are the [results](https://tidybuddy.herokuapp.com/), and here's the [repository](https://github.com/arturo-jc/TidyBuddy)

(This is part of my larger plan to teach myself web development by doing one largeish project after each course I complete. Next up, Brad Traversy’s React Front to Back).

Anyway, this time I made a point to write down each thing I learned as I worked on my project. Looking at my list, it may be broken down into three big topics:

- Express
- EJS
- Mongoose

## Express
One of the big things I learned about Express was how to handle errors in a more organized way—how to divide the labor between controllers, middleware and error-handler.

In Colt Steele’s course, I learned how to use middleware to perform some basic checks—is the user logged in? Does the user own the resource in question? I copied this basic pattern, but at one point I found myself performing simple checks in the controllers themselves—for instance, checking if two passwords matched. I did this out of convenience—the logic was simple and didn’t reduce readability. I was both throwing errors and *handling* those errors in the controllers themselves—flashing and redirecting the user in some cases, calling next on the error in others. I was also handling errors directly in my middleware—again, flashing/redirecting in some middleware functions, calling next in others. But then I realized this was probably not a good idea in the long run.

So, what did I do? I delegated *all* authorization checks to my middleware, and used my controllers exclusively for interacting with the DB and rendering templates—no errors thrown in my controllers. And then I moved *all* the error handling—all the decision-making as to how to handle this or that error—from my middleware to my… well, error-handler.

This involved some creativity. When I was handling errors and failed checks directly in the controllers, this was easy—I could simply flash and redirect right from the controller, for instance. Now I had to tell the error-handler what to do with a given error via the middleware. How do I tell the error-handler that I want certain errors flashed and others rendered?

To do this, I adapted a technique I learned from Colt Steele. Following Steele, I defined an `ExpressError` class that extends `Error` and has `message` and `statusCode` parameters, except I added an optional `name` parameter. Then I used this `name` parameter to communicate from my middleware to my error-handler how I wanted each error handled. So, for instance, some middleware functions would throw an `ExpressError` and pass in "AuthorizationErrorFlash" as its name, others would pass "AuthorizationErrorRender", and my error-handler would handle them accordingly. Then, when I wanted an authorization error in a given route to result in a flash message, I would simply pass in the appropriate middleware to the route in question. If I change my mind later on, it’s as easy as passing in a different middleware.

The other big thing I learned about Express was how to pass data directly from one controller to another—without the use of the DB.

Here’s the problem I faced. My dashboard template contains a feed. Inside the feed there can be many activities. Each activity has a comment section that’s hidden by default. The user can decide to open the comment section and post a comment, at which point the page refreshes, which means all comment sections are again hidden by default. That’s bad user experience. If you post a comment, you want to see it right away. So whenever a user posts a comment, I had to render the template in such a way that all comment sections are hidden by default *except for* whichever activity the user just commented under.

How do you do that? The first part was easy. From my `showHousehold` controllers which renders the dashboard, pass in a string to an `activityId` parameter in `res.render`, then when you’re rendering the comment sections below each activity, use EJS to include a “hidden” class if and only if the activity’s ID matches whatever string you passed as `activityId`:

{% highlight ejs %}
    <div class="comment-section <%= activity._id.toString() === activityId? '' : 'hidden' %>">
{% endhighlight %}

The problem is, how do I get the ID of whichever activity the user just commented under? Well, comments are created in my `createComment` controller, so that’s where the ID had to come from.

One option would have been to render the dashboard right from the `createComment` controller, but that wasn’t a good idea. There’s a good deal of logic that goes into rendering the dashboard, so rendering it from both `showHousehold` and `createComment` would have resulted in a lot of duplication.

Rather than rendering, I had to redirect the user to my show household route so that my `showHousehold` controller could carry out all that logic, but I had to somehow pass the activity ID from `createComment` over to `showHousehold`.

How do you do that? My solution was to pass it as a query string. Then I could simply catch the activity ID in `showHousehold` and pass it to `res.render` so that my app knows which comment sections to display and which to hide.

## EJS
Two big things, which are probably going to strike experienced users as quite basic.

At one point, I needed to call a function that calculates the first day of the current week inside an EJS template. But I didn’t want to *define* the function inside the template—I didn’t want to clutter the template. Besides, I may need that function again in a different template. So, I learned that if you have some reusable JS code, you can always move it all to its dedicated EJS file, then include that file where needed. Handy!

Another problem I faced was I wanted to loop over an array and create a todo-item for each element of the array. Since I wanted to reuse this code, I created a dedicated `item.ejs` partial I could include in different places. First, I tried:

{% highlight ejs %}
    for (let item of items){
        <%- include("./item") %>
    }
{% endhighlight %}

Bad news: item is undefined in `item.ejs`. Good news: the solution was not too far off. After a bit of googling, I discovered you can simply pass arguments to template parameters (such as item) by putting them inside an object and passing that object to `include`, so I made a new `items.ejs` partial and did:

{% highlight ejs %}
    for (let item of frequentItems){
        <%- include("./items", {items: frequentItems}) %>
    }
{% endhighlight %}

Now I can use the same `items.ejs` partial and just pass different arrays into the items parameter. Neat!

## Mongoose
This is probably the topic I learned the most about.

The most important thing I learned was probably populating a document several levels deep.

In my app, every user should belong to a household. In order to render the dashboard, the user’s household document needs to be *fully* populated—every field and subfield.

My household documents have an `activityTypes` field, which is meant to store an array of activity type documents. Easy enough to populate:

{% highlight javascript %}
    const household = await Household.findById(householdId)
        .populate("activityTypes")
{% endhighlight %}

Problem is, activity type documents have a `completedBy` field, which is meant to store an array of activity documents. That needs to be populated as well. No big deal:

{% highlight javascript %}
    const household = await Household.findById(householdId)
        .populate({
            path: "activityTypes",
            populate: { path: "completedBy" }
        });
{% endhighlight %}

So far, so good. But activity documents have a `user` field that itself needs to be populated. And that’s how I ended up with this monstruous-looking thing:

{% highlight javascript %}
    household = await Household.findById(householdId)
        .populate({
            path: "activityTypes",
            populate: {
                path: "completedBy",
                populate: { path: "user" }
                }
            });
{% endhighlight %}

The second big thing I learned was how to delete subdocument arrays.

In addition to the `user` field mentioned above, my activity documents also have a `comments` field, which is meant to store an array of—you guess it—comment documents. When an activity is deleted, there is nowhere for its comments to go, and so those comments should be automatically deleted along with it.

Turns out Mongoose middleware is tailor-made for this. All I had to do was plug this in to my activity schema:

{% highlight javascript %}
    ActivitySchema.post("findOneAndDelete", async function (activity) {
        if (activity) {
            await Comment.deleteMany({ _id: { $in: activity.comments } })
        }
    });
{% endhighlight %}

This tells Mongoose that if it deletes an activity, it should also delete all comments whose Id is included in the activity’s comments field, which is just what I wanted.

The third big thing I learned about Mongoose is how to delete “dead” references from documents. Here’s what I mean.

My household documents have a `users` field, which is meant to store an array of user documents. Except it doesn’t actually store the documents inside the array—instead, it stores a *reference* to each document that Mongoose uses to fetch the documents in question.

The problem is that when you delete a user document from the DB, the reference is not deleted from the users array. The array now contains a reference to a document that no longer exists. This is what I meant by a “dead” reference. This doesn’t cause problems in my limited experience, but I don’t like it all the same.

Since Mongoose wouldn’t automatically remove these references for me, I had to learn how to do it myself. So now when I delete a user in my `deleteAccount` controller, I call:

{% highlight javascript %}
    await Household.updateMany(
        { users: user },
        { $pull: { users: user._id } }
    );
{% endhighlight %}

In a StackOverFlow thread, someone suggested to use Mongoose middleware for this purpose. However, I ran into circularity issues when I tried this approach (I was requesting two models into each other and using them to define each other). For all I know, it may be possible to get around this problem, but I didn’t keep trying as I was satisfied with the solution above.

The last Mongoose thing I learned was this. In my app, a user can request to join a household. When a user makes a request, I want to push the user into the household’s `pendingRequests` field, but *only if the user is not already in the field in question* (no point adding them twice over!)

I spent an embarrassing amount of time searching how to perform this kind of logic with Mongoose’s `findByIdAndUpdate` method, but it was worth it in the end because I learned about Mongo’s `$addToSet` operator, which does exactly what I wanted:

{% highlight javascript %}
    await Household.findByIdAndUpdate(householdId,
        {
            $addToSet: { pendingRequests: req.user }
        }
    );
{% endhighlight %}

One last thing that’s not exactly about Mongoose, but about a Mongoose plugin. For authentication, I used `passport` in conjunction with `passport-local-mongoose`. What the last package does is it adds a number of methods to your `User` model. You can use these methods to create and pass a strategy to `passport` like so:

{% highlight javascript %}
    passport.use(new LocalStrategy(User.authenticate()));
{% endhighlight %}

(`LocalStrategy` comes from a further package called `passport-local`—more about it in a moment).

However, I did not like the way `passport-local-mongoose` handles authentication by default. It fetches the user by username. I didn’t like that. Fortunately, you can tell `passport-local-mongoose` to use email instead:

{% highlight javascript %}
    UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });
{% endhighlight %}

However, this is still not going to work—and this took me an embarrassingly long time to figure out. As I said, what this plug in does is add methods to your User model that you can then use to create and pass a strategy to passport. One of those methods is .authenticate, which works just fine if you’re happy with the way `passport-local-mongoose` handles authentication by default. But if you want it to use email instead (like I told it to above), you need to use a different method called `.authenticate` like so:

{% highlight javascript %}
    passport.use(User.createStrategy());
{% endhighlight %}

Notice I am no longer relying on `LocalStrategy`, which means I no longer need to require `passport-local`.

And that’s it for now.

Until next time!
