import React from 'react';
import isEqual from 'lodash.isequal';
import isPlainObject from 'lodash.isplainobject';

const isAllowed = (principal, resource, exact) => (
    exact
        ? isEqual(principal, resource)
        : resource.rank >= principal.rank
);

const hasPermissions = (method, principal, resource) => (
    resource[method]((permission) => principal.includes(permission))
);

export function createRestrictedScope(accessLevel) {
    return function Restricted({ to: requiredAccessLevel, exactly: exact, children }) {
        const allowed = <>{children instanceof Function ? children() : children}</>;

        if (Array.isArray(requiredAccessLevel)) {
            if (requiredAccessLevel.length) {
                throw new Error('Must specify a valid access level when using <Restricted />');
            }

            return requiredAccessLevel.reduce((view, level) => {
                if (!view) return null;
                return isAllowed(requiredAccessLevel, level, exact) && allowed;
            }, allowed);
        }

        if (typeof requiredAccessLevel !== 'string') {
            throw new Error('Must specify a valid access level when using <Restricted />');
        }

        if (!isAllowed(requiredAccessLevel, accessLevel, exact)) return null;

        return allowed;
    };
}

export function createPermissionScope(accessLevel) {
    return function Protected({ permissions, children, ...props }) {
        const allowed = <>{children instanceof Function ? children() : children}</>;

        if (Array.isArray(permissions)) {
            const method = props.requireAll ? 'every' : 'some';

            return hasPermissions(method, accessLevel.permissions, permissions)
                ? allowed
                : null;
        }

        if (isPlainObject(permissions)) {
            if (!Object.keys(permissions).includes(accessLevel.name)) return null;

            if (Array.isArray(permissions[accessLevel.name])) {
                const scope = permissions[accessLevel.name];
                const method = props.requireAll ? 'every' : 'some';

                return hasPermissions(method, accessLevel.permissions, scope)
                    ? allowed
                    : null;
            }
        }

        throw new Error('Must specify valid permissions when using <Protected />');
    };
}
