'use server'

import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../lib/prisma"; // путь к файлу prisma.ts

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { email, name, phone, password } = req.body as {
        email: string;
        name: string;
        phone?: string;
        password: string;
      };

      const user = await prisma.user.create({
        data: { email, name, phone, password },
      });

      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Ошибка при создании пользователя" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
