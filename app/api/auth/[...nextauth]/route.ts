import NextAuth, { getServerSession, NextAuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";
import CredentialsProvider from "next-auth/providers/credentials";
import { CognitoUser, CognitoUserPool, CognitoUserSession, AuthenticationDetails } from 'amazon-cognito-identity-js'
import { signIn } from "next-auth/react";

const UserPool = new CognitoUserPool({
  UserPoolId: process.env.COGNITO_USER_POOL_ID ?? "",
  ClientId: process.env.COGNITO_CLIENT_ID ?? ""
});

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
          redirect_uri: "http://localhost:3000/api/auth/callback/cognito",
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

export const handler = NextAuth(authOptions);
export const getServerAuthSession = () => getServerSession(authOptions);


export { handler as GET, handler as POST }



/**
 *     CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" }
      },
      authorize(credentials) {

        if (!credentials?.email || !credentials?.password) {
          return Promise.resolve(null);
        }

        const cognitoUser = new CognitoUser({
          Username: credentials?.email,
          Pool: UserPool,
        });

        const authenticationDetails = new AuthenticationDetails({
          Username: credentials?.email,
          Password: credentials?.password
        });

        return new Promise((resolve, reject) => {
          cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (session) => {
              if (session instanceof CognitoUserSession) {
                const userInfo = {
                  id: session.getIdToken().payload.sub,
                  email: session.getIdToken().payload.email,
                  name: session.getIdToken().payload.name,
                  idToken: session.getIdToken().getJwtToken(),
                  accessToken: session.getAccessToken().getJwtToken(),
                  refreshToken: session.getRefreshToken().getToken(),
                };

                resolve(userInfo);
              }
            },
            onFailure: (error) => {
              if (error) {
                reject(error);
              }
            }
          })
        })
      }
    })
 */