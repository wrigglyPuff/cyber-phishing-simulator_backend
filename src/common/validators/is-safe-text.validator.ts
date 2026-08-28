import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';

//Blocks common character sequences and
//keywords commonly used to break
//out of a SQL statement
const SQL_INJECTION_PATTERN =
    /(--|;|\/\*|\*\/|\bxp_cmdshell\b|\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|CREATE)\b)/i;

export function IsSafeText(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isSafeText',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    if (typeof value !== 'string') return false;
                    return !SQL_INJECTION_PATTERN.test(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} contains characters or keywords that are not allowed`;
                },
            },
        });
    };
}