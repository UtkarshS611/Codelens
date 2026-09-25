import { Repository } from "@/lib/db/models/Repository";

interface UpsertRepositoryParams {
    githubId: number;
    installationId: number;
    owner: string;
    name: string;
    fullName: string;
    defaultBranch?: string;
}

export async function findOrCreateRepository(
    params: UpsertRepositoryParams
) {
    const repository = await Repository.findOneAndUpdate(
        {
            githubId: params.githubId,
        },
        {
            $set: {
                installationId: params.installationId,
                owner: params.owner,
                name: params.name,
                fullName: params.fullName,
                ...(params.defaultBranch && {
                    defaultBranch: params.defaultBranch,
                }),
                isActive: true,
            },
            $setOnInsert: {
                githubId: params.githubId,
            },
        },
        {
            returnDocument: "after",
            upsert: true,
            setDefaultsOnInsert: true,
        }
    )

    return repository;
}