import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const ALLOWED_FICTIONAL_DOMAINS = ['trulyfake.com'];

export function IsFictionalEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFictionalEmail',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          const domain = value.split('@')[1]?.toLowerCase();
          return !!domain && ALLOWED_FICTIONAL_DOMAINS.includes(domain);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must use an approved fictional domain (${ALLOWED_FICTIONAL_DOMAINS.join(', ')})`;
        },
      },
    });
  };
}
