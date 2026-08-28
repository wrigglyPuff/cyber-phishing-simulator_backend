import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';

//Deliberately excludes ; -- /* */ ' ", used for SQL injection building blocks.
const ORGANISATION_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 .,&()-]*$/;

export function IsOrganisationName(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isOrganisationName',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    if (typeof value !== 'string') return false;
                    return ORGANISATION_NAME_PATTERN.test(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} may only contain letters, numbers, spaces and the punctuation . , & ( ) -`;
                },
            },
        });
    };
}