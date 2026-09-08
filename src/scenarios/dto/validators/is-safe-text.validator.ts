import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';

const SQL_KEYWORDS = 'SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|CREATE';

//Structural markers that have no place in ordinary prose: comment
//sequences, statement terminators, and the classic xp_cmdshell payload
const SQL_STRUCTURAL_PATTERN = /(--|;|\/\*|\*\/|\bxp_cmdshell\b)/i;

//A keyword sitting right next to a quote is the classic breakout shape,
//e.g. `' OR '1'='1` or `" UNION SELECT ...` - prose never quotes like this
const KEYWORD_NEAR_QUOTE_PATTERN = new RegExp(
    `['"][^'"]{0,10}\\b(${SQL_KEYWORDS})\\b|\\b(${SQL_KEYWORDS})\\b[^'"]{0,10}['"]`,
    'i',
);

//Two or more keywords chained together (UNION SELECT, ; DROP TABLE, etc.)
//is how real injections read; a single keyword is just as likely to be an
//ordinary English word like "update" or "create" used in a sentence
const SQL_KEYWORD_PATTERN = new RegExp(`\\b(${SQL_KEYWORDS})\\b`, 'gi');

function looksLikeSqlInjection(value: string): boolean {
    if (SQL_STRUCTURAL_PATTERN.test(value)) {
        return true;
    }
    if (KEYWORD_NEAR_QUOTE_PATTERN.test(value)) {
        return true;
    }
    const keywordMatches = value.match(SQL_KEYWORD_PATTERN) ?? [];
    return keywordMatches.length >= 2;
}

export function IsSafeText(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isSafeText',
            target: object.constructor, propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    if (typeof value !== 'string') return false;
                    return !looksLikeSqlInjection(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} contains charachters or keywords that are not allowed`;
                },
            },
        });
    };
}
