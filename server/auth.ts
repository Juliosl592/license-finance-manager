import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { sendWelcomeEmail, sendNewUserAdminNotification } from "./email";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  if (!stored || !stored.includes(".")) {
    // Direct comparison for passwords that don't follow the hash.salt format
    // This is for development purposes only; in production all passwords should be hashed
    return supplied === stored;
  }
  
  const [hashed, salt] = stored.split(".");
  if (!salt) {
    console.error("Missing salt in stored password");
    return false;
  }
  
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "license-pricing-app-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Email already exists");
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        isAdmin: false, // Forzar que todos los nuevos registros sean usuarios normales
      });

      // Enviar correo de bienvenida al usuario
      sendWelcomeEmail(user.name, user.username)
        .then(success => {
          console.log(`Correo de bienvenida ${success ? 'enviado' : 'falló'} para: ${user.username}`);
        })
        .catch(error => {
          console.error('Error al enviar correo de bienvenida:', error);
        });

      // Notificar a los administradores sobre el nuevo usuario
      try {
        const admins = await storage.getAdminUsers();
        if (admins && admins.length > 0) {
          admins.forEach(admin => {
            sendNewUserAdminNotification(
              admin.username,
              user.name,
              user.username,
              user.company || 'No especificada'
            ).catch(error => {
              console.error(`Error al enviar notificación a admin ${admin.username}:`, error);
            });
          });
        }
      } catch (error) {
        console.error('Error al obtener admins para notificación:', error);
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  app.post("/api/change-password", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { currentPassword, newPassword } = req.body;
    const user = await storage.getUserByUsername(req.user.username);

    if (!user || !(await comparePasswords(currentPassword, user.password))) {
      return res.status(401).json({ message: "Contraseña actual incorrecta" });
    }

    const hashedPassword = await hashPassword(newPassword);
    await storage.updateUserPassword(user.id, hashedPassword);
    
    res.status(200).json({ message: "Contraseña actualizada correctamente" });
  });
}
