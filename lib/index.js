import React, { createContext, useContext, useState } from 'react'; // eslint-disable-line

import { createPermissionScope, createRestrictedScope } from './scope';

function _AccessRoles() {
    this.namespace = [];
    this.roles = {};

    this.createRole = ({ name, permissions }) => {
        if (this.namespace.includes(name)) return null;

        const ROLE = Symbol(name);

        this.namespace.push(name);
        this.roles[ROLE] = { name, permissions };

        return ROLE;
    };

    this.getRole = (name) => Object
        .getOwnPropertySymbols(this.roles)
        .filter((sym) => {
            const accessor = sym.toString().split('(')[1].split(')')[0];

            return this.namespace.includes(name) && name === accessor;
        });

    this.setPermissions = ({ role, permissions }) => {
        const ROLE = this.getRole(role);

        this.roles[ROLE].permissions.concat(permissions);
    };
}

/* AccessRoles singleton/"global" to be bound at runtime */
export const AccessRoles = new _AccessRoles();

/* Context to be used by source code */
export const AccessContext = createContext(null);

/* Main context hook */
export default function useAccessControl({ level }) {
    const [_accessLevel, setAccessLevel] = useState(level);

    const requiredAccessLevel = useContext(AccessContext);

    return {
        accessLevel,
        requiredAccessLevel,
        setAccessLevel,
        Restricted: createRestrictedScope(accessLevel)
        Protected: createPermissionScope(accessLevel)
    };
}
