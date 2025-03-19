"use server";

// import { z } from "zod";
// import prisma from "../lib/prisma";


// const UserSchema = z.object({
//   email: z.string().email({ message: "Invalid email format." }),
//   name: z.string().min(1, { message: "Name is required." }),
//   phone: z.string().optional(),
//   password: z.string().min(6, { message: "Password must be at least 6 characters." }),
// });

// export async function createUser(state: any, formData: FormData) {
//     const validatedFields = UserSchema.safeParse({
//       email: formData.get("email"),
//       name: formData.get("name"),
//       phone: formData.get("phone"),
//       password: formData.get("password"),
//     });
  
//     if (!validatedFields.success) {
//       return {
//         errors: validatedFields.error.flatten().fieldErrors,
//         message: "Invalid fields. Failed to create user.",
//       };
//     }
  
//     try {
//       await prisma.user.create({
//         data: validatedFields.data,
//       });
  
//       // ✅ Если все успешно, возвращаем пустой объект
//       return { message: null };
//     } catch (error) {
//       console.error("Database Error:", error); // Логируем ошибку
  
//       return {
//         errors: {},
//         message: "Database Error: Failed to create user.",
//       };
//     }
// }

