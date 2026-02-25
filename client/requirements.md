## Packages
jwt-decode | For decoding the JWT token to extract user role if needed (though we fetch /me, it's handy)
clsx | For conditional class merging (likely already installed, but good to ensure)
tailwind-merge | For conditional class merging
date-fns | For formatting dates nicely

## Notes
- JWT authentication is stored in localStorage under 'auth_token'.
- All API requests use a custom fetch wrapper `apiFetch` in `client/src/lib/api.ts` to automatically attach the Bearer token.
- The design is strictly forced to Dark Mode Professional using CSS variables in index.css.
- Stock images from Unsplash are used sparingly as placeholders for products if they don't have one.
