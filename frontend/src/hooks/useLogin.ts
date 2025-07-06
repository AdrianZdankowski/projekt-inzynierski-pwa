import { useMutation } from "@tanstack/react-query";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export const useLogin = () => {
    const {setTokens} = useAuth();

    return useMutation({
        mutationFn: login,
        onSuccess: ({
            accessToken, refreshToken
        }) => {
            setTokens({accessToken, refreshToken});
        }
    });
};