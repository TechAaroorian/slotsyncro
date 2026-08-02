export function PrismaAdapter(prisma) {
    const p = prisma;
    return {
        // We need to let Prisma generate the ID because our default UUID is incompatible with MongoDB
        createUser: ({ id, ...data }) => p.user.create(stripUndefined(data)),
        getUser: (id) => p.user.findUnique({ where: { id } }),
        getUserByEmail: (email) => p.user.findUnique({ where: { email } }),
        async getUserByAccount(provider_providerAccountId) {
            const account = await p.account.findUnique({
                where: { provider_providerAccountId },
                include: { user: true },
            });
            return account?.user ?? null;
        },
        updateUser: ({ id, ...data }) => p.user.update({
            where: { id },
            ...stripUndefined(data),
        }),
        deleteUser: (id) => p.user.delete({ where: { id } }),
        linkAccount: (data) => p.account.create({ data }),
        unlinkAccount: (provider_providerAccountId) => p.account.delete({
            where: { provider_providerAccountId },
        }),
        async getSessionAndUser(sessionToken) {
            const userAndSession = await p.session.findUnique({
                where: { sessionToken },
                include: { user: true },
            });
            if (!userAndSession)
                return null;
            const { user, ...session } = userAndSession;
            return { user, session };
        },
        createSession: (data) => p.session.create(stripUndefined(data)),
        updateSession: (data) => p.session.update({
            where: { sessionToken: data.sessionToken },
            ...stripUndefined(data),
        }),
        deleteSession: (sessionToken) => p.session.delete({ where: { sessionToken } }),
        async createVerificationToken(data) {
            const verificationToken = await p.verificationToken.create(stripUndefined(data));
            if ("id" in verificationToken && verificationToken.id)
                delete verificationToken.id;
            return verificationToken;
        },
        async useVerificationToken(identifier_token) {
            try {
                const verificationToken = await p.verificationToken.delete({
                    where: { identifier_token },
                });
                if ("id" in verificationToken && verificationToken.id)
                    delete verificationToken.id;
                return verificationToken;
            }
            catch (error) {
                // If token already used/deleted, just return null
                // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
                if (error &&
                    typeof error === "object" &&
                    "code" in error &&
                    error.code === "P2025")
                    return null;
                throw error;
            }
        },
        async getAccount(providerAccountId, provider) {
            return p.account.findFirst({
                where: { providerAccountId, provider },
            });
        },
        async createAuthenticator(data) {
            return p.authenticator.create(stripUndefined(data));
        },
        async getAuthenticator(credentialID) {
            return p.authenticator.findUnique({
                where: { credentialID },
            });
        },
        async listAuthenticatorsByUserId(userId) {
            return p.authenticator.findMany({
                where: { userId },
            });
        },
        async updateAuthenticatorCounter(credentialID, counter) {
            return p.authenticator.update({
                where: { credentialID },
                data: { counter },
            });
        },
    };
}
/** @see https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/null-and-undefined */
function stripUndefined(obj) {
    const data = {};
    for (const key in obj)
        if (obj[key] !== undefined)
            data[key] = obj[key];
    return { data };
}
