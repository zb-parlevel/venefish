import {onDocumentWritten} from "firebase-functions/v2/firestore";
import {getAuth} from "firebase-admin/auth";
import {initializeApp} from "firebase-admin/app";

initializeApp();

export const setUserRole = onDocumentWritten(
  "users/{userId}",
  async (event) => {
    const userId = event.params.userId;
    const newData = event.data?.after?.data();
    const oldData = event.data?.before?.data();

    // If document was deleted or role hasn't changed, do nothing
    if (!newData || (oldData && oldData.role === newData.role)) {
      return null;
    }

    // Set custom claim based on role
    await getAuth().setCustomUserClaims(userId, {
      role: newData.role || "staff",
    });

    return null;
  },
);
