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

const hasRequiredRank = (requiredRole, incomingRole) => requiredRole.rank >= incomingRole.rank;

const authorize = (AccessRoles, opts, incomingRole) => {
    const {
        to: requiredRole,
        exactly: requireExactRole,
        permissions: requiredPermissions = null,
        requireAllPermissions,
    } = opts;

    assert(incomingRole instanceof AccessRoles, BAD_ROLE);

    const comparator = Array.isArray(requiredRole)
        ? (A, B) => (F) => F(A, B)
        : (A, B) => (F) => A.some((X) => F(X, B));

    const compare = comparator(requiredRole, incomingRole);

    const hasRequiredRole = requireExactRole
        ? compare(isEqual)
        : compare(hasRequiredRank);

    if (!hasRequiredRole) return false;

    if (!requiredPermissions) return true;

    return validatePermissions({
        incoming: incomingRole,
        required: requiredPermissions,
        requireAll: requireAllPermissions,
    });
};

export function createScope(AccessRoles, accessLevel) {
    return function Restricted({ children, ...props }) {
        const {
            to: requiredAccessLevel,
            permissions = null,
        } = props;

        assert(isValidPermissionsArgument(permissions), BAD_PERMISSIONS);

        const hasRequiredAccess = authorize.bind(null, AccessRoles, props);
        const view = <>{children instanceof Function ? children() : children}</>;

        if (Array.isArray(requiredAccessLevel)) {
            assert(requiredAccessLevel.length, BAD_ROLE);

            return requiredAccessLevel.some(hasRequiredAccess) && view;
        }

        return hasRequiredAccess(accessLevel) && view;
    };
}
