/*
# Fix mutable search_path on update_updated_at_column function

## Security Change
- The trigger function `public.update_updated_at_column` was created without an
  explicit `search_path`, leaving it mutable. A malicious user with the ability
  to create objects in a schema that appears earlier in the runtime search_path
  could shadow function calls and escalate privileges.
- This migration sets `search_path = public` on the function, locking it to a
  single trusted schema and eliminating the vulnerability.
- The function body is unchanged — only the security definer / search_path
  attributes are corrected.
*/

ALTER FUNCTION public.update_updated_at_column() SET search_path = public;