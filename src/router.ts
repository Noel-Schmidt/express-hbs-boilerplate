import { Router } from "express";

export const defaultRouter = Router();
defaultRouter.get("/", (req, res) => {
    res.render("index");
})
