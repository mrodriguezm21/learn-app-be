export const roleAuthorizer = async (event, context, callback) => {
  console.log("event", event);
  const { authorizationToken } = event;
  const token = authorizationToken.split(" ")[1];
  const { role } = jwt.verify(token, process.env.JWT_SECRET);
  const effect = role === "trainer" ? "Allow" : "Deny";

  const policyDocument = {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: "*",
      },
    ],
  };

  const authResponse = {
    principalId: username,
    policyDocument,
  };

  callback(null, authResponse);
};
