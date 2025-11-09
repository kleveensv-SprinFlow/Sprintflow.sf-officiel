import { ValidationError } from './errors';

export type ValidationRule<T = any> = (value: T) => string | null;

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function required(message = 'Ce champ est requis'): ValidationRule {
  return (value: any) => {
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      return message;
    }
    return null;
  };
}

export function minLength(min: number, message?: string): ValidationRule<string> {
  return (value: string) => {
    if (value && value.length < min) {
      return message || `Minimum ${min} caractères requis`;
    }
    return null;
  };
}

export function maxLength(max: number, message?: string): ValidationRule<string> {
  return (value: string) => {
    if (value && value.length > max) {
      return message || `Maximum ${max} caractères autorisés`;
    }
    return null;
  };
}

export function email(message = 'Email invalide'): ValidationRule<string> {
  return (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return message;
    }
    return null;
  };
}

export function pattern(regex: RegExp, message = 'Format invalide'): ValidationRule<string> {
  return (value: string) => {
    if (value && !regex.test(value)) {
      return message;
    }
    return null;
  };
}

export function min(minValue: number, message?: string): ValidationRule<number> {
  return (value: number) => {
    if (value !== null && value !== undefined && value < minValue) {
      return message || `La valeur doit être au moins ${minValue}`;
    }
    return null;
  };
}

export function max(maxValue: number, message?: string): ValidationRule<number> {
  return (value: number) => {
    if (value !== null && value !== undefined && value > maxValue) {
      return message || `La valeur doit être au maximum ${maxValue}`;
    }
    return null;
  };
}

export function phoneNumber(message = 'Numéro de téléphone invalide'): ValidationRule<string> {
  return (value: string) => {
    if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
      return message;
    }
    return null;
  };
}

export function url(message = 'URL invalide'): ValidationRule<string> {
  return (value: string) => {
    if (value) {
      try {
        new URL(value);
        return null;
      } catch {
        return message;
      }
    }
    return null;
  };
}

export function custom<T>(
  validator: (value: T) => boolean,
  message = 'Valeur invalide'
): ValidationRule<T> {
  return (value: T) => {
    if (!validator(value)) {
      return message;
    }
    return null;
  };
}

export class Validator<T extends Record<string, any>> {
  private rules: Partial<Record<keyof T, ValidationRule[]>> = {};

  field(fieldName: keyof T, ...rules: ValidationRule[]): this {
    this.rules[fieldName] = rules;
    return this;
  }

  validate(data: T): ValidationResult {
    const errors: Record<string, string> = {};

    for (const [fieldName, rules] of Object.entries(this.rules) as [keyof T, ValidationRule[]][]) {
      const value = data[fieldName];

      for (const rule of rules) {
        const error = rule(value);
        if (error) {
          errors[fieldName as string] = error;
          break;
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  validateOrThrow(data: T): void {
    const result = this.validate(data);
    if (!result.isValid) {
      const firstError = Object.entries(result.errors)[0];
      throw new ValidationError(
        firstError[1],
        firstError[0],
        firstError[1]
      );
    }
  }
}

export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: Partial<Record<keyof T, ValidationRule[]>>
): ValidationResult {
  const validator = new Validator<T>();

  for (const [fieldName, fieldRules] of Object.entries(rules) as [keyof T, ValidationRule[]][]) {
    validator.field(fieldName, ...fieldRules);
  }

  return validator.validate(data);
}

export function validateField(value: any, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
}
