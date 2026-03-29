import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's internal database ID. */
      id: string
      /** The user's specific role in the organization. */
      role: string
      /** The logical isolation token mapping them to their parent corporate entity. */
      companyId: string
      /** The base currency calculation metric for the entire organization. */
      companyCurrency: string
    } & DefaultSession["user"]
  }

  interface User {
      role: string
      companyId: string
      companyCurrency: string
  }
}
