/**
 * Modern TypeScript Validation Library
 *
 * A comprehensive validation library with fluent API design, type safety,
 * and support for complex validation scenarios including nested objects,
 * arrays, and international formats (currencies, dates).
 */

// ==================== CORE TYPES ====================

/**
 * Represents the result of a validation operation
 * @template T - The expected type after successful validation
 */
interface ValidationResult<T = unknown> {
  /** Whether the validation passed */
  readonly success: boolean;
  /** The validated and potentially transformed data (only present on success) */
  readonly data?: T;
  /** Array of validation errors (empty on success) */
  readonly errors: readonly ValidationError[];
}

/**
 * Represents a single validation error with detailed information
 */
interface ValidationError {
  /** The path to the field that failed validation (e.g., "user.address.city") */
  readonly path: string;
  /** Human-readable error message */
  readonly message: string;
  /** Programmatic error code for handling specific error types */
  readonly code: ValidationErrorCode;
}

/**
 * Standardized error codes for programmatic error handling
 * Using const assertion for better type safety and autocompletion
 */
const VALIDATION_ERROR_CODES = {
  REQUIRED: 'REQUIRED',
  INVALID_TYPE: 'INVALID_TYPE',
  MIN_LENGTH: 'MIN_LENGTH',
  MAX_LENGTH: 'MAX_LENGTH',
  MIN_VALUE: 'MIN_VALUE',
  MAX_VALUE: 'MAX_VALUE',
  PATTERN_MISMATCH: 'PATTERN_MISMATCH',
  INVALID_DATE: 'INVALID_DATE',
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
  MIN_DATE: 'MIN_DATE',
  MAX_DATE: 'MAX_DATE',
  NOT_INTEGER: 'NOT_INTEGER',
  UNION_MISMATCH: 'UNION_MISMATCH',
  LITERAL_MISMATCH: 'LITERAL_MISMATCH',
  MISSING_FORMAT: 'MISSING_FORMAT',
  INVALID_CURRENCY_FORMAT: 'INVALID_CURRENCY_FORMAT',
  NEGATIVE_AMOUNT: 'NEGATIVE_AMOUNT',
  MIN_AMOUNT: 'MIN_AMOUNT',
  MAX_AMOUNT: 'MAX_AMOUNT',
} as const;

/** Union type of all possible validation error codes */
type ValidationErrorCode = (typeof VALIDATION_ERROR_CODES)[keyof typeof VALIDATION_ERROR_CODES];

// ==================== BASE VALIDATOR ====================

/**
 * Abstract base class for all validators
 * Provides common functionality like optional handling and custom messages
 * @template T - The type that this validator validates
 */
abstract class Validator<T> {
  /** Whether this field is optional (allows undefined/null) */
  protected isOptional: boolean = false;
  /** Custom error message to override default messages */
  protected customMessage?: string;

  /**
   * Main validation method that must be implemented by subclasses
   * @param value - The value to validate
   * @param path - The field path for error reporting (e.g., "user.email")
   * @returns ValidationResult indicating success/failure and any errors
   */
  abstract validate(value: unknown, path?: string): ValidationResult<T>;

  /**
   * Makes this validator optional (allows undefined/null values)
   * @returns This validator instance for method chaining
   */
  optional(): this {
    this.isOptional = true;
    return this;
  }

  /**
   * Sets a custom error message for this validator
   * @param message - The custom error message to use
   * @returns This validator instance for method chaining
   */
  withMessage(message: string): this {
    this.customMessage = message;
    return this;
  }

  /**
   * Creates a validation error with the appropriate message
   * Uses custom message if set, otherwise falls back to the default message
   * @param path - The field path where the error occurred
   * @param message - The default error message
   * @param code - The error code for programmatic handling
   * @returns A formatted ValidationError object
   */
  protected createError(path: string, message: string, code: ValidationErrorCode): ValidationError {
    return {
      path,
      message: this.customMessage || message,
      code,
    };
  }

  /**
   * Handles optional field validation logic
   * Returns null if the field is not optional, or a validation result if it is
   * @param value - The value to check
   * @param path - The field path for error reporting
   * @returns ValidationResult for optional fields, or null to continue validation
   */
  protected handleOptional(value: unknown, path: string = ''): ValidationResult<T | undefined> | null {
    // If optional and value is undefined/null, validation passes
    if (this.isOptional && (value === undefined || value === null)) {
      return { success: true, data: undefined, errors: [] };
    }
    // If not optional and value is undefined/null, validation fails
    if (!this.isOptional && (value === undefined || value === null)) {
      return {
        success: false,
        errors: [this.createError(path, 'Value is required', VALIDATION_ERROR_CODES.REQUIRED)],
      };
    }
    // Continue with normal validation
    return null;
  }
}

// ==================== STRING VALIDATOR ====================

/**
 * Validator for string values with length constraints and pattern matching
 * Supports email validation, URL validation, and custom regex patterns
 */
class StringValidator extends Validator<string> {
  /** Minimum required string length */
  private minLengthValue?: number;
  /** Maximum allowed string length */
  private maxLengthValue?: number;
  /** Regular expression pattern that the string must match */
  private regexPattern?: RegExp;

  /**
   * Validates that the input is a string and meets all configured constraints
   * @param value - The value to validate
   * @param path - The field path for error reporting
   * @returns ValidationResult with the validated string or error details
   */
  validate(value: unknown, path: string = ''): ValidationResult<string> {
    // Handle optional fields first
    const optionalResult = this.handleOptional(value, path);
    if (optionalResult) return optionalResult as ValidationResult<string>;

    // Type check: ensure value is a string
    if (typeof value !== 'string') {
      return {
        success: false,
        errors: [this.createError(path, 'Expected string', VALIDATION_ERROR_CODES.INVALID_TYPE)],
      };
    }

    const errors: ValidationError[] = [];

    // Validate minimum length constraint
    if (this.minLengthValue !== undefined && value.length < this.minLengthValue) {
      errors.push(
        this.createError(path, `String must be at least ${this.minLengthValue} characters`, VALIDATION_ERROR_CODES.MIN_LENGTH)
      );
    }

    // Validate maximum length constraint
    if (this.maxLengthValue !== undefined && value.length > this.maxLengthValue) {
      errors.push(
        this.createError(path, `String must be at most ${this.maxLengthValue} characters`, VALIDATION_ERROR_CODES.MAX_LENGTH)
      );
    }

    // Validate regex pattern if specified
    if (this.regexPattern && !this.regexPattern.test(value)) {
      errors.push(this.createError(path, 'String does not match required pattern', VALIDATION_ERROR_CODES.PATTERN_MISMATCH));
    }

    return {
      success: errors.length === 0,
      data: errors.length === 0 ? value : undefined,
      errors,
    };
  }

  /**
   * Sets the minimum length requirement for the string
   * @param length - Minimum number of characters required
   * @returns This validator instance for method chaining
   */
  minLength(length: number): this {
    this.minLengthValue = length;
    return this;
  }

  /**
   * Sets the maximum length requirement for the string
   * @param length - Maximum number of characters allowed
   * @returns This validator instance for method chaining
   */
  maxLength(length: number): this {
    this.maxLengthValue = length;
    return this;
  }

  /**
   * Sets a custom regex pattern that the string must match
   * @param regex - Regular expression pattern to validate against
   * @returns This validator instance for method chaining
   */
  pattern(regex: RegExp): this {
    this.regexPattern = regex;
    return this;
  }

  /**
   * Validates that the string is a valid email address
   * Uses a basic but practical email regex pattern
   * @returns This validator instance for method chaining
   */
  email(): this {
    this.regexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.customMessage = this.customMessage || 'Invalid email format';
    return this;
  }

  /**
   * Validates that the string is a valid HTTP/HTTPS URL
   * @returns This validator instance for method chaining
   */
  url(): this {
    this.regexPattern = /^https?:\/\/.+/;
    this.customMessage = this.customMessage || 'Invalid URL format';
    return this;
  }
}

// ==================== NUMBER VALIDATOR ====================

/**
 * Validator for numeric values with range constraints and integer checking
 * Supports positive/negative constraints and custom min/max ranges
 */
class NumberValidator extends Validator<number> {
  /** Minimum allowed numeric value */
  private minValue?: number;
  /** Maximum allowed numeric value */
  private maxValue?: number;
  /** Whether the number must be an integer */
  private isInteger?: boolean;

  /**
   * Validates that the input is a valid number and meets all constraints
   * @param value - The value to validate
   * @param path - The field path for error reporting
   * @returns ValidationResult with the validated number or error details
   */
  validate(value: unknown, path: string = ''): ValidationResult<number> {
    // Handle optional fields first
    const optionalResult = this.handleOptional(value, path);
    if (optionalResult) return optionalResult as ValidationResult<number>;

    // Type check: ensure value is a valid number (not NaN)
    if (typeof value !== 'number' || isNaN(value)) {
      return {
        success: false,
        errors: [this.createError(path, 'Expected number', VALIDATION_ERROR_CODES.INVALID_TYPE)],
      };
    }

    const errors: ValidationError[] = [];

    // Validate minimum value constraint
    if (this.minValue !== undefined && value < this.minValue) {
      errors.push(this.createError(path, `Number must be at least ${this.minValue}`, VALIDATION_ERROR_CODES.MIN_VALUE));
    }

    // Validate maximum value constraint
    if (this.maxValue !== undefined && value > this.maxValue) {
      errors.push(this.createError(path, `Number must be at most ${this.maxValue}`, VALIDATION_ERROR_CODES.MAX_VALUE));
    }

    // Validate integer constraint
    if (this.isInteger && !Number.isInteger(value)) {
      errors.push(this.createError(path, 'Number must be an integer', VALIDATION_ERROR_CODES.NOT_INTEGER));
    }

    return {
      success: errors.length === 0,
      data: errors.length === 0 ? value : undefined,
      errors,
    };
  }

  /**
   * Sets the minimum allowed value for the number
   * @param value - Minimum numeric value allowed
   * @returns This validator instance for method chaining
   */
  min(value: number): this {
    this.minValue = value;
    return this;
  }

  /**
   * Sets the maximum allowed value for the number
   * @param value - Maximum numeric value allowed
   * @returns This validator instance for method chaining
   */
  max(value: number): this {
    this.maxValue = value;
    return this;
  }

  /**
   * Requires the number to be an integer (no decimal places)
   * @returns This validator instance for method chaining
   */
  int(): this {
    this.isInteger = true;
    return this;
  }

  /**
   * Requires the number to be positive (greater than or equal to 0)
   * @returns This validator instance for method chaining
   */
  positive(): this {
    this.minValue = 0;
    return this;
  }

  /**
   * Requires the number to be negative (less than or equal to 0)
   * @returns This validator instance for method chaining
   */
  negative(): this {
    this.maxValue = 0;
    return this;
  }
}

// ==================== BOOLEAN VALIDATOR ====================

/**
 * Validator for boolean values
 * Supports optional validation and custom error messages
 */
class BooleanValidator extends Validator<boolean> {
  /**
   * Validates that the input is a boolean
   * @param value - The value to validate
   * @param path - The field path for error reporting
   * @returns ValidationResult with the validated boolean or error details
   */
  validate(value: unknown, path: string = ''): ValidationResult<boolean> {
    // Handle optional fields first
    const optionalResult = this.handleOptional(value, path);
    if (optionalResult) return optionalResult as ValidationResult<boolean>;

    // Type check: ensure value is a boolean
    if (typeof value !== 'boolean') {
      return {
        success: false,
        errors: [this.createError(path, 'Expected boolean', VALIDATION_ERROR_CODES.INVALID_TYPE)],
      };
    }

    return {
      success: true,
      data: value,
      errors: [],
    };
  }
}

// ==================== CURRENCY VALIDATOR ====================

/**
 * Represents a currency format with detailed information
 */
interface CurrencyFormat {
  readonly symbol: string;
  readonly code: string;
  readonly symbolPlacement: 'before' | 'after';
  readonly decimalSeparator: '.' | ',';
  readonly thousandsSeparator: ',' | '.' | ' ' | '';
  readonly decimalPlaces: number;
}

/**
 * Represents a currency value with detailed information
 */
interface CurrencyValue {
  readonly amount: number;
  readonly currency: string;
  readonly originalString: string;
}

// ==================== CURRENCY CONFIGURATIONS ====================

/**
 * Predefined currency configurations
 * Used for quick setup and initialization of currency validators
 */
const CURRENCY_CONFIGS = {
  USD: {
    symbol: '$',
    code: 'USD',
    symbolPlacement: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  GBP: {
    symbol: '£',
    code: 'GBP',
    symbolPlacement: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    symbolPlacement: 'before',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    decimalPlaces: 2,
  },
  RUB: {
    symbol: '₽',
    code: 'RUB',
    symbolPlacement: 'after',
    decimalSeparator: '.',
    thousandsSeparator: ' ',
    decimalPlaces: 2,
  },
} as const satisfies Record<string, CurrencyFormat>;

/**
 * Union type of supported currencies
 */
type SupportedCurrency = keyof typeof CURRENCY_CONFIGS;

/**
 * Validator for currency values
 * Supports validation of currency formats, amounts, and constraints
 */
class CurrencyValidator extends Validator<CurrencyValue> {
  /** Currency format to validate against */
  private currencyFormat?: CurrencyFormat;
  /** Minimum allowed currency amount */
  private minAmount?: number;
  /** Maximum allowed currency amount */
  private maxAmount?: number;
  /** Whether to allow negative currency amounts */
  private allowNegative: boolean = false;

  /**
   * Validates that the input is a valid currency value and meets all constraints
   * @param value - The value to validate
   * @param path - The field path for error reporting
   * @returns ValidationResult with the validated currency value or error details
   */
  validate(value: unknown, path: string = ''): ValidationResult<CurrencyValue> {
    // Handle optional fields first
    const optionalResult = this.handleOptional(value, path);
    if (optionalResult) return optionalResult as ValidationResult<CurrencyValue>;

    // Type check: ensure value is a string
    if (typeof value !== 'string') {
      return {
        success: false,
        errors: [this.createError(path, 'Expected currency string', VALIDATION_ERROR_CODES.INVALID_TYPE)],
      };
    }

    // Check if currency format is specified
    if (!this.currencyFormat) {
      return {
        success: false,
        errors: [this.createError(path, 'Currency format not specified', VALIDATION_ERROR_CODES.MISSING_FORMAT)],
      };
    }

    // Parse and validate the currency
    const parseResult = this.parseCurrency(value.trim());
    if (!parseResult.success) {
      return {
        success: false,
        errors: [
          this.createError(path, parseResult.error || 'Invalid currency format', VALIDATION_ERROR_CODES.INVALID_CURRENCY_FORMAT),
        ],
      };
    }

    const currencyValue = parseResult.value!;
    const errors: ValidationError[] = [];

    // Amount validations
    if (!this.allowNegative && currencyValue.amount < 0) {
      errors.push(this.createError(path, 'Currency amount cannot be negative', VALIDATION_ERROR_CODES.NEGATIVE_AMOUNT));
    }

    if (this.minAmount !== undefined && currencyValue.amount < this.minAmount) {
      errors.push(
        this.createError(
          path,
          `Amount must be at least ${this.currencyFormat.symbol}${this.minAmount}`,
          VALIDATION_ERROR_CODES.MIN_AMOUNT
        )
      );
    }

    if (this.maxAmount !== undefined && currencyValue.amount > this.maxAmount) {
      errors.push(
        this.createError(
          path,
          `Amount must be at most ${this.currencyFormat.symbol}${this.maxAmount}`,
          VALIDATION_ERROR_CODES.MAX_AMOUNT
        )
      );
    }

    return {
      success: errors.length === 0,
      data: errors.length === 0 ? currencyValue : undefined,
      errors,
    };
  }

  /**
   * Parses the currency input and validates it against the specified format
   * @param input - The currency input string to parse
   * @returns { success: boolean; value?: CurrencyValue; error?: string } indicating success/failure and parsed value or error
   */
  private parseCurrency(input: string): { success: boolean; value?: CurrencyValue; error?: string } {
    const format = this.currencyFormat!;

    // Remove extra whitespace
    let cleanInput = input.replace(/\s+/g, ' ').trim();

    // Check for currency symbol or code
    let hasSymbol = false;
    let hasCurrencyCode = false;
    let numericPart = '';

    if (format.symbolPlacement === 'before') {
      // Symbol before amount: $123.45 or USD 123.45
      if (cleanInput.startsWith(format.symbol)) {
        hasSymbol = true;
        numericPart = cleanInput.substring(format.symbol.length).trim();
      } else if (cleanInput.startsWith(format.code + ' ')) {
        hasCurrencyCode = true;
        numericPart = cleanInput.substring(format.code.length + 1).trim();
      } else {
        return { success: false, error: `Currency must start with ${format.symbol} or ${format.code}` };
      }
    } else {
      // Symbol after amount: 123.45$ or 123.45 USD
      if (cleanInput.endsWith(format.symbol)) {
        hasSymbol = true;
        numericPart = cleanInput.substring(0, cleanInput.length - format.symbol.length).trim();
      } else if (cleanInput.endsWith(' ' + format.code)) {
        hasCurrencyCode = true;
        numericPart = cleanInput.substring(0, cleanInput.length - format.code.length - 1).trim();
      } else {
        return { success: false, error: `Currency must end with ${format.symbol} or ${format.code}` };
      }
    }

    // Parse the numeric part
    const amount = this.parseAmount(numericPart, format);
    if (amount === null) {
      return { success: false, error: 'Invalid numeric format' };
    }

    return {
      success: true,
      value: {
        amount,
        currency: hasSymbol ? format.symbol : format.code,
        originalString: input,
      },
    };
  }

  /**
   * Parses the numeric part of the currency input and converts it to a number
   * @param numericStr - The numeric string to parse
   * @param format - The currency format to use for parsing
   * @returns Parsed number or null if parsing fails
   */
  private parseAmount(numericStr: string, format: CurrencyFormat): number | null {
    try {
      // Handle negative amounts
      const isNegative = numericStr.startsWith('-');
      if (isNegative) {
        numericStr = numericStr.substring(1);
      }

      // Remove thousands separators
      if (format.thousandsSeparator) {
        const thousandsRegex = new RegExp('\\' + format.thousandsSeparator, 'g');
        numericStr = numericStr.replace(thousandsRegex, '');
      }

      // Replace decimal separator with period for parsing
      if (format.decimalSeparator === ',') {
        // Find the last comma (should be decimal separator)
        const lastCommaIndex = numericStr.lastIndexOf(',');
        if (lastCommaIndex !== -1) {
          // Check if this looks like a decimal separator (followed by 1-2 digits)
          const afterComma = numericStr.substring(lastCommaIndex + 1);
          if (/^\d{1,2}$/.test(afterComma)) {
            numericStr = numericStr.substring(0, lastCommaIndex) + '.' + afterComma;
          }
        }
      }

      const amount = parseFloat(numericStr);
      if (isNaN(amount)) {
        return null;
      }

      return isNegative ? -amount : amount;
    } catch {
      return null;
    }
  }

  /**
   * Sets the currency format to use for validation
   * @param format - The currency format to use
   * @returns This validator instance for method chaining
   */
  usd(): this {
    this.currencyFormat = { ...CURRENCY_CONFIGS.USD };
    return this;
  }

  /**
   * Sets the currency format to use for validation
   * @param format - The currency format to use
   * @returns This validator instance for method chaining
   */
  gbp(): this {
    this.currencyFormat = { ...CURRENCY_CONFIGS.GBP };
    return this;
  }

  /**
   * Sets the currency format to use for validation
   * @param format - The currency format to use
   * @returns This validator instance for method chaining
   */
  eur(): this {
    this.currencyFormat = { ...CURRENCY_CONFIGS.EUR };
    return this;
  }

  /**
   * Sets the currency format to use for validation
   * @param format - The currency format to use
   * @returns This validator instance for method chaining
   */
  rub(): this {
    this.currencyFormat = { ...CURRENCY_CONFIGS.RUB };
    return this;
  }

  /**
   * Sets a custom currency format to use for validation
   * @param symbol - The currency symbol
   * @param code - The currency code
   * @param options - Partial currency format options
   * @returns This validator instance for method chaining
   */
  currency(symbol: string, code: string, options: Partial<Omit<CurrencyFormat, 'symbol' | 'code'>> = {}): this {
    this.currencyFormat = {
      symbol,
      code,
      symbolPlacement: options.symbolPlacement || 'before',
      decimalSeparator: options.decimalSeparator || '.',
      thousandsSeparator: options.thousandsSeparator || ',',
      decimalPlaces: options.decimalPlaces || 2,
    };
    return this;
  }

  /**
   * Sets the minimum allowed amount for the currency
   * @param amount - Minimum currency amount allowed
   * @returns This validator instance for method chaining
   */
  min(amount: number): this {
    this.minAmount = amount;
    return this;
  }

  /**
   * Sets the maximum allowed amount for the currency
   * @param amount - Maximum currency amount allowed
   * @returns This validator instance for method chaining
   */
  max(amount: number): this {
    this.maxAmount = amount;
    return this;
  }

  /**
   * Requires the currency amount to be positive (greater than or equal to 0)
   * @returns This validator instance for method chaining
   */
  positive(): this {
    this.minAmount = 0;
    return this;
  }

  /**
   * Allows negative currency amounts
   * @returns This validator instance for method chaining
   */
  allowNegativeAmounts(): this {
    this.allowNegative = true;
    return this;
  }

  /**
   * Sets a range of allowed amounts for the currency
   * @param min - Minimum currency amount allowed
   * @param max - Maximum currency amount allowed
   * @returns This validator instance for method chaining
   */
  range(min: number, max: number): this {
    this.minAmount = min;
    this.maxAmount = max;
    return this;
  }
}

// ==================== DATE VALIDATOR ====================

/**
 * Validator for date values with range constraints and format checking
 * Supports various date formats and constraints
 */
class DateValidator extends Validator<Date> {
  /** Minimum allowed date */
  private minDate?: Date;
  /** Maximum allowed date */
  private maxDate?: Date;
  /** Date format pattern to validate against */
  private formatPattern?: string;
  /** Date format regex to validate against */
  private formatRegex?: RegExp;

  /**
   * Validates that the input is a valid date and meets all constraints
   * @param value - The value to validate
   * @param path - The field path for error reporting
   * @returns ValidationResult with the validated date or error details
   */
  validate(value: unknown, path: string = ''): ValidationResult<Date> {
    // Handle optional fields first
    const optionalResult = this.handleOptional(value, path);
    if (optionalResult) return optionalResult as ValidationResult<Date>;

    let date: Date;

    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string') {
      // If a format is specified, validate the string format first
      if (this.formatPattern && this.formatRegex) {
        if (!this.formatRegex.test(value)) {
          return {
            success: false,
            errors: [
              this.createError(path, `Date must be in format ${this.formatPattern}`, VALIDATION_ERROR_CODES.INVALID_DATE_FORMAT),
            ],
          };
        }

        // Parse according to the specified format
        date = this.parseFormattedDate(value);
      } else {
        date = new Date(value);
      }
    } else if (typeof value === 'number') {
      date = new Date(value);
    } else {
      return {
        success: false,
        errors: [this.createError(path, 'Expected date', VALIDATION_ERROR_CODES.INVALID_TYPE)],
      };
    }

    if (isNaN(date.getTime())) {
      return {
        success: false,
        errors: [this.createError(path, 'Invalid date', VALIDATION_ERROR_CODES.INVALID_DATE)],
      };
    }

    const errors: ValidationError[] = [];

    // Date range validations
    if (this.minDate && date < this.minDate) {
      errors.push(this.createError(path, `Date must be after ${this.minDate.toISOString()}`, VALIDATION_ERROR_CODES.MIN_DATE));
    }

    if (this.maxDate && date > this.maxDate) {
      errors.push(this.createError(path, `Date must be before ${this.maxDate.toISOString()}`, VALIDATION_ERROR_CODES.MAX_DATE));
    }

    return {
      success: errors.length === 0,
      data: errors.length === 0 ? date : undefined,
      errors,
    };
  }

  /**
   * Parses the date input and converts it to a Date object
   * @param dateString - The date input string to parse
   * @returns Parsed Date object
   */
  private parseFormattedDate(dateString: string): Date {
    if (!this.formatPattern) {
      return new Date(dateString);
    }

    const format = this.formatPattern.toLowerCase();

    switch (format) {
      case 'dd/mm/yyyy':
        return this.parseDDMMYYYY(dateString, '/');
      case 'dd-mm-yyyy':
        return this.parseDDMMYYYY(dateString, '-');
      case 'dd.mm.yyyy':
        return this.parseDDMMYYYY(dateString, '.');
      case 'mm/dd/yyyy':
        return this.parseMMDDYYYY(dateString, '/');
      case 'mm-dd-yyyy':
        return this.parseMMDDYYYY(dateString, '-');
      case 'mm.dd.yyyy':
        return this.parseMMDDYYYY(dateString, '.');
      case 'yyyy/mm/dd':
        return this.parseYYYYMMDD(dateString, '/');
      case 'yyyy-mm-dd':
        return this.parseYYYYMMDD(dateString, '-');
      case 'yyyy.mm.dd':
        return this.parseYYYYMMDD(dateString, '.');
      case 'dd/mm/yy':
        return this.parseDDMMYY(dateString, '/');
      case 'dd-mm-yy':
        return this.parseDDMMYY(dateString, '-');
      case 'mm/dd/yy':
        return this.parseMMDDYY(dateString, '/');
      case 'mm-dd-yy':
        return this.parseMMDDYY(dateString, '-');
      case 'iso8601':
        return new Date(dateString);
      default:
        return new Date(dateString);
    }
  }

  /**
   * Parses a date string in DD/MM/YYYY format
   * @param dateString - The date string to parse
   * @param separator - The separator character used in the date string
   * @returns Parsed Date object
   */
  private parseDDMMYYYY(dateString: string, separator: string): Date {
    const parts = dateString.split(separator);
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JS Date
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  /**
   * Parses a date string in MM/DD/YYYY format
   * @param dateString - The date string to parse
   * @param separator - The separator character used in the date string
   * @returns Parsed Date object
   */
  private parseMMDDYYYY(dateString: string, separator: string): Date {
    const parts = dateString.split(separator);
    const month = parseInt(parts[0], 10) - 1; // Month is 0-indexed in JS Date
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  /**
   * Parses a date string in YYYY/MM/DD format
   * @param dateString - The date string to parse
   * @param separator - The separator character used in the date string
   * @returns Parsed Date object
   */
  private parseYYYYMMDD(dateString: string, separator: string): Date {
    const parts = dateString.split(separator);
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JS Date
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  /**
   * Parses a date string in DD/MM/YY format
   * @param dateString - The date string to parse
   * @param separator - The separator character used in the date string
   * @returns Parsed Date object
   */
  private parseDDMMYY(dateString: string, separator: string): Date {
    const parts = dateString.split(separator);
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JS Date
    let year = parseInt(parts[2], 10);

    // Convert 2-digit year to 4-digit year
    // Assume years 00-29 are 2000-2029, years 30-99 are 1930-1999
    if (year <= 29) {
      year += 2000;
    } else if (year <= 99) {
      year += 1900;
    }

    return new Date(year, month, day);
  }

  /**
   * Parses a date string in MM/DD/YY format
   * @param dateString - The date string to parse
   * @param separator - The separator character used in the date string
   * @returns Parsed Date object
   */
  private parseMMDDYY(dateString: string, separator: string): Date {
    const parts = dateString.split(separator);
    const month = parseInt(parts[0], 10) - 1; // Month is 0-indexed in JS Date
    const day = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);

    // Convert 2-digit year to 4-digit year
    // Assume years 00-29 are 2000-2029, years 30-99 are 1930-1999
    if (year <= 29) {
      year += 2000;
    } else if (year <= 99) {
      year += 1900;
    }

    return new Date(year, month, day);
  }

  /**
   * Sets the minimum allowed date
   * @param date - Minimum allowed date
   * @returns This validator instance for method chaining
   */
  min(date: Date): this {
    this.minDate = date;
    return this;
  }

  /**
   * Sets the maximum allowed date
   * @param date - Maximum allowed date
   * @returns This validator instance for method chaining
   */
  max(date: Date): this {
    this.maxDate = date;
    return this;
  }

  /**
   * Sets the maximum allowed date to the current date
   * @returns This validator instance for method chaining
   */
  past(): this {
    this.maxDate = new Date();
    return this;
  }

  /**
   * Sets the minimum allowed date to the current date
   * @returns This validator instance for method chaining
   */
  future(): this {
    this.minDate = new Date();
    return this;
  }

  /**
   * Sets a custom date format pattern and creates a regex for validation
   * @param pattern - The date format pattern to use
   * @returns This validator instance for method chaining
   */
  format(pattern: string): this {
    this.formatPattern = pattern;

    // Create regex pattern based on format
    const regexPattern = pattern
      .toLowerCase()
      .replace(/dd/g, '\\d{2}')
      .replace(/mm/g, '\\d{2}')
      .replace(/yyyy/g, '\\d{4}')
      .replace(/yy/g, '\\d{2}')
      .replace(/[/.()-]/g, '\\$&'); // Escape special characters

    this.formatRegex = new RegExp(`^${regexPattern}$`);
    return this;
  }

  /**
   * Sets the date format to DD/MM/YYYY
   * @param separator - The separator character to use
   * @returns This validator instance for method chaining
   */
  ddmmyyyy(separator: string = '/'): this {
    return this.format(`DD${separator}MM${separator}YYYY`);
  }

  /**
   * Sets the date format to MM/DD/YYYY
   * @param separator - The separator character to use
   * @returns This validator instance for method chaining
   */
  mmddyyyy(separator: string = '/'): this {
    return this.format(`MM${separator}DD${separator}YYYY`);
  }

  /**
   * Sets the date format to YYYY/MM/DD
   * @param separator - The separator character to use
   * @returns This validator instance for method chaining
   */
  yyyymmdd(separator: string = '-'): this {
    return this.format(`YYYY${separator}MM${separator}DD`);
  }

  /**
   * Sets the date format to DD/MM/YY
   * @param separator - The separator character to use
   * @returns This validator instance for method chaining
   */
  ddmmyy(separator: string = '/'): this {
    return this.format(`DD${separator}MM${separator}YY`);
  }

  /**
   * Sets the date format to MM/DD/YY
   * @param separator - The separator character to use
   * @returns This validator instance for method chaining
   */
  mmddyy(separator: string = '/'): this {
    return this.format(`MM${separator}DD${separator}YY`);
  }

  /**
   * Sets the date format to ISO8601
   * @returns This validator instance for method chaining
   */
  iso8601(): this {
    this.formatPattern = 'ISO8601';
    this.formatRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return this;
  }
}

// ==================== ARRAY VALIDATOR ====================

/**
 * Validator for arrays with length constraints and item validation
 * @template T - The type of items in the array
 */
class ArrayValidator<T> extends Validator<T[]> {
  /** Minimum allowed array length */
  private minLengthValue?: number;
  /** Maximum allowed array length */
  private maxLengthValue?: number;

  constructor(private itemValidator: Validator<T>) {
    super();
  }

  /**
   * Validates that the input is an array and meets all constraints
   * @param value - The value to validate
   * @param path - The field path for error reporting
   * @returns ValidationResult with the validated array or error details
   */
  validate(value: unknown, path: string = ''): ValidationResult<T[]> {
    // Handle optional fields first
    const optionalResult = this.handleOptional(value, path);
    if (optionalResult) return optionalResult as ValidationResult<T[]>;

    // Type check: ensure value is an array
    if (!Array.isArray(value)) {
      return {
        success: false,
        errors: [this.createError(path, 'Expected array', VALIDATION_ERROR_CODES.INVALID_TYPE)],
      };
    }

    const errors: ValidationError[] = [];

    // Length validations
    if (this.minLengthValue !== undefined && value.length < this.minLengthValue) {
      errors.push(
        this.createError(path, `Array must have at least ${this.minLengthValue} items`, VALIDATION_ERROR_CODES.MIN_LENGTH)
      );
    }

    if (this.maxLengthValue !== undefined && value.length > this.maxLengthValue) {
      errors.push(
        this.createError(path, `Array must have at most ${this.maxLengthValue} items`, VALIDATION_ERROR_CODES.MAX_LENGTH)
      );
    }

    // Validate each item
    const validatedItems: T[] = [];
    for (let i = 0; i < value.length; i++) {
      const itemResult = this.itemValidator.validate(value[i], `${path}[${i}]`);
      if (!itemResult.success) {
        errors.push(...itemResult.errors);
      } else if (itemResult.data !== undefined) {
        validatedItems.push(itemResult.data);
      }
    }

    return {
      success: errors.length === 0,
      data: errors.length === 0 ? validatedItems : undefined,
      errors,
    };
  }

  /**
   * Sets the minimum allowed length for the array
   * @param length - Minimum number of items allowed in the array
   * @returns This validator instance for method chaining
   */
  minLength(length: number): this {
    this.minLengthValue = length;
    return this;
  }

  /**
   * Sets the maximum allowed length for the array
   * @param length - Maximum number of items allowed in the array
   * @returns This validator instance for method chaining
   */
  maxLength(length: number): this {
    this.maxLengthValue = length;
    return this;
  }

  /**
   * Requires the array to have at least one item
   * @returns This validator instance for method chaining
   */
  nonEmpty(): this {
    this.minLengthValue = 1;
    return this;
  }
}

// ==================== OBJECT VALIDATOR ====================

/**
 * Validator for objects with schema-based validation
 * @template T - The type of the object being validated
 */
class ObjectValidator<T> extends Validator<T> {
  constructor(private schema: Record<string, Validator<any>>) {
    super();
  }

  /**
   * Validates that the input is an object and meets all constraints
   * @param value - The value to validate
   * @param path - The field path for error reporting
   * @returns ValidationResult with the validated object or error details
   */
  validate(value: unknown, path: string = ''): ValidationResult<T> {
    // Handle optional fields first
    const optionalResult = this.handleOptional(value, path);
    if (optionalResult) return optionalResult as ValidationResult<T>;

    // Type check: ensure value is an object and not null or an array
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return {
        success: false,
        errors: [this.createError(path, 'Expected object', VALIDATION_ERROR_CODES.INVALID_TYPE)],
      };
    }

    const obj = value as Record<string, any>;
    const result: Record<string, any> = {};
    const errors: ValidationError[] = [];

    // Validate each property in the schema
    for (const [key, validator] of Object.entries(this.schema)) {
      const fieldPath = path ? `${path}.${key}` : key;
      const fieldResult = validator.validate(obj[key], fieldPath);

      if (!fieldResult.success) {
        errors.push(...fieldResult.errors);
      } else if (fieldResult.data !== undefined) {
        result[key] = fieldResult.data;
      }
    }

    return {
      success: errors.length === 0,
      data: errors.length === 0 ? (result as T) : undefined,
      errors,
    };
  }

  /**
   * Creates a partial validator for the object
   * @returns A new ObjectValidator instance with all validators set to optional
   */
  partial(): ObjectValidator<Partial<T>> {
    const partialSchema: Record<string, Validator<any>> = {};
    for (const [key, validator] of Object.entries(this.schema)) {
      partialSchema[key] = validator.optional();
    }
    return new ObjectValidator<Partial<T>>(partialSchema);
  }
}

// ==================== SCHEMA BUILDER ====================

/**
 * Schema builder class for creating validators and schemas
 */
class Schema {
  /**
   * Creates a new StringValidator instance
   * @returns A new StringValidator instance
   */
  static string(): StringValidator {
    return new StringValidator();
  }

  /**
   * Creates a new NumberValidator instance
   * @returns A new NumberValidator instance
   */
  static number(): NumberValidator {
    return new NumberValidator();
  }

  /**
   * Creates a new BooleanValidator instance
   * @returns A new BooleanValidator instance
   */
  static boolean(): BooleanValidator {
    return new BooleanValidator();
  }

  /**
   * Creates a new DateValidator instance
   * @returns A new DateValidator instance
   */
  static date(): DateValidator {
    return new DateValidator();
  }

  /**
   * Creates a new CurrencyValidator instance
   * @returns A new CurrencyValidator instance
   */
  static currency(): CurrencyValidator {
    return new CurrencyValidator();
  }

  /**
   * Creates a new ObjectValidator instance
   * @param schema - The schema to use for validation
   * @returns A new ObjectValidator instance
   */
  static object<T>(schema: Record<string, Validator<any>>): ObjectValidator<T> {
    return new ObjectValidator<T>(schema);
  }

  /**
   * Creates a new ArrayValidator instance
   * @param itemValidator - The validator to use for validating items in the array
   * @returns A new ArrayValidator instance
   */
  static array<T>(itemValidator: Validator<T>): ArrayValidator<T> {
    return new ArrayValidator<T>(itemValidator);
  }

  /**
   * Creates a new Validator instance for a literal value
   * @template T - The type of the literal value
   * @param value - The literal value to create a validator for
   * @returns A new Validator instance for the literal value
   */
  static literal<T extends string | number | boolean>(value: T): Validator<T> {
    return new (class extends Validator<T> {
      validate(input: unknown, path: string = ''): ValidationResult<T> {
        const optionalResult = this.handleOptional(input, path);
        if (optionalResult) return optionalResult as ValidationResult<T>;

        if (input !== value) {
          return {
            success: false,
            errors: [this.createError(path, `Expected literal value: ${value}`, VALIDATION_ERROR_CODES.LITERAL_MISMATCH)],
          };
        }

        return { success: true, data: value, errors: [] };
      }
    })();
  }

  /**
   * Creates a new Validator instance for a union of multiple validators
   * @template T - The type of the union
   * @param validators - The array of validators to create a union of
   * @returns A new Validator instance for the union
   */
  static union<T extends readonly Validator<any>[]>(
    ...validators: T
  ): Validator<T[number] extends Validator<infer U> ? U : never> {
    return new (class extends Validator<T[number] extends Validator<infer U> ? U : never> {
      validate(value: unknown, path: string = ''): ValidationResult<T[number] extends Validator<infer U> ? U : never> {
        const optionalResult = this.handleOptional(value, path);
        if (optionalResult) return optionalResult as ValidationResult<T[number] extends Validator<infer U> ? U : never>;

        const errors: ValidationError[] = [];

        for (const validator of validators) {
          const result = validator.validate(value, path);
          if (result.success) {
            return result as ValidationResult<T[number] extends Validator<infer U> ? U : never>;
          }
          errors.push(...result.errors);
        }

        return {
          success: false,
          errors: [
            this.createError(path, 'Value does not match any of the expected types', VALIDATION_ERROR_CODES.UNION_MISMATCH),
          ],
        };
      }
    })();
  }
}

// ==================== EXAMPLE SCHEMAS ====================

/**
 * Defines a complex schema for validating address data
 */
const addressSchema = Schema.object({
  street: Schema.string(),
  city: Schema.string(),
  postalCode: Schema.string()
    .pattern(/^\d{5}$/)
    .withMessage('Postal code must be 5 digits'),
  country: Schema.string(),
});

/**
 * Defines a complex schema for validating user data
 */
const userSchema = Schema.object({
  id: Schema.string().withMessage('ID must be a string'),
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().email(),
  age: Schema.number().min(0).max(150).optional(),
  isActive: Schema.boolean(),
  tags: Schema.array(Schema.string()).nonEmpty(),
  address: addressSchema.optional(),
  metadata: Schema.object({}).optional(),
});

// ==================== EXPORT TYPES ====================

/**
 * Export type for UserType
 */
export type UserType = {
  id: string;
  name: string;
  email: string;
  age?: number;
  isActive: boolean;
  tags: string[];
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  metadata?: Record<string, any>;
};

// ==================== EXAMPLE USAGE ====================

/**
 * Example usage of userSchema
 */
const userData = {
  id: '12345',
  name: 'John Doe',
  email: 'john@example.com',
  isActive: true,
  tags: ['developer', 'designer'],
  address: {
    street: '123 Main St',
    city: 'Anytown',
    postalCode: '12345',
    country: 'USA',
  },
};

const result = userSchema.validate(userData);

// ==================== EXPORT MAIN CLASSES AND INTERFACES ====================

/**
 * Export the main classes and interfaces
 */
export {
  // Core classes
  Schema,
  Validator,
  StringValidator,
  NumberValidator,
  BooleanValidator,
  DateValidator,
  CurrencyValidator,
  ArrayValidator,
  ObjectValidator,

  // Types and interfaces
  ValidationResult,
  ValidationError,
  ValidationErrorCode,
  CurrencyFormat,
  CurrencyValue,
  SupportedCurrency,

  // Constants
  VALIDATION_ERROR_CODES,
  CURRENCY_CONFIGS,

  // Example schemas
  userSchema,
  addressSchema,
};

// ==================== EXAMPLE USAGE AND TESTING ====================

/**
 * Example usage and testing
 */
console.log('Validation Result:', result);
if (result.success) {
  console.log('✅ Validation passed!');
  console.log('Validated data:', result.data);
} else {
  console.log('❌ Validation failed!');
  result.errors.forEach((error) => {
    console.log(`Error at ${error.path}: ${error.message} (${error.code})`);
  });
}
