# UserStack

![](https://badgen.net/badge/version/0.1.2/blue)
[![License](https://img.shields.io/github/license/ArthurBeaulieu/UserStack.svg)](https://github.com/ArthurBeaulieu/UserStack/blob/master/LICENSE.md)

This template provides a basic user system built with Node.js, Express Js and MongoDB.

It provides a public homepage (that do not require a registered user), a registration and login process, a private homepage for registered users, and an admin panel.
The registration process is guided by the following rules :

- a new user must provide an invitation code from an already registered user ;
- the new account must be activated using a link sent by email.

App administrators can also fine tune the registration process by modifying the auth configuration in `back/config/auth.config.js` :

```javascript
config = {
  secret: 'userstack-secret-key', // Secret key used to hash things (token etc)
  adminCode: 'GGJESUS', // The invitation code to provide for the first user to register
  passwordLength: 8, // The minimal password length expected
  maxDepth: 2, // The maximum depth of users from first account
  tokenValidity: 86400, // Tokens validity in seconds
  saltRounds: 8 // The amount of salt rounds to use when hashing passwords
}
```

Since registration are restrained using an invitation code, users are linked to each other like a user genealogy. The root account is at depth 0, while all the user it will invite using its code will be at depth 1 etc. The maximum depth restrain the registration process ; users that have reached this maximum depth will not have any invitation code.

Users are assigned with roles : admin and user. The admin role grant access for the admin page, while the user role grant access to all the private pages except the administration ones.

# Get started

To make it work on your environment, please rename `.env.example` to `.env` and fill all the required information in it.

You must first ensure you've created a MongoDB user that match the content you'll fill in the `.env` file. You must also ensure that the MongoDB service is running before starting the server.

In order to allow registration with confirmation link sent to new users by email, you must fill a smtp provider, and an associated account in this `.env` file as well.

# Available routes

### Public routes (doesn't require a registered user) :
- `/` is the public homepage of the app
- `/login` is the classical login form
- `/register` is the classical register form
- `/verify/:email/:token` link sent by mail used to verify an account

### Private route for users with user role :
- `/register/activate` is the page that send an activation link by email
- `/home` is the private homepage for registered users
- `/profile` is the page that summarizes the user information
- `/profile/edit` is the page for users to change their information and password
- `/logout` to clear the client session

### Private routes for users with the admin role :
- `/admin` is the administration homepage
- `/admin/users` is the users listing with an option for admin to delete them

# Available API

### Exposed API for non-registered/non-logged users :

### `/api/auth/login` `POST`
```javascript
payload = {
  username: username, // Either username or email
  password: password // Associated password
}
```

### `/api/auth/register` `POST`
```javascript
payload = {
  username: username,
  email: email,
  code: code, // The invitation code of an already registered user
  pass1: password,
  pass2: password
}
```

### Exposed API for registered users with user role :

### `/api/user/update/info` `POST`
```javascript
payload = {
  username: newUsername,
  email: newEmail
}
```

### `/api/user/update/password` `POST`
```javascript
payload = {
  pass1: oldPassword,
  pass2: newPassword,
  pass3: newPassword
}
```

### `/api/user/delete` `GET`
The user wants to remove its account

### Exposed API for registered users with the admin role :

### `/api/user/delete` `POST`
```javascript
payload = {
  userId: userId // The user ID to delete from database
}
```

### `/api/user/update/role` `POST`
```javascript
payload = {
  userId: userId, // The user Id to modify roles from
  roleId: roleId, // The role ID to assign/revoke
  checked: true // Grant or not role to user
}
```