# react-use-access-control 🔒
`react-use-access-control` is a lightweight access control layer. With it, you can:

* Classify your users under specific groups, like `ADMIN`, `USER`, and `GUEST`
* Restrict specific parts of your app to only the users you intend
* Assign permissions to your users, and protect parts of your app from users who don't have the right ones

## Getting started
(If you're reading this at this point, this package is __not__ published anywhere and is still undergoing testing. I'm glad you somehow found this page before I decided to publish, though.)

### Installation
npm:
```bash
npm install react-use-access-control
```

Yarn:
```bash
yarn add react-use-access-control
```

### Usage
Before we start using this package in our React code, we should first define a few access roles:

```js
/* roles.js */
import { AccessRoles } from 'react-use-access-control';

export const ADMIN = AccessRoles.createRole({ name: 'admin' });
export const USER = AccessRoles.createRole({ name: 'user' });
export const GUEST = AccessRoles.createRole({ name: 'guest' });
```

Once we've done that, we're free to start using these roles throughout our application. Here's a basic example:

```js
/* login.js */
import React from 'react';
import useAccessControl from 'react-use-access-control';

import { USER, GUEST } from './roles';
import LoginForm from './LoginForm';
import LogoutButton from './LogoutButton';

export default function Login(props) {
    const { currentAccessLevel } = props;
    
    const { Restricted } = useAccessControl({ level: currentAccessLevel });

    return (
        <div>
            <Restricted to={GUEST}>
                <LoginForm />
            </Restricted>

            <Restricted to={USER}>
                <LogoutButton />
            </Restricted>
        </div>
    )
}
```

When the user sees the `Login` page above, they will only be able to see a `LoginForm` component if their current access level is `GUEST`. Otherwise, such as when they're already logged in as a `USER`, they will see the `LogoutButton` component.

For more examples and use cases, please see the API section below!

## API

Coming soon 😎
