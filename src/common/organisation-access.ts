import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

//Only a global admin has access across every organisation
export function assertOrganisationAccess(
    targetOrganisationId: number | null,
    requester: { role: string; organisationId: number | null },
    message = 'You do not have permission to access this organisation',
) {
    if (requester.role === Role.GLOBAL_ADMIN) {
        return;
    }
    if (
        targetOrganisationId === null ||
        requester.organisationId !== targetOrganisationId
    ) {
        throw new ForbiddenException(message);
    }
}