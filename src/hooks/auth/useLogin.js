import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import { setClientData, setUserType } from "../../redux/slices/clientData";
import * as yup from "yup";
import axiosInstance from "../../utils/axiosInstance";

export default function useLogin(t) {
  const [, setCookie] = useCookies(["token"]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const schema = yup.object().shape({
    phone: yup
      .string()
      .required(t("validation.required"))
      .matches(/^\d+$/, t("validation.numbersOnly")),
    password: yup
      .string()
      .required(t("validation.required"))
      .min(6, t("validation.min", { min: 6 })),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const { mutate: submitLogin, isPending } = useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post("/user/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.code === 200) {
        toast.success(t("auth.loginSuccess"));

        setCookie("token", data.data?.token, {
          path: "/",
          secure: true,
          sameSite: "Strict",
        });

        dispatch(setClientData(data.data));
        dispatch(setUserType(data?.data?.type));
        navigate("/");
      } else {
        toast.error(data?.message || t("auth.loginFailed"));
      }
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message || t("auth.somethingWentWrong")
      );
    },
  });

  return {
    register,
    handleSubmit: handleSubmit(submitLogin),
    errors,
    isLoading: isPending,
  };
}
