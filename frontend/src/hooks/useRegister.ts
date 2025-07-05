import { useMutation } from "@tanstack/react-query";
import { register } from "../services/authService";

export const useRegister = () => {

    return useMutation({
        mutationFn: register
    });
};