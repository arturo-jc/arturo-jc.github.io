---
layout: post
title:  "Making my first web app with flask"
date:   2021-10-21 16:04:39 -0600
categories: flask
excerpt: I just completed my first web application using Flask, so I thought it would be a good idea to write down some reflections on my experience while the project is still fresh in my mind...
---

I just completed my first web application using Flask, so I thought it would be a good idea to write down some reflections on my experience while the project is still fresh in my mind.

My goal for the app was to have the user create a template, set some parameters such as starting date and starting weights, then have the app automatically generate a workout program based on the values entered by the user. Figuring how to generate the program and enter it into the database took some trial and error, but things went more or less smoothly. The real challenge was figuring out how to display the program.

The way my application works, each program object has a number of child workout objects. In turn, each workout object has date and week attributes as well as a number of child exercise objects.

The desired functionality was to have the user select a program and a week, and display all matching workouts along with their corresponding exercises in a table, each column representing a different day of the week.

But how do you build such a table using Jinja (Flask’s templating language)? My first instinct was to build the table column by column. So, starting with the Monday column, I wanted to loop through the Monday workouts, and for each workout, create one cell for the workout’s name and one for each of its exercises, each cell sitting on top of the next. I wanted to create all these cells in the Monday column before moving on to the next column.

It turns out you cannot do this. In HTML, you cannot build a table column by column–you can only build it row by row. This is because you need to close each tag before you open the next. This meant that for each row, I had to create all cells within that row before moving on to the next.

So then I tried looping through all the workouts for the week, creating one row for each workout and one for each of its exercises. Inside each row, I created seven cells (corresponding to the seven days of the week) before closing the tag. If there was a workout scheduled for the corresponding day, the cell displayed the workout’s name or one of its exercises–otherwise the cell was blank.

This method works, but it results in a lot of wasted space. Suppose your program has only one workout on Monday and one workout on Tuesday–call them A and B. You would expect A and B to sit at the same level in the table. But that’s not what you get with this method. Instead, each workout get its own “level”–that is, each workout gets its own set of rows. So, you get one set of rows displaying A on Monday but nothing on Tuesday, and another set of rows below displaying B on Tuesday but nothing on Monday. That’s no good.

To get around these problems, I tried writing some convoluted Jinja code inside the HTML template before ultimately settling on a different kind of solution. The solution was to organize workouts into structures I called “layers” before passing them to the template. This approach is too convoluted to describe in any real detail here, but you can take a look at the solution if you search for “TABLE DATA” [here](https://github.com/arturo-jc/musqlo/blob/master/main.py).

So, what lessons can we draw from all this? I would say the main lesson is this. Even though you can use Jinja to write some logic inside the HTML template, you should really keep that to a minimum. Instead, you should stick all the logic inside your Flask application, and pass all the required data to the template in a format that makes it easy to work with inside the template.

This is something I first heard about in Angela Yu’s Python Udemy course, but doing this project really drove the point home.
