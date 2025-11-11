You are tasked with creating a new domain error class following the DomainError pattern.

When creating a domain error, you MUST follow these steps exactly:

1. Ask the user for:
   - Error name (e.g., "ProductNotFound", "CartEmpty", "CheckoutFailed")
   - HTTP status code (400, 404, 409, 429, 500)
   - Error parameters (e.g., productId, cartId, reason)
   - Error code (e.g., "PRODUCT_NOT_FOUND", "CART_EMPTY")

2. Create the error class in `src/domain/errors/{Name}Error.ts` with:
   - Extend `DomainError`
   - Constructor with appropriate parameters
   - Call `super()` with message, code, status code, and details object
   - Clear, descriptive error message

3. Export from `src/domain/errors/index.ts`:
   ```typescript
   export { {Name}Error } from './{Name}Error';
   ```

4. Provide usage examples showing:
   - How to throw the error in repositories
   - How to throw the error in services
   - How to catch and handle the error in tests

Status Code Guidelines:
- `400` - Bad Request (validation, invalid parameters)
- `404` - Not Found (entity doesn't exist)
- `409` - Conflict (duplicate, already exists)
- `429` - Too Many Requests (rate limiting, quotas)
- `500` - Internal Server Error (unexpected errors)

Example Template:
```typescript
import { DomainError } from "./DomainError";

export class {Name}Error extends DomainError {
  constructor(param1: string, param2: string, details?: Record<string, unknown>) {
    super(
      `Descriptive message with ${param1} and ${param2}`,
      "ERROR_CODE",
      statusCode,
      { param1, param2, ...details }
    );
  }
}
```

After creating the error class, provide examples of where and how to use it in the codebase.
