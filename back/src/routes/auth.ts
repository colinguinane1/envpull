import { Hono } from "hono";
import type { Context, Next } from "hono";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import { createToken } from "../lib/jwt";
import { jwtVerify } from "jose";
import { generateRecoveryKey } from "../lib/recoveryKey";
import axios from "axios";

type AuthEnv = {
  Variables: {
    userId: string;
  };
};

const auth = new Hono<AuthEnv>();

export const authMiddleware = async (c: Context<AuthEnv>, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    c.set("userId", payload.userId as string);

    await next();
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
};

auth.use("/github/start", authMiddleware)

auth.get("/github/start", async (c) => {
  const userId = c.get("userId");

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  const state = Buffer.from(
    JSON.stringify({
      userId: user.id,
    })
  ).toString("base64url");

  const url =
    "https://github.com/login/oauth/authorize" +
    `?client_id=${process.env.GITHUB_CLIENT_ID}` +
    "&scope=repo%20read:user%20user:email" +
    `&state=${state}`;

  return c.json({ url });
});

auth.get("/github/callback", async (c) => {
  const code = c.req.query("code");
   const state = c.req.query("state");

  if (!code) {
    return c.json({error: "Missing github code"}, 400)
  }

  const { userId } = JSON.parse(
     Buffer.from(state!, "base64url").toString()
   );

  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    return c.json({error: "User not found"}, 404)
  }

  const tokenResponse = await axios.post("https://github.com/login/oauth/access_token", {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
  }, {
    headers: {
      Accept: "application/json"
    }
  })
  const accessToken = tokenResponse.data.access_token;

  if (!accessToken) {
    return c.json({error: "No access token from github"}, 403)
  }

  const githubResponse = await axios.get(
     "https://api.github.com/user",
     {
       headers: {
         Authorization: `Bearer ${accessToken}`,
         Accept: "application/json",
       },
     }
   );

  const githubUser = githubResponse.data;

  await prisma.user.update({ where: { id: userId }, data: { githubId: githubUser.id, githubAccessToken: accessToken } })

  console.log("recieved this github data: ", githubResponse)
  return c.json({ message: "github data received", githubUser })
})


auth.get("/github", (c) => {
  const url =
    "https://github.com/login/oauth/authorize" +
    `?client_id=${process.env.GITHUB_CLIENT_ID}` +
    "&scope=repo%20read:user%20user:email";

  return c.redirect(url);
})

auth.get("/test", (c) => {
  return c.json({
    message: "auth route working",
  });
});

auth.use("/me", authMiddleware);

auth.get("/me", async (c) => {
  const userId = c.get("userId");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, createdAt: true },
  });

  return c.json(user);
});

// sign up will act as both signup and login
auth.post("/login", async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: "Email and password required" }, 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash(password, 10);

    const recoveryKey = generateRecoveryKey();
    if (!recoveryKey) {
      return c.json({ error: "Error creating recovery keys" }, 401);
    }

    const recoveryKeyHash = await bcrypt.hash(recoveryKey, 10);

    const user = await prisma.user.create({
      data: { email, passwordHash, recoveryKeyHash },
    });

    const token = await createToken(user.id);

    return c.json({ token, recoveryKey });
  }

  const validPassword = await bcrypt.compare(
    password,
    existingUser?.passwordHash,
  );

  if (!validPassword) {
    return c.json({ error: "User exists but has invalid credentials" }, 401);
  }

  const token = await createToken(existingUser.id);

  return c.json({ token });
});

auth.post("/login-2", async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return c.json({ error: "Invalid credentials OR no user found" }, 401);
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);

  if (!validPassword) {
    return c.json({ error: "Invalid credentials." }, 401);
  }

  const token = await createToken(user.id);

  return c.json({ token });
});
export default auth;
