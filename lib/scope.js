/* eslint-disable import/prefer-default-export */
import React from 'react';
import assert from 'assert';
import isEqual from 'lodash.isequal';
import isPlainObject from 'lodash.isplainobject';

const BAD_ROLE = 'Must specify a valid access level when using <Restricted />';
const BAD_PERMISSIONS = 'Must specify valid permissions when using <Restricted />';

const isValidPermissionsArgument = (arg) => (
    arg === null
    || Array.isArray(arg)
    || isPlainObject(arg)
);

const validatePermissions = ({ incoming, required, requireAll }) => {
    const incomingPermissions = incoming.permissions;
    const requiredPermissions = Array.isArray(required)
        ? required.permissions
        : required[incoming].permissions;

    const method = requireAll ? 'every' : 'some';

    return incomingPermissions[method]((perm) => requiredPermissions.includes(perm));
};

const authorize = (opts, incomingRole) => {
    const {
        to: principalRole,
        exactly: requireExactRole,
        permissions: requiredPermissions = null,
        requireAllPermissions,
    } = opts;

    const hasRequiredRole = requireExactRole
        ? isEqual(principalRole, incomingRole)
        : incomingRole.rank >= principalRole.rank;

    if (!hasRequiredRole) return false;

    if (!requiredPermissions) return true;

    return validatePermissions({
        incoming: incomingRole,
        required: requiredPermissions,
        requireAll: requireAllPermissions,
    });
};

export function createScope(roles, accessLevel) {
    return function Restricted({ children, ...props }) {
        const {
            to: requiredAccessLevel,
            permissions = null,
        } = props;

        assert(isValidPermissionsArgument(permissions), BAD_PERMISSIONS);

        const hasRequiredAccess = authorize.bind(null, props);
        const allowed = <>{children instanceof Function ? children() : children}</>;

        if (Array.isArray(requiredAccessLevel)) {
            assert(requiredAccessLevel.length, BAD_ROLE);

            return requiredAccessLevel.some(hasRequiredAccess) && allowed;
        }

        assert(requiredAccessLevel instanceof (roles), BAD_ROLE);

        return hasRequiredAccess(accessLevel) && allowed;
    };
}
