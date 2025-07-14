import { useMutation } from "@tanstack/react-query";
import { logout } from "../services/authService";

export const useLogoutRequest = () => {

    return useMutation({
        mutationFn: logout,
    });
};