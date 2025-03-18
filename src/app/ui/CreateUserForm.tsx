"use client";

import { createUser } from "@/app/lib/actions";
import { useActionState } from "react";
import { useFormState } from "react-dom";

type State = {
  errors?: {
    email?: string[];
    name?: string[];
    phone?: string[];
    password?: string[];
  };
  message?: string | null;
};

const initialState: State = { message: null, errors: {} };

export default function CreateUserForm() {
  const [state, dispatch] = useActionState(createUser, initialState);

  return (
    <form action={dispatch} className="space-y-4">
      <div>
        <label>Email:</label>
        <input name="email" type="email" className="border p-2 w-full" />
        {state.errors?.email?.map((err) => (
          <p key={err} className="text-red-500">{err}</p>
        ))}
      </div>

      <div>
        <label>Name:</label>
        <input name="name" type="text" className="border p-2 w-full" />
        {state.errors?.name?.map((err) => (
          <p key={err} className="text-red-500">{err}</p>
        ))}
      </div>

      <div>
        <label>Phone:</label>
        <input name="phone" type="text" className="border p-2 w-full" />
      </div>

      <div>
        <label>Password:</label>
        <input name="password" type="password" className="border p-2 w-full" />
        {state.errors?.password?.map((err) => (
          <p key={err} className="text-red-500">{err}</p>
        ))}
      </div>

      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Create User
      </button>

      {state.message && <p className="text-red-500">{state.message}</p>}
    </form>
  );
}
