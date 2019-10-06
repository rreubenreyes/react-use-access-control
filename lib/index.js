import React, { createContext, useContext, useState } from 'react'; // eslint-disable-line
import assert from 'assert';

import { createScope } from './scope';

function _AccessRoles() {
    this.namespace = [];
    this.roles = {};

    this.createRole = ({ name, permissions = [], rank = 0 }) => {
        if (this.namespace.includes(name)) return null;

        const ROLE = Symbol(name);

        this.namespace.push(name);
        this.roles[ROLE] = { name, permissions, rank };

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

    this.setRank = ({ role, rank }) => {
        const ROLE = this.getRole(role);

        this.roles[ROLE].rank = rank;
    };

    this.createRole({ name: 'default' });
}

/* AccessRoles singleton/"global" to be bound at runtime */
export const AccessRoles = new _AccessRoles();

/* Context to be used by source code */
export const AccessContext = createContext(AccessRoles.getRole('default'));

/* Main context hook */
export default function useAccessControl({ level }) {
    assert(level instanceof _AccessRoles, 'Must specify a valid access level when using useAccessControl');

    const [accessLevel, setAccessLevel] = useState(level);

    const requiredAccessLevel = useContext(AccessContext);

    return {
        accessLevel,
        requiredAccessLevel,
        setAccessLevel,
        Restricted: createScope(AccessRoles, accessLevel),
    };
}
