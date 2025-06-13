# TypeScript Validation Library

A modern, type-safe validation library for TypeScript with fluent API design, comprehensive error handling, and support for complex validation scenarios including nested objects, arrays, and international formats.

## 🚀 Quick Start

### Installation & Setup

1. **Clone or download the validator library:**

   ```bash
   # If part of a larger project
   cd your-project/validator

   # Or download just the validator folder
   ```

2. **Install TypeScript (if not already installed):**

   ```bash
   npm install -g typescript
   # or
   yarn global add typescript
   ```

3. **Compile the TypeScript code:**

   ```bash
   # From the validator directory
   tsc schema.ts --target es2020 --module commonjs --outDir dist
   ```

4. **Run tests:**
   ```bash
   # Compile and run tests
   tsc tests.ts --target es2020 --module commonjs && node tests.js
   ```

### Basic Usage

```typescript
import { Schema } from './schema';

// Simple string validation
const nameValidator = Schema.string().minLength(2).maxLength(50);
const result = nameValidator.validate('John Doe');

if (result.success) {
  console.log('Valid name:', result.data);
} else {
  console.log('Errors:', result.errors);
}
```

## 📖 Core Concepts

### Validation Results

All validators return a `ValidationResult<T>` object:

```typescript
interface ValidationResult<T> {
  success: boolean; // Whether validation passed
  data?: T; // Validated data (only on success)
  errors: ValidationError[]; // Array of validation errors
}
```

### Error Handling

Detailed error information with typed error codes:

```typescript
interface ValidationError {
  path: string; // Field path (e.g., "user.email")
  message: string; // Human-readable message
  code: ValidationErrorCode; // Programmatic error code
}
```

## 🛠️ API Reference

### String Validator

```typescript
const stringValidator = Schema.string()
  .minLength(5) // Minimum length
  .maxLength(100) // Maximum length
  .pattern(/^[A-Z]/) // Custom regex pattern
  .email() // Email validation
  .url() // URL validation
  .optional() // Allow undefined/null
  .withMessage('Custom error message');
```

**Example:**

```typescript
const emailValidator = Schema.string().email();
const result = emailValidator.validate('user@example.com');
// result.success === true, result.data === "user@example.com"
```

### Number Validator

```typescript
const numberValidator = Schema.number()
  .min(0) // Minimum value
  .max(100) // Maximum value
  .int() // Must be integer
  .positive() // Must be >= 0
  .negative() // Must be <= 0
  .optional();
```

**Example:**

```typescript
const ageValidator = Schema.number().min(0).max(120).int();
const result = ageValidator.validate(25);
// result.success === true, result.data === 25
```

### Boolean Validator

```typescript
const booleanValidator = Schema.boolean().optional();
```

### Date Validator

```typescript
const dateValidator = Schema.date()
  .min(new Date('2020-01-01')) // Minimum date
  .max(new Date('2030-12-31')) // Maximum date
  .past() // Must be in the past
  .future() // Must be in the future
  .ddmmyyyy('/') // DD/MM/YYYY format
  .mmddyyyy('/') // MM/DD/YYYY format
  .yyyymmdd('-') // YYYY-MM-DD format
  .iso8601(); // ISO8601 format
```

**Example:**

```typescript
const birthdateValidator = Schema.date().ddmmyyyy('/').past();
const result = birthdateValidator.validate('25/12/1990');
// result.success === true, result.data === Date object
```

### Currency Validator

Supports multiple international currency formats:

```typescript
const currencyValidator = Schema.currency()
  .usd() // US Dollar format ($1,234.56)
  .gbp() // British Pound format (£1,234.56)
  .eur() // Euro format (€1.234,56)
  .rub() // Russian Ruble format (1 234.56₽)
  .min(0) // Minimum amount
  .max(10000) // Maximum amount
  .positive() // Must be positive
  .allowNegativeAmounts(); // Allow negative amounts
```

**Example:**

```typescript
const priceValidator = Schema.currency().usd().min(0).max(9999.99);
const result = priceValidator.validate('$1,234.56');
// result.success === true, result.data === { amount: 1234.56, currency: "USD", originalString: "$1,234.56" }
```

### Array Validator

```typescript
const arrayValidator = Schema.array(Schema.string())
  .minLength(1) // Minimum array length
  .maxLength(10) // Maximum array length
  .nonEmpty(); // Must have at least one item
```

**Example:**

```typescript
const tagsValidator = Schema.array(Schema.string().minLength(1)).minLength(1);
const result = tagsValidator.validate(['typescript', 'validation']);
// result.success === true, result.data === ["typescript", "validation"]
```

### Object Validator

```typescript
const userValidator = Schema.object({
  id: Schema.string(),
  name: Schema.string().minLength(2),
  email: Schema.string().email(),
  age: Schema.number().int().min(0).optional(),
  isActive: Schema.boolean(),
});
```

**Example:**

```typescript
const user = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  isActive: true,
};

const result = userValidator.validate(user);
// result.success === true, result.data === validated user object
```

### Union and Literal Validators

```typescript
// Union of multiple validators
const stringOrNumberValidator = Schema.union(Schema.string(), Schema.number());

// Literal value validation
const statusValidator = Schema.literal('active');
```

## 🌍 International Format Support

### Currency Formats

| Currency | Format Example | Thousands Sep | Decimal Sep | Symbol Placement |
| -------- | -------------- | ------------- | ----------- | ---------------- |
| USD      | $1,234.56      | ,             | .           | Before           |
| GBP      | £1,234.56      | ,             | .           | Before           |
| EUR      | €1.234,56      | .             | ,           | Before           |
| RUB      | 1 234.56₽      | (space)       | .           | After            |

### Date Formats

| Format     | Example              | Description              |
| ---------- | -------------------- | ------------------------ |
| DD/MM/YYYY | 25/12/2023           | Day/Month/Year           |
| MM/DD/YYYY | 12/25/2023           | Month/Day/Year           |
| YYYY-MM-DD | 2023-12-25           | Year-Month-Day           |
| DD/MM/YY   | 25/12/23             | Day/Month/Year (2-digit) |
| MM/DD/YY   | 12/25/23             | Month/Day/Year (2-digit) |
| ISO8601    | 2023-12-25T10:30:00Z | International standard   |

## 🏗️ Real-World Examples

### E-commerce Product Validation

```typescript
const productValidator = Schema.object({
  id: Schema.string().pattern(/^PROD-\d{6}$/),
  name: Schema.string().minLength(3).maxLength(100),
  price: Schema.currency().usd().min(0.01).max(9999.99),
  category: Schema.union(Schema.literal('electronics'), Schema.literal('clothing'), Schema.literal('books')),
  tags: Schema.array(Schema.string()).maxLength(10),
  inStock: Schema.boolean(),
  releaseDate: Schema.date().iso8601().optional(),
});

const product = {
  id: 'PROD-123456',
  name: 'TypeScript Handbook',
  price: '$29.99',
  category: 'books',
  tags: ['programming', 'typescript'],
  inStock: true,
  releaseDate: '2023-12-25T00:00:00Z',
};

const result = productValidator.validate(product);
```

### User Registration Form

```typescript
const registrationValidator = Schema.object({
  username: Schema.string()
    .minLength(3)
    .maxLength(20)
    .pattern(/^[a-zA-Z0-9_]+$/),
  email: Schema.string().email(),
  password: Schema.string()
    .minLength(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  confirmPassword: Schema.string(),
  age: Schema.number().int().min(13).max(120),
  country: Schema.string().minLength(2),
  agreedToTerms: Schema.boolean(),
  newsletter: Schema.boolean().optional(),
});
```

### Financial Transaction Validation

```typescript
const transactionValidator = Schema.object({
  id: Schema.string().pattern(/^TXN-[A-Z0-9]{10}$/),
  amount: Schema.currency().usd().min(0.01),
  fromAccount: Schema.string().pattern(/^\d{10,12}$/),
  toAccount: Schema.string().pattern(/^\d{10,12}$/),
  timestamp: Schema.date().iso8601(),
  type: Schema.union(Schema.literal('transfer'), Schema.literal('payment'), Schema.literal('refund')),
  metadata: Schema.object({
    description: Schema.string().maxLength(200).optional(),
    reference: Schema.string().optional(),
  }).optional(),
});
```

## ⚡ Performance Tips

1. **Reuse validators:** Create validator instances once and reuse them
2. **Use specific patterns:** More specific regex patterns are faster
3. **Minimize nested validation:** Deep object validation can be slow
4. **Use literal validators:** For enums, use `Schema.literal()` instead of patterns

```typescript
// Good: Reuse validator
const emailValidator = Schema.string().email();
const users = userEmails.map((email) => emailValidator.validate(email));

// Good: Use literal for enums
const statusValidator = Schema.union(Schema.literal('active'), Schema.literal('inactive'), Schema.literal('pending'));
```

## 🧪 Testing Your Validations

```typescript
// Test valid cases
const validator = Schema.string().email();

console.assert(validator.validate('test@example.com').success === true);
console.assert(validator.validate('invalid-email').success === false);

// Test error messages
const result = validator.validate('invalid');
console.assert(result.errors[0].code === 'PATTERN_MISMATCH');
```

## 🔧 Integration Examples

### Express.js Middleware

```typescript
import express from 'express';
import { Schema } from './validator/schema';

const userSchema = Schema.object({
  name: Schema.string().minLength(2),
  email: Schema.string().email(),
  age: Schema.number().int().min(0).optional(),
});

function validateBody(schema: any) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const result = schema.validate(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.errors });
    }
    req.body = result.data; // Use validated data
    next();
  };
}

app.post('/users', validateBody(userSchema), (req, res) => {
  // req.body is now validated and type-safe
  res.json({ message: 'User created', user: req.body });
});
```

### React Form Validation

```typescript
import React, { useState } from 'react';
import { Schema } from './validator/schema';

const loginSchema = Schema.object({
  email: Schema.string().email(),
  password: Schema.string().minLength(6),
});

function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.validate(formData);

    if (!result.success) {
      setErrors(result.errors.map((err) => err.message));
      return;
    }

    // Form is valid, proceed with login
    console.log('Valid form data:', result.data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {errors.length > 0 && (
        <div className="errors">
          {errors.map((error, index) => (
            <p key={index} className="error">
              {error}
            </p>
          ))}
        </div>
      )}
    </form>
  );
}
```

## 🐛 Troubleshooting

### Common Issues

1. **TypeScript compilation errors:**

   ```bash
   # Ensure you're using ES2020 or later
   tsc schema.ts --target es2020 --lib es2020
   ```

2. **Module import issues:**

   ```typescript
   // Use relative paths for imports
   import { Schema } from './schema';
   ```

3. **Date parsing issues:**

   ```typescript
   // Ensure date format matches your regional settings
   const dateValidator = Schema.date().ddmmyyyy('/'); // European format
   // or
   const dateValidator = Schema.date().mmddyyyy('/'); // US format
   ```

4. **Currency validation fails:**
   ```typescript
   // Ensure currency format matches exactly
   const usdValidator = Schema.currency().usd();
   usdValidator.validate('$1,234.56'); // ✓ Valid
   usdValidator.validate('1,234.56'); // ✗ Missing $ symbol
   ```

### Performance Issues

1. **Slow validation:** Use simpler regex patterns or break complex validations into smaller parts
2. **Memory usage:** Avoid creating new validator instances in loops

## 📋 Running the Library

### Development Mode

```bash
# 1. Navigate to validator directory
cd validator

# 2. Compile TypeScript
tsc schema.ts --target es2020 --module commonjs --outDir dist

# 3. Run tests
tsc tests.ts --target es2020 --module commonjs && node tests.js

# 4. Run examples (if available)
node examples.js
```

### Production Mode

```bash
# Compile with optimizations
tsc schema.ts --target es2020 --module commonjs --outDir dist --declaration --sourceMap

# Include in your project
import { Schema } from './dist/schema';
```

### Browser Usage

```html
<!-- Compile to ES modules for browser -->
<script type="module">
  import { Schema } from './dist/schema.js';

  const validator = Schema.string().email();
  const result = validator.validate(document.getElementById('email').value);
</script>
```

## 🔄 Migration Guide

### From Other Validation Libraries

**From Joi:**

```typescript
// Joi
const schema = Joi.object({
  name: Joi.string().min(2).required(),
  age: Joi.number().integer().min(0).optional(),
});

// Our library
const schema = Schema.object({
  name: Schema.string().minLength(2),
  age: Schema.number().int().min(0).optional(),
});
```

**From Yup:**

```typescript
// Yup
const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).required(),
});

// Our library
const schema = Schema.object({
  email: Schema.string().email(),
  password: Schema.string().minLength(8),
});
```

## 📚 Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Regular Expressions Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- [International Number Formats](https://en.wikipedia.org/wiki/Decimal_separator)
- [Currency Code Standards](https://en.wikipedia.org/wiki/ISO_4217)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
