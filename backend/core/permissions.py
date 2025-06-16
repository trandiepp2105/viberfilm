from rest_framework.permissions import BasePermission

class IsStaffUser(BasePermission):
    """
    Permission class that grants access only to staff users.

    This permission ensures that the request user is authenticated 
    and has the `is_staff` flag set to `True`.

    Usage:
        Apply this permission to restrict access to admin or staff-only endpoints.

    Returns:
        True if the user is authenticated and is a staff member, otherwise False.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class IsAdminUser(BasePermission):
    """
    Permission class that grants"
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_superuser