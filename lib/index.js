import React, { createContext, useContext, useState } from 'react'; // eslint-disable-line
import assert from 'assert';

import { createScope } from './scope';

const _roles = Symbol('@@roles');
const _namespace = Symbol('@@roles_ns');

class _AccessRoles {
    constructor() {
        this[_namespace] = {};
        this[_roles] = {};

        this.getRole = this.getRole.bind(this);
        this.createRole = this.createRole.bind(this);
        this.setRank = this.setRank.bind(this);
        this.setPermissions = this.setPermissions.bind(this);

        this.createRole({ name: 'default' });
    }

    getRole(name) {
        return this[_namespace][name];
    }

    createRole({ name, permissions = [], rank = 0 }) {
        if (this[_namespace][name]) return null;

        const ROLE = Symbol(name);

        this[_namespace][name] = ROLE;
        this[_roles][ROLE] = { name, permissions, rank };

        return ROLE;
    }

    setRank({ role, rank }) {
        const ROLE = this.getRole(role);

        this[_roles][ROLE].rank = rank;
    }

    setPermissions({ role, permissions }) {
        const ROLE = this.getRole(role);

        this[_roles][ROLE].permissions = this[_roles][ROLE].permissions.concat(permissions);
    }
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
        Restricted: createScope(_AccessRoles, accessLevel),
    };
}
