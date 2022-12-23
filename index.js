/*
This API was tested using Postman for HTTP Requests.
The variable 'items' is used to persist data during testing and is destroyed on application refresh.
The variable 'users' is used to persist user data during testing and is destroyed on application refresh.
Although this is a simple API, using a development environment database would be more sufficient
and accurate for testing.
In a development environment, the users will also be authenticated and authorized.
*/
const express = require("express");

const app = express();
const PORT = 3000;
app.use(express.json());

let items = [];
let users = [];
let user = undefined;

app.get('/', (req, res) => {
    res.status(200).json({ message: "Welcome to the To-do list API. Please sign in with the /login/[username] endpoint" });
});

// return the current user
app.get('/user', (req, res) => {
    if (!user) {
        return res.status(401).json({ status: "Not authorized, please sign in." });
    }
    res.status(200).json({ username: user.username });
});

// get all tasks under the current user
app.get('/tasks', (req, res) => {
    if (!user) {
        return res.status(401).json({ status: "Not authorized, please sign in." });
    }
    const userTasks = items.filter(task => task.userId === user.userId);
    res.status(200).json({ tasks: userTasks });
});

// get a specific task under the currrent user
app.get('/tasks/:taskId', (req, res) => {
    if (!user) {
        return res.status(401).json({ status: "Not authorized, please sign in." });
    }
    const requestedTaskId = parseInt(req.params.taskId);
    const requestedTask = items.find(task => task.id === requestedTaskId);
    if (!requestedTask) {
        return res.status(404).json({ id: requestedTaskId, status: "Task not found." });
    } else {
        res.status(200).json({ task: requestedTask })
    }
});

// simple user signout functionality
app.get('/signout', (req, res) => {
    if (!user) {
        return res.status(401).json({ status: "Not currently signed in, please sign in." });
    }
    res.status(200).json({ status: "Successfully logged out" });
    user = undefined;
});

// user login functionality to add, change, or delete tasks
app.post('/login/:username', (req, res) => {
    const requestedUser = req.params.username;
    user = users.find(user => user.username === requestedUser);
    if (!user) {
        user = {
            username: req.params.username,
            // generate a user ID
            userId: Math.floor(Math.random() * 100)
        };
        // add user to collection of users
        users.push(user);
    }
    res.status(200).json({ status: "Successfully logged in.", username: user.username });
});

app.post('/add', (req, res) => {
    if (!user) {
        return res.status(401).json({ status: "Not authorized, please sign in." });
    }

    // create task item with simulated ID for filtering
    const taskItem = {
        id: Math.floor(Math.random() * 1000),
        userId: user.userId,
        task: req.body.task,
        deleted: false,
    };
    items.push(taskItem);
    res.json(taskItem);
});

// update task with payload of json body
app.put('/tasks/:taskId/update', (req, res) => {
    if (!user) {
        return res.status(401).json({ status: "Not authorized, please sign in." });
    }

    // param :taskId is a string, needs to be parsed to a number
    const taskId = parseInt(req.params.taskId);
    const taskItem = items.find(task => taskId === task.id);

    if (!taskItem) {
        return res.status(404).json({ id: taskId, status: "Not found" });
    } else {
        items.map((task) => {
            if (task.id === taskId) {
                task.task = req.body.task;
            }
        });
        res.status(200).json({
            id: taskItem.id,
            userId: user.userId,
            task: req.body.task,
            deleted: taskItem.deleted
        });
    }
});

// soft deletion of task
app.put('/tasks/:taskId/delete', (req, res) => {
    if (!user) {
        return res.status(401).json({ status: "Not authorized, please sign in." });
    }

    // param :taskId is a string, needs to be parsed to a number
    const taskId = parseInt(req.params.taskId);
    const taskItem = items.find(task => taskId === task.id);

    // if taskItem is undefined, return a 404
    if (!taskItem) {
        return res.status(404).json({ id: taskId, status: "Not found" });
    } else {
        items.map((task) => {
            if (task.id === taskId) {
                task.deleted = !task.deleted;
            }
        });
        res.status(200).json({
            id: taskItem.id,
            userId: user.userId,
            task: taskItem.task,
            deleted: taskItem.deleted
        });
    }
});

app.listen(PORT, "localhost", () => {
    console.log(`Listening on localhost:${PORT}`);
});
