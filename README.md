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

export const ADMIN = AccessRoles.createRole({ name: 'admin', rank: 999 });
export const USER = AccessRoles.createRole({ name: 'user', rank: 2 });
export const GUEST = AccessRoles.createRole({ name: 'guest', rank: 1 });
```

Once we've done that, we're free to start using these roles throughout our application. Here's a basic example:

```js
/* login.js */
import React from 'react';
import useAccessControl from 'react-use-access-control';

import { ADMIN, USER, GUEST } from './roles';
import AdminPanel from './AdminPanel';
import LoginForm from './LoginForm';
import LogoutButton from './LogoutButton';

export default function Login(props) {
    const { currentAccessLevel } = props;
    
    const { Restricted } = useAccessControl({ level: currentAccessLevel });

    return (
        <div>
            <Restricted exactly to={ADMIN}> // Only `ADMIN`s can see this!
                <AdminPanel />
            </Restricted>
            
            <Restricted exactly to={GUEST}> // Only `GUEST`s can see this!
                <LoginForm />
            </Restricted>

            <Restricted to={USER}> // `USER`s can see this, but so can anybody with a higher rank!
                <LogoutButton />
            </Restricted>
        </div>
    )
}
```

When the user sees the `Login` page above, they might see one of the following things:

* If the user has the role `USER`, they would only see the `LogoutButton` component.
* If the user has the role `GUEST`, they would only see the `LoginForm` component.
    * _Only_ `GUEST`s will ever be able to see this component--note the use of the `exactly` prop.
* Only users of role `ADMIN` would see the `AdminPanel` component... 
    * _However_, `ADMIN`s can also see the `LogoutButton` component, because we defined their `rank` as `999`, which is higher than the required role of `USER`, which has a rank of `2`.


For more examples and use cases, please see the API section below!

## API

Coming soon 😎
