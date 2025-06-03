"use server";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { auth, signIn, signOut } from "@/auth";
import { signInFormSchema, signUpFormSchema } from "../validator";
import { hashSync } from "bcrypt-ts-edge";
import prismaDb from "../prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signInWithCredentials(formData: FormData) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", user);
    revalidatePath("/", "layout");
    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return { success: false, message: "Invalid email or password", error };
  }
}

export async function signOutUser() {
  await signOut();
  revalidatePath("/", "layout");
}

export async function signUp(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      confirmPassword: formData.get("confirmPassword"),
      password: formData.get("password"),
    });

    const plainPassword = user.password;

    user.password = hashSync(user.password, 10);

    await prismaDb.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
    });

    return { success: true, message: "User created successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      success: false,
      message: "Something went wrong",
    };
  }
}

export async function getCurrentUser() {
  try {
    const session = await auth();

    if (!session?.user) {
      redirect("/sign-in");
    }
    return session.user;
  } catch (error) {
    console.log("Something went wrong", error);
    redirect("/sign-in");
  }
}
