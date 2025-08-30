```typescript
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/ascii-wiki9.0/',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
```
