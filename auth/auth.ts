import { getServerSession, NextAuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/',
  },

  providers: [
    CognitoProvider({
      id: "cognito",
      name: "cognito",
      idToken: true,
      checks: ["pkce", "state", "nonce"],
      clientId: process.env.COGNITO_CLIENT_ID ?? "",
      clientSecret: process.env.COGNITO_CLIENT_SECRET ?? "",
      issuer: `https://cognito-idp.us-east-1.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
      authorization: {
        url: `${process.env.COGNITO_DOMAIN}/oauth2/authorize`,
        params: {
          response_mode: "code",
          client_id: process.env.COGNITO_CLIENT_ID,
          identity_provider: 'Google',
          scope: "openid profile email",
          redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/cognito`,
        },
      },
      profile(profile, tokens) {
        return {
          id: profile['cognito:username'], // provided id from cognito
          oauthId: profile.sub, // provided id from oauth
          email: profile.email,
          name: profile.name,
          accessToken: tokens.access_token,
        }
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
  },
  secret: process.env.NEXTAUTH_SECRET ?? "",
}

export const getServerAuthSession = () => getServerSession(authOptions);
