import express from "express";
import * as userController from "../controllers/userController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// GET all users
// router.get("/", async (req: express.Request, res: express.Response) => {
//   return userController.getAllUsers(req, res);
// });

// // GET a single user
// router.get("/:id", async (req: express.Request, res: express.Response) => {
//   return userController.getUserById(req, res);
// });

// // POST a new user
// router.post("/", userController.createUser);

// // PUT update a user
// router.put("/:id", userController.updateUser);

// // DELETE a user
// router.delete("/:id", userController.deleteUser);

// Protected routes (require authentication)
router.get("/profile", authenticateToken, (req, res) => {
  void userController.getProfile(req, res);
});

router.put("/profile", authenticateToken, (req, res) => {
  void userController.updateProfile(req, res);
});

router.put("/password", authenticateToken, (req, res) => {
  void userController.changePassword(req, res);
});

router.delete("/account", authenticateToken, (req, res) => {
  void userController.deleteAccount(req, res);
});

export default router;
