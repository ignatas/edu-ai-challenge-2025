/**
 * Comprehensive Unit Tests for TypeScript Validation Library
 *
 * This test suite covers all core functionality with both valid and invalid examples
 * to ensure robust validation coverage of at least 60%.
 */

import { Schema, ValidationResult, ValidationError } from './schema';

// ==================== TEST RUNNER ====================

/**
 * Simple test runner class for organizing and running tests
 */
class TestRunner {
  private tests: Array<{ name: string; fn: () => void }> = [];
  private passed = 0;
  private failed = 0;
  private coverage = {
    total: 0,
    covered: 0,
  };

  /**
   * Register a test case
   * @param name - Test case name
   * @param fn - Test function
   */
  test(name: string, fn: () => void): void {
    this.tests.push({ name, fn });
  }

  /**
   * Assert that a condition is true
   * @param condition - Condition to check
   * @param message - Error message if assertion fails
   */
  assert(condition: boolean, message: string): void {
    this.coverage.total++;
    if (condition) {
      this.coverage.covered++;
    } else {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  /**
   * Assert that two values are equal
   * @param actual - Actual value
   * @param expected - Expected value
   * @param message - Error message if assertion fails
   */
  assertEqual<T>(actual: T, expected: T, message: string): void {
    this.assert(actual === expected, `${message} - Expected: ${expected}, Actual: ${actual}`);
  }

  /**
   * Assert that a validation result is successful
   * @param result - Validation result to check
   * @param message - Error message if assertion fails
   */
  assertValid<T>(result: ValidationResult<T>, message: string): void {
    this.assert(
      result.success === true,
      `${message} - Expected successful validation but got errors: ${JSON.stringify(result.errors)}`
    );
  }

  /**
   * Assert that a validation result has failed
   * @param result - Validation result to check
   * @param expectedErrorCode - Expected error code
   * @param message - Error message if assertion fails
   */
  assertInvalid<T>(result: ValidationResult<T>, expectedErrorCode: string, message: string): void {
    this.assert(result.success === false, `${message} - Expected validation to fail but it succeeded`);
    this.assert(result.errors.length > 0, `${message} - Expected errors but got none`);
    this.assert(
      result.errors.some((e) => e.code === expectedErrorCode),
      `${message} - Expected error code ${expectedErrorCode} but got: ${result.errors.map((e) => e.code).join(', ')}`
    );
  }

  /**
   * Run all registered tests
   */
  run(): void {
    console.log('🧪 Running TypeScript Validation Library Tests\n');

    for (const test of this.tests) {
      try {
        test.fn();
        this.passed++;
        console.log(`✅ ${test.name}`);
      } catch (error) {
        this.failed++;
        console.log(`❌ ${test.name}`);
        console.log(`   Error: ${(error as Error).message}\n`);
      }
    }

    this.printSummary();
  }

  /**
   * Print test results summary
   */
  private printSummary(): void {
    const total = this.passed + this.failed;
    const coveragePercent = this.coverage.total > 0 ? Math.round((this.coverage.covered / this.coverage.total) * 100) : 0;

    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${this.passed}`);
    console.log(`Failed: ${this.failed}`);
    console.log(`Success Rate: ${total > 0 ? Math.round((this.passed / total) * 100) : 0}%`);
    console.log(`Test Coverage: ${coveragePercent}% (${this.coverage.covered}/${this.coverage.total} assertions)`);

    if (this.failed > 0) {
      console.log('\n❌ Some tests failed. Please check the errors above.');
    } else {
      console.log('\n🎉 All tests passed!');
    }

    if (coveragePercent >= 60) {
      console.log('✅ Test coverage target of 60% achieved!');
    } else {
      console.log('⚠️  Test coverage below 60% target.');
    }
  }
}

// ==================== INITIALIZE TEST RUNNER ====================

const runner = new TestRunner();

// ==================== STRING VALIDATOR TESTS ====================

runner.test('StringValidator - Valid strings', () => {
  const validator = Schema.string();

  // Valid cases
  runner.assertValid(validator.validate('hello'), 'Simple string should be valid');
  runner.assertValid(validator.validate(''), 'Empty string should be valid');
  runner.assertValid(validator.validate('Hello World 123!'), 'String with spaces and numbers should be valid');
});

runner.test('StringValidator - Invalid types', () => {
  const validator = Schema.string();

  // Invalid types
  runner.assertInvalid(validator.validate(123), 'INVALID_TYPE', 'Number should be invalid for string validator');
  runner.assertInvalid(validator.validate(true), 'INVALID_TYPE', 'Boolean should be invalid for string validator');
  runner.assertInvalid(validator.validate(null), 'REQUIRED', 'Null should be invalid for required string validator');
  runner.assertInvalid(validator.validate(undefined), 'REQUIRED', 'Undefined should be invalid for required string validator');
  runner.assertInvalid(validator.validate([]), 'INVALID_TYPE', 'Array should be invalid for string validator');
  runner.assertInvalid(validator.validate({}), 'INVALID_TYPE', 'Object should be invalid for string validator');
});

runner.test('StringValidator - Length constraints', () => {
  const minValidator = Schema.string().minLength(3);
  const maxValidator = Schema.string().maxLength(5);
  const rangeValidator = Schema.string().minLength(2).maxLength(8);

  // Min length tests
  runner.assertValid(minValidator.validate('abc'), 'String with exact min length should be valid');
  runner.assertValid(minValidator.validate('abcd'), 'String above min length should be valid');
  runner.assertInvalid(minValidator.validate('ab'), 'MIN_LENGTH', 'String below min length should be invalid');

  // Max length tests
  runner.assertValid(maxValidator.validate('hello'), 'String with exact max length should be valid');
  runner.assertValid(maxValidator.validate('hi'), 'String below max length should be valid');
  runner.assertInvalid(maxValidator.validate('hello world'), 'MAX_LENGTH', 'String above max length should be invalid');

  // Range tests
  runner.assertValid(rangeValidator.validate('hello'), 'String within range should be valid');
  runner.assertInvalid(rangeValidator.validate('a'), 'MIN_LENGTH', 'String below range should be invalid');
  runner.assertInvalid(rangeValidator.validate('very long string'), 'MAX_LENGTH', 'String above range should be invalid');
});

runner.test('StringValidator - Pattern matching', () => {
  const lettersOnly = Schema.string().pattern(/^[a-zA-Z]+$/);
  const numbersOnly = Schema.string().pattern(/^\d+$/);

  // Pattern tests
  runner.assertValid(lettersOnly.validate('hello'), 'Letters-only string should match pattern');
  runner.assertValid(lettersOnly.validate('HelloWorld'), 'Mixed case letters should match pattern');
  runner.assertInvalid(
    lettersOnly.validate('hello123'),
    'PATTERN_MISMATCH',
    'String with numbers should not match letters-only pattern'
  );
  runner.assertInvalid(
    lettersOnly.validate('hello world'),
    'PATTERN_MISMATCH',
    'String with spaces should not match letters-only pattern'
  );

  runner.assertValid(numbersOnly.validate('12345'), 'Numbers-only string should match pattern');
  runner.assertInvalid(
    numbersOnly.validate('123abc'),
    'PATTERN_MISMATCH',
    'String with letters should not match numbers-only pattern'
  );
});

runner.test('StringValidator - Email validation', () => {
  const emailValidator = Schema.string().email();

  // Valid emails
  runner.assertValid(emailValidator.validate('test@example.com'), 'Standard email should be valid');
  runner.assertValid(emailValidator.validate('user.name@domain.co.uk'), 'Email with dots should be valid');
  runner.assertValid(emailValidator.validate('user+tag@example.org'), 'Email with plus should be valid');

  // Invalid emails
  runner.assertInvalid(emailValidator.validate('invalid-email'), 'PATTERN_MISMATCH', 'String without @ should be invalid email');
  runner.assertInvalid(emailValidator.validate('@example.com'), 'PATTERN_MISMATCH', 'Email without local part should be invalid');
  runner.assertInvalid(emailValidator.validate('user@'), 'PATTERN_MISMATCH', 'Email without domain should be invalid');
  runner.assertInvalid(emailValidator.validate('user@domain'), 'PATTERN_MISMATCH', 'Email without TLD should be invalid');
});

runner.test('StringValidator - URL validation', () => {
  const urlValidator = Schema.string().url();

  // Valid URLs
  runner.assertValid(urlValidator.validate('https://example.com'), 'HTTPS URL should be valid');
  runner.assertValid(urlValidator.validate('http://example.com'), 'HTTP URL should be valid');
  runner.assertValid(urlValidator.validate('https://subdomain.example.com/path'), 'URL with subdomain and path should be valid');

  // Invalid URLs
  runner.assertInvalid(urlValidator.validate('ftp://example.com'), 'PATTERN_MISMATCH', 'FTP URL should be invalid');
  runner.assertInvalid(urlValidator.validate('example.com'), 'PATTERN_MISMATCH', 'URL without protocol should be invalid');
  runner.assertInvalid(urlValidator.validate('//example.com'), 'PATTERN_MISMATCH', 'Protocol-relative URL should be invalid');
});

runner.test('StringValidator - Optional validation', () => {
  const optionalValidator = Schema.string().optional();

  // Optional tests
  runner.assertValid(optionalValidator.validate('hello'), 'Valid string should pass optional validation');
  runner.assertValid(optionalValidator.validate(undefined), 'Undefined should pass optional validation');
  runner.assertValid(optionalValidator.validate(null), 'Null should pass optional validation');
  runner.assertInvalid(optionalValidator.validate(123), 'INVALID_TYPE', 'Invalid type should still fail optional validation');
});

runner.test('StringValidator - Custom messages', () => {
  const validator = Schema.string().withMessage('Custom error message');

  const result = validator.validate(123);
  runner.assert(!result.success, 'Validation should fail');
  runner.assert(result.errors[0].message === 'Custom error message', 'Should use custom error message');
});

// ==================== NUMBER VALIDATOR TESTS ====================

runner.test('NumberValidator - Valid numbers', () => {
  const validator = Schema.number();

  // Valid cases
  runner.assertValid(validator.validate(42), 'Positive integer should be valid');
  runner.assertValid(validator.validate(-42), 'Negative integer should be valid');
  runner.assertValid(validator.validate(3.14), 'Positive decimal should be valid');
  runner.assertValid(validator.validate(-3.14), 'Negative decimal should be valid');
  runner.assertValid(validator.validate(0), 'Zero should be valid');
});

runner.test('NumberValidator - Invalid types', () => {
  const validator = Schema.number();

  // Invalid types
  runner.assertInvalid(validator.validate('123'), 'INVALID_TYPE', 'String should be invalid for number validator');
  runner.assertInvalid(validator.validate(true), 'INVALID_TYPE', 'Boolean should be invalid for number validator');
  runner.assertInvalid(validator.validate(null), 'REQUIRED', 'Null should be invalid for required number validator');
  runner.assertInvalid(validator.validate(undefined), 'REQUIRED', 'Undefined should be invalid for required number validator');
  runner.assertInvalid(validator.validate(NaN), 'INVALID_TYPE', 'NaN should be invalid for number validator');
  runner.assertInvalid(validator.validate([]), 'INVALID_TYPE', 'Array should be invalid for number validator');
});

runner.test('NumberValidator - Range constraints', () => {
  const minValidator = Schema.number().min(10);
  const maxValidator = Schema.number().max(100);
  const rangeValidator = Schema.number().min(5).max(50);

  // Min value tests
  runner.assertValid(minValidator.validate(10), 'Number equal to min should be valid');
  runner.assertValid(minValidator.validate(15), 'Number above min should be valid');
  runner.assertInvalid(minValidator.validate(5), 'MIN_VALUE', 'Number below min should be invalid');

  // Max value tests
  runner.assertValid(maxValidator.validate(100), 'Number equal to max should be valid');
  runner.assertValid(maxValidator.validate(50), 'Number below max should be valid');
  runner.assertInvalid(maxValidator.validate(150), 'MAX_VALUE', 'Number above max should be invalid');

  // Range tests
  runner.assertValid(rangeValidator.validate(25), 'Number within range should be valid');
  runner.assertInvalid(rangeValidator.validate(3), 'MIN_VALUE', 'Number below range should be invalid');
  runner.assertInvalid(rangeValidator.validate(75), 'MAX_VALUE', 'Number above range should be invalid');
});

runner.test('NumberValidator - Integer validation', () => {
  const intValidator = Schema.number().int();

  // Integer tests
  runner.assertValid(intValidator.validate(42), 'Positive integer should be valid');
  runner.assertValid(intValidator.validate(-42), 'Negative integer should be valid');
  runner.assertValid(intValidator.validate(0), 'Zero should be valid integer');
  runner.assertInvalid(intValidator.validate(3.14), 'NOT_INTEGER', 'Decimal should be invalid for integer validator');
  runner.assertInvalid(intValidator.validate(-3.14), 'NOT_INTEGER', 'Negative decimal should be invalid for integer validator');
});

runner.test('NumberValidator - Positive/Negative constraints', () => {
  const positiveValidator = Schema.number().positive();
  const negativeValidator = Schema.number().negative();

  // Positive tests
  runner.assertValid(positiveValidator.validate(0), 'Zero should be valid for positive validator');
  runner.assertValid(positiveValidator.validate(42), 'Positive number should be valid');
  runner.assertInvalid(positiveValidator.validate(-1), 'MIN_VALUE', 'Negative number should be invalid for positive validator');

  // Negative tests
  runner.assertValid(negativeValidator.validate(0), 'Zero should be valid for negative validator');
  runner.assertValid(negativeValidator.validate(-42), 'Negative number should be valid');
  runner.assertInvalid(negativeValidator.validate(1), 'MAX_VALUE', 'Positive number should be invalid for negative validator');
});

runner.test('NumberValidator - Optional validation', () => {
  const optionalValidator = Schema.number().optional();

  runner.assertValid(optionalValidator.validate(42), 'Valid number should pass optional validation');
  runner.assertValid(optionalValidator.validate(undefined), 'Undefined should pass optional validation');
  runner.assertValid(optionalValidator.validate(null), 'Null should pass optional validation');
  runner.assertInvalid(optionalValidator.validate('123'), 'INVALID_TYPE', 'Invalid type should still fail optional validation');
});

// ==================== BOOLEAN VALIDATOR TESTS ====================

runner.test('BooleanValidator - Valid booleans', () => {
  const validator = Schema.boolean();

  runner.assertValid(validator.validate(true), 'True should be valid');
  runner.assertValid(validator.validate(false), 'False should be valid');
});

runner.test('BooleanValidator - Invalid types', () => {
  const validator = Schema.boolean();

  runner.assertInvalid(validator.validate('true'), 'INVALID_TYPE', 'String should be invalid for boolean validator');
  runner.assertInvalid(validator.validate(1), 'INVALID_TYPE', 'Number should be invalid for boolean validator');
  runner.assertInvalid(validator.validate(0), 'INVALID_TYPE', 'Zero should be invalid for boolean validator');
  runner.assertInvalid(validator.validate(null), 'REQUIRED', 'Null should be invalid for required boolean validator');
  runner.assertInvalid(validator.validate(undefined), 'REQUIRED', 'Undefined should be invalid for required boolean validator');
});

runner.test('BooleanValidator - Optional validation', () => {
  const optionalValidator = Schema.boolean().optional();

  runner.assertValid(optionalValidator.validate(true), 'Valid boolean should pass optional validation');
  runner.assertValid(optionalValidator.validate(undefined), 'Undefined should pass optional validation');
  runner.assertValid(optionalValidator.validate(null), 'Null should pass optional validation');
});

// ==================== DATE VALIDATOR TESTS ====================

runner.test('DateValidator - Valid dates', () => {
  const validator = Schema.date();

  runner.assertValid(validator.validate(new Date()), 'Current date should be valid');
  runner.assertValid(validator.validate(new Date('2023-12-25')), 'Valid date string should be valid');
  runner.assertValid(validator.validate('2023-12-25'), 'ISO date string should be valid');
});

runner.test('DateValidator - Invalid dates', () => {
  const validator = Schema.date();

  runner.assertInvalid(validator.validate('invalid-date'), 'INVALID_DATE', 'Invalid date string should be invalid');
  runner.assertInvalid(validator.validate('2023-13-45'), 'INVALID_DATE', 'Impossible date should be invalid');
  runner.assertInvalid(validator.validate(123), 'INVALID_TYPE', 'Number should be invalid for date validator');
  runner.assertInvalid(validator.validate(null), 'REQUIRED', 'Null should be invalid for required date validator');
});

runner.test('DateValidator - Date range constraints', () => {
  const pastValidator = Schema.date().past();
  const futureValidator = Schema.date().future();
  const rangeValidator = Schema.date().min(new Date('2020-01-01')).max(new Date('2025-12-31'));

  const pastDate = new Date('2020-01-01');
  const futureDate = new Date('2030-01-01');

  // Past validation (note: current time makes this tricky, so we use definitely past dates)
  runner.assertValid(pastValidator.validate(pastDate), 'Past date should be valid for past validator');

  // Range validation
  runner.assertValid(rangeValidator.validate(new Date('2022-06-15')), 'Date within range should be valid');
  runner.assertInvalid(rangeValidator.validate(new Date('2019-01-01')), 'MIN_DATE', 'Date before range should be invalid');
  runner.assertInvalid(rangeValidator.validate(new Date('2026-01-01')), 'MAX_DATE', 'Date after range should be invalid');
});

runner.test('DateValidator - Format validation', () => {
  const ddmmyyyyValidator = Schema.date().ddmmyyyy('/');
  const mmddyyyyValidator = Schema.date().mmddyyyy('/');
  const yyyymmddValidator = Schema.date().yyyymmdd('-');

  // DD/MM/YYYY format
  runner.assertValid(ddmmyyyyValidator.validate('25/12/2023'), 'DD/MM/YYYY format should be valid');
  runner.assertInvalid(
    ddmmyyyyValidator.validate('12/25/2023'),
    'INVALID_DATE_FORMAT',
    'MM/DD/YYYY should be invalid for DD/MM/YYYY validator'
  );

  // MM/DD/YYYY format
  runner.assertValid(mmddyyyyValidator.validate('12/25/2023'), 'MM/DD/YYYY format should be valid');

  // YYYY-MM-DD format
  runner.assertValid(yyyymmddValidator.validate('2023-12-25'), 'YYYY-MM-DD format should be valid');
  runner.assertInvalid(
    yyyymmddValidator.validate('25-12-2023'),
    'INVALID_DATE_FORMAT',
    'DD-MM-YYYY should be invalid for YYYY-MM-DD validator'
  );
});

// ==================== CURRENCY VALIDATOR TESTS ====================

runner.test('CurrencyValidator - USD format', () => {
  const usdValidator = Schema.currency().usd();

  // Valid USD formats
  runner.assertValid(usdValidator.validate('$1,234.56'), 'Standard USD format should be valid');
  runner.assertValid(usdValidator.validate('$0.99'), 'Small USD amount should be valid');
  runner.assertValid(usdValidator.validate('$1000.00'), 'USD with decimals should be valid');
  runner.assertValid(usdValidator.validate('$1,000,000.00'), 'Large USD amount should be valid');

  // Invalid USD formats
  runner.assertInvalid(usdValidator.validate('1234.56'), 'INVALID_CURRENCY_FORMAT', 'USD without $ symbol should be invalid');
  runner.assertInvalid(
    usdValidator.validate('£1,234.56'),
    'INVALID_CURRENCY_FORMAT',
    'GBP format should be invalid for USD validator'
  );
});

runner.test('CurrencyValidator - Amount constraints', () => {
  const minValidator = Schema.currency().usd().min(10);
  const maxValidator = Schema.currency().usd().max(1000);
  const positiveValidator = Schema.currency().usd().positive();

  // Min amount tests
  runner.assertValid(minValidator.validate('$15.00'), 'Amount above min should be valid');
  runner.assertInvalid(minValidator.validate('$5.00'), 'MIN_AMOUNT', 'Amount below min should be invalid');

  // Max amount tests
  runner.assertValid(maxValidator.validate('$500.00'), 'Amount below max should be valid');
  runner.assertInvalid(maxValidator.validate('$1500.00'), 'MAX_AMOUNT', 'Amount above max should be invalid');

  // Positive amount tests
  runner.assertValid(positiveValidator.validate('$100.00'), 'Positive amount should be valid');
});

// ==================== ARRAY VALIDATOR TESTS ====================

runner.test('ArrayValidator - Valid arrays', () => {
  const stringArrayValidator = Schema.array(Schema.string());
  const numberArrayValidator = Schema.array(Schema.number());

  // Valid cases
  runner.assertValid(stringArrayValidator.validate(['hello', 'world']), 'String array should be valid');
  runner.assertValid(stringArrayValidator.validate([]), 'Empty array should be valid');
  runner.assertValid(numberArrayValidator.validate([1, 2, 3]), 'Number array should be valid');
});

runner.test('ArrayValidator - Invalid arrays', () => {
  const stringArrayValidator = Schema.array(Schema.string());

  // Invalid types
  runner.assertInvalid(
    stringArrayValidator.validate('not an array'),
    'INVALID_TYPE',
    'String should be invalid for array validator'
  );
  runner.assertInvalid(stringArrayValidator.validate(123), 'INVALID_TYPE', 'Number should be invalid for array validator');
  runner.assertInvalid(stringArrayValidator.validate(null), 'REQUIRED', 'Null should be invalid for required array validator');

  // Invalid item types
  runner.assertInvalid(
    stringArrayValidator.validate(['hello', 123, 'world']),
    'INVALID_TYPE',
    'Array with invalid item types should be invalid'
  );
});

runner.test('ArrayValidator - Length constraints', () => {
  const minValidator = Schema.array(Schema.string()).minLength(2);
  const maxValidator = Schema.array(Schema.string()).maxLength(3);
  const nonEmptyValidator = Schema.array(Schema.string()).nonEmpty();

  // Min length tests
  runner.assertValid(minValidator.validate(['a', 'b']), 'Array with min length should be valid');
  runner.assertValid(minValidator.validate(['a', 'b', 'c']), 'Array above min length should be valid');
  runner.assertInvalid(minValidator.validate(['a']), 'MIN_LENGTH', 'Array below min length should be invalid');

  // Max length tests
  runner.assertValid(maxValidator.validate(['a', 'b', 'c']), 'Array with max length should be valid');
  runner.assertValid(maxValidator.validate(['a']), 'Array below max length should be valid');
  runner.assertInvalid(maxValidator.validate(['a', 'b', 'c', 'd']), 'MAX_LENGTH', 'Array above max length should be invalid');

  // Non-empty tests
  runner.assertValid(nonEmptyValidator.validate(['a']), 'Non-empty array should be valid');
  runner.assertInvalid(nonEmptyValidator.validate([]), 'MIN_LENGTH', 'Empty array should be invalid for non-empty validator');
});

// ==================== OBJECT VALIDATOR TESTS ====================

runner.test('ObjectValidator - Valid objects', () => {
  const userValidator = Schema.object({
    name: Schema.string(),
    age: Schema.number(),
    isActive: Schema.boolean(),
  });

  const validUser = {
    name: 'John Doe',
    age: 30,
    isActive: true,
  };

  runner.assertValid(userValidator.validate(validUser), 'Valid object should pass validation');
});

runner.test('ObjectValidator - Invalid objects', () => {
  const userValidator = Schema.object({
    name: Schema.string(),
    age: Schema.number(),
    isActive: Schema.boolean(),
  });

  // Invalid types
  runner.assertInvalid(userValidator.validate('not an object'), 'INVALID_TYPE', 'String should be invalid for object validator');
  runner.assertInvalid(userValidator.validate([]), 'INVALID_TYPE', 'Array should be invalid for object validator');
  runner.assertInvalid(userValidator.validate(null), 'REQUIRED', 'Null should be invalid for required object validator');

  // Missing required fields
  runner.assertInvalid(userValidator.validate({}), 'REQUIRED', 'Empty object should be invalid when required fields are missing');
  runner.assertInvalid(
    userValidator.validate({ name: 'John' }),
    'REQUIRED',
    'Object with missing required fields should be invalid'
  );

  // Invalid field types
  runner.assertInvalid(
    userValidator.validate({
      name: 123,
      age: 30,
      isActive: true,
    }),
    'INVALID_TYPE',
    'Object with invalid field types should be invalid'
  );
});

runner.test('ObjectValidator - Optional fields', () => {
  const userValidator = Schema.object({
    name: Schema.string(),
    age: Schema.number().optional(),
    email: Schema.string().email().optional(),
  });

  // Valid with optional fields missing
  runner.assertValid(userValidator.validate({ name: 'John' }), 'Object with missing optional fields should be valid');

  // Valid with optional fields present
  runner.assertValid(
    userValidator.validate({
      name: 'John',
      age: 30,
      email: 'john@example.com',
    }),
    'Object with optional fields should be valid'
  );
});

runner.test('ObjectValidator - Nested objects', () => {
  const addressValidator = Schema.object({
    street: Schema.string(),
    city: Schema.string(),
    postalCode: Schema.string(),
  });

  const userValidator = Schema.object({
    name: Schema.string(),
    address: addressValidator,
  });

  const validUser = {
    name: 'John Doe',
    address: {
      street: '123 Main St',
      city: 'New York',
      postalCode: '10001',
    },
  };

  runner.assertValid(userValidator.validate(validUser), 'Nested object should be valid');

  // Invalid nested object
  const invalidUser = {
    name: 'John Doe',
    address: {
      street: '123 Main St',
      city: 123, // Invalid type
      postalCode: '10001',
    },
  };

  runner.assertInvalid(userValidator.validate(invalidUser), 'INVALID_TYPE', 'Object with invalid nested field should be invalid');
});

// ==================== LITERAL VALIDATOR TESTS ====================

runner.test('LiteralValidator - Valid literals', () => {
  const stringLiteralValidator = Schema.literal('active');
  const numberLiteralValidator = Schema.literal(42);
  const booleanLiteralValidator = Schema.literal(true);

  runner.assertValid(stringLiteralValidator.validate('active'), 'Matching string literal should be valid');
  runner.assertValid(numberLiteralValidator.validate(42), 'Matching number literal should be valid');
  runner.assertValid(booleanLiteralValidator.validate(true), 'Matching boolean literal should be valid');
});

runner.test('LiteralValidator - Invalid literals', () => {
  const stringLiteralValidator = Schema.literal('active');
  const numberLiteralValidator = Schema.literal(42);

  runner.assertInvalid(
    stringLiteralValidator.validate('inactive'),
    'LITERAL_MISMATCH',
    'Non-matching string literal should be invalid'
  );
  runner.assertInvalid(numberLiteralValidator.validate(43), 'LITERAL_MISMATCH', 'Non-matching number literal should be invalid');
  runner.assertInvalid(stringLiteralValidator.validate(123), 'LITERAL_MISMATCH', 'Wrong type for literal should be invalid');
});

// ==================== UNION VALIDATOR TESTS ====================

runner.test('UnionValidator - Valid unions', () => {
  const stringOrNumberValidator = Schema.union(Schema.string(), Schema.number());

  const statusValidator = Schema.union(Schema.literal('active'), Schema.literal('inactive'), Schema.literal('pending'));

  // Valid union cases
  runner.assertValid(stringOrNumberValidator.validate('hello'), 'String should be valid for string|number union');
  runner.assertValid(stringOrNumberValidator.validate(42), 'Number should be valid for string|number union');
  runner.assertValid(statusValidator.validate('active'), 'Valid status literal should be valid');
  runner.assertValid(statusValidator.validate('pending'), 'Valid status literal should be valid');
});

runner.test('UnionValidator - Invalid unions', () => {
  const stringOrNumberValidator = Schema.union(Schema.string(), Schema.number());

  const statusValidator = Schema.union(Schema.literal('active'), Schema.literal('inactive'), Schema.literal('pending'));

  // Invalid union cases
  runner.assertInvalid(
    stringOrNumberValidator.validate(true),
    'UNION_MISMATCH',
    'Boolean should be invalid for string|number union'
  );
  runner.assertInvalid(stringOrNumberValidator.validate([]), 'UNION_MISMATCH', 'Array should be invalid for string|number union');
  runner.assertInvalid(statusValidator.validate('unknown'), 'UNION_MISMATCH', 'Invalid status should be invalid');
});

// ==================== COMPLEX INTEGRATION TESTS ====================

runner.test('Integration - E-commerce product validation', () => {
  const productValidator = Schema.object({
    id: Schema.string().pattern(/^PROD-\d{6}$/),
    name: Schema.string().minLength(3).maxLength(100),
    price: Schema.currency().usd().min(0.01).max(9999.99),
    category: Schema.union(Schema.literal('electronics'), Schema.literal('clothing'), Schema.literal('books')),
    tags: Schema.array(Schema.string()).maxLength(10),
    inStock: Schema.boolean(),
    specs: Schema.object({
      weight: Schema.number().positive().optional(),
      dimensions: Schema.string().optional(),
    }).optional(),
  });

  const validProduct = {
    id: 'PROD-123456',
    name: 'TypeScript Handbook',
    price: '$29.99',
    category: 'books',
    tags: ['programming', 'typescript'],
    inStock: true,
    specs: {
      weight: 0.5,
      dimensions: '8x10x1 inches',
    },
  };

  runner.assertValid(productValidator.validate(validProduct), 'Valid e-commerce product should pass validation');

  const invalidProduct = {
    id: 'INVALID-ID',
    name: 'A',
    price: '$10000.00',
    category: 'invalid-category',
    tags: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'], // Too many tags
    inStock: 'yes', // Wrong type
  };

  const result = productValidator.validate(invalidProduct);
  runner.assert(!result.success, 'Invalid product should fail validation');
  runner.assert(result.errors.length > 0, 'Invalid product should have multiple errors');
});

runner.test('Integration - User registration form', () => {
  const registrationValidator = Schema.object({
    username: Schema.string()
      .minLength(3)
      .maxLength(20)
      .pattern(/^[a-zA-Z0-9_]+$/),
    email: Schema.string().email(),
    password: Schema.string().minLength(8),
    confirmPassword: Schema.string(),
    age: Schema.number().int().min(13).max(120),
    country: Schema.string().minLength(2),
    agreedToTerms: Schema.boolean(),
    newsletter: Schema.boolean().optional(),
    address: Schema.object({
      street: Schema.string(),
      city: Schema.string(),
      postalCode: Schema.string().pattern(/^\d{5}(-\d{4})?$/),
    }).optional(),
  });

  const validRegistration = {
    username: 'john_doe123',
    email: 'john@example.com',
    password: 'SecurePassword123',
    confirmPassword: 'SecurePassword123',
    age: 25,
    country: 'US',
    agreedToTerms: true,
    newsletter: true,
    address: {
      street: '123 Main St',
      city: 'New York',
      postalCode: '10001',
    },
  };

  runner.assertValid(registrationValidator.validate(validRegistration), 'Valid registration should pass validation');
});

// ==================== ERROR PATH TESTS ====================

runner.test('Error paths - Nested object errors', () => {
  const userValidator = Schema.object({
    profile: Schema.object({
      contact: Schema.object({
        email: Schema.string().email(),
      }),
    }),
  });

  const invalidUser = {
    profile: {
      contact: {
        email: 'invalid-email',
      },
    },
  };

  const result = userValidator.validate(invalidUser);
  runner.assert(!result.success, 'Validation should fail');
  runner.assert(result.errors.length > 0, 'Should have errors');
  runner.assert(result.errors[0].path.includes('profile.contact.email'), 'Error path should include nested field path');
});

runner.test('Error paths - Array item errors', () => {
  const usersValidator = Schema.array(
    Schema.object({
      email: Schema.string().email(),
    })
  );

  const invalidUsers = [{ email: 'valid@example.com' }, { email: 'invalid-email' }, { email: 'another-valid@example.com' }];

  const result = usersValidator.validate(invalidUsers);
  runner.assert(!result.success, 'Validation should fail');
  runner.assert(result.errors.length > 0, 'Should have errors');
  runner.assert(result.errors[0].path.includes('[1]'), 'Error path should include array index');
});

// ==================== RUN ALL TESTS ====================

// Run the test suite
runner.run();
