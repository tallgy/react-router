---
"@remix-run/router": minor
---

Support optional multi-segment paths via `??`.

Normally, a `?` indicates that the slash-delimited URL segment is optional:

```jsx
<Route path="/lang/:locale?">
// Only /:locale is optional
```

Now, you can add a `??` at the end of the path to make the entire `path` optional:

```jsx
<Route path="/lang/:locale??">
// Now the entire /lang/:locale path is optional
```
