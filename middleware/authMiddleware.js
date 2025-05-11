import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import dotenv from "dotenv";

dotenv.config();

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

export const getAccessTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
};

export const verifyToken = async (req, res, next) => {
  try {
    const accessToken = getAccessTokenFromRequest(req);

    if (!accessToken) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify the token with Cognito
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    try {
      const data = await cognitoClient.send(command);
      console.log("Token verified successfully:", data);
      req.user = {
        email: data.UserAttributes.find((attr) => attr.Name === "email").Value,
        username: data.Username,
      };
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
