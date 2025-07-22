import { User } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

import { devError } from "@/lib/dev-utils";
import { db } from "@/lib/firebase";
import { UserStatus } from "@/types";

export interface UpdateUserStatusResult {
  success: boolean;
  error?: string;
}

/**
 * Updates a user's status in Firestore
 * @param user - The Firebase Auth user object
 * @param newStatus - The new status to set for the user
 * @returns Promise<UpdateUserStatusResult> - Object containing success status and error message if any
 */
export const updateUserStatus = async (
  user: User | null,
  newStatus: UserStatus
): Promise<UpdateUserStatusResult> => {
  if (!user) {
    const errorMessage = "No user available to update status";
    devError(errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
      status: newStatus,
    });

    return {
      success: true,
      error: undefined,
    };
  } catch (error) {
    const errorMessage = `Error updating user status: ${error instanceof Error ? error.message : String(error)}`;
    devError(errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
};
