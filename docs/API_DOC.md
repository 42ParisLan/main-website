<!-- 42 logo -->

# How to use this API

## Create an application

In order to use this API, you need to create an application. To do this go to the [applications page](http://localhost:8080/applications) and click on the "Create Application" button. Fill in the form and click on the "Create" button.

### Details

- **Name**: The name of the application.
- **Description**: A description of the application.
- **Redirect URLs**: The URLs to redirect to after authentication.
- **Roles**: The roles that the application can have. **Note**: The roles are only available for 42's staff.

## Authentication

To authenticate a user, you need to redirect them to the following URL:

```txt
http://localhost:8080/auth?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI
```

Replace `YOUR_CLIENT_ID` with the client ID of your application and `YOUR_REDIRECT_URI` with the redirect URI of your application.

## Get user information

To get the information of the authenticated user, you need to make a GET request to the following URL:

```txt
http://localhost:8080/api/openid/userinfo
```

You need to include the `Authorization` header with the value

```txt
Bearer YOUR_ACCESS_TOKEN
```

Replace `YOUR_ACCESS_TOKEN` with the access token you received after authenticating the user.
