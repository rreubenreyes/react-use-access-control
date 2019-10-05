import React, { Fragment } from 'react';
import isEqual from 'lodash.isequal';
import isPlainObject from 'lodash.isplainobject';
import useAccessControl from '../index';

export function createRestrictedScope (accessLevel) {
    return function Restricted({ to: requiredAccessLevel, children }) {
        const allowed = <Fragment>{children instanceof Function ? children() : children}</Fragment>;

        if (Array.isArray(requiredAccessLevel)) {
            if (requiredAccessLevel.length) {
                throw new Error("Must specify a valid access level when using <Restricted />");
            }

            return requiredAccessLevel.reduce((view, level) => {
                if (!view) return null;
                return isEqual(requiredAccessLevel, level) && allowed;
            }, allowed);
        }

        if (typeof requiredAccessLevel !== "string") {
            throw new Error("Must specify a valid access level when using <Restricted />");
        }

        if (!isEqual(requiredAccessLevel, level)) return null;

        return allowed;
    };
}

function hasPermissions(method, principal, resource) {
    return resource[method](permission => principal.includes(permission));
}

export function createPermissionScope(accessLevel) {
    return function Protected({ permissions, children, ...props }) {
        const allowed = <Fragment>{children instanceof Function ? children() : children}</Fragment>;

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

        throw new Error("Must specify valid permissions when using <Protected />");
    };
}
